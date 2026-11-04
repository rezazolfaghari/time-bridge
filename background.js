/**
 * Background Service Worker for Clockify to GitLab Extension
 * Handles GitLab API requests, duplicate checks, and time syncing
 */

importScripts('i18n.js', 'config.js');

function parseDurationToSeconds(str) {
  if (!str) return 0;
  const parts = str.trim().split(':').map((p) => parseInt(p, 10));
  if (parts.length === 3) {
    return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
  }
  if (parts.length === 2) {
    return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60;
  }
  return 0;
}

/**
 * Get stored or default settings
 */
async function getEffectiveConfig() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(
      {
        language: typeof GITLAB_CONFIG !== 'undefined' ? GITLAB_CONFIG.language : 'en',
        gitlabHost: typeof GITLAB_CONFIG !== 'undefined' ? GITLAB_CONFIG.defaultHost : 'https://gitlab.com',
        gitlabToken: typeof GITLAB_CONFIG !== 'undefined' ? GITLAB_CONFIG.defaultToken : '',
        includeSeconds: typeof GITLAB_CONFIG !== 'undefined' ? GITLAB_CONFIG.includeSeconds : true,
        roundMinutes: typeof GITLAB_CONFIG !== 'undefined' ? GITLAB_CONFIG.roundMinutes : false
      },
      (items) => {
        const host = (items.gitlabHost || (typeof GITLAB_CONFIG !== 'undefined' ? GITLAB_CONFIG.defaultHost : '') || 'https://gitlab.com').trim();
        const token = (items.gitlabToken || (typeof GITLAB_CONFIG !== 'undefined' ? GITLAB_CONFIG.defaultToken : '') || '').trim();
        const language = items.language || (typeof GITLAB_CONFIG !== 'undefined' ? GITLAB_CONFIG.language : 'en') || 'en';
        resolve({
          ...items,
          language,
          gitlabHost: host,
          gitlabToken: token
        });
      }
    );
  });
}

/**
 * Test connection to GitLab API
 */
async function handleTestConnection(hostParam, tokenParam, langParam) {
  const config = await getEffectiveConfig();
  const host = (hostParam || config.gitlabHost || '').replace(/\/+$/, '');
  const token = (tokenParam || config.gitlabToken || '').trim();
  const lang = langParam || config.language || 'en';

  if (!host) {
    return {
      success: false,
      message: typeof I18N !== 'undefined' ? I18N.t('noHost', lang) : 'GitLab host URL is required.'
    };
  }
  if (!token) {
    return {
      success: false,
      message: typeof I18N !== 'undefined' ? I18N.t('noToken', lang) : 'Personal Access Token is required.'
    };
  }

  try {
    const res = await fetch(`${host}/api/v4/user`, {
      headers: {
        'PRIVATE-TOKEN': token
      }
    });

    if (res.ok) {
      const user = await res.json();
      const msg = typeof I18N !== 'undefined'
        ? I18N.t('connSuccess', lang, { name: user.name, username: user.username })
        : `Connected: Welcome ${user.name} (@${user.username})`;
      return {
        success: true,
        message: msg
      };
    } else {
      const msg = typeof I18N !== 'undefined'
        ? I18N.t('connAuthError', lang, { status: res.status })
        : `Authentication error (${res.status}): Please check token and URL.`;
      return {
        success: false,
        message: msg
      };
    }
  } catch (err) {
    const msg = typeof I18N !== 'undefined'
      ? I18N.t('connError', lang, { error: err.message })
      : `Connection error: ${err.message}`;
    return {
      success: false,
      message: msg
    };
  }
}

/**
 * Check if a time spend already exists on GitLab and sync if not
 */
async function handleSyncSpend(data) {
  const config = await getEffectiveConfig();
  const lang = data.lang || config.language || 'en';

  const host = (data.host || config.gitlabHost || '').replace(/\/+$/, '');
  const token = (config.gitlabToken || '').trim();
  const { projectPath, iid, gitlabDuration, rawDuration, dateStr } = data;

  if (!token) {
    return {
      success: false,
      error: 'NO_TOKEN',
      message: typeof I18N !== 'undefined'
        ? I18N.t('noToken', lang)
        : 'GitLab access token is missing.'
    };
  }

  if (!projectPath || !iid) {
    return {
      success: false,
      error: 'INVALID_ISSUE',
      message: typeof I18N !== 'undefined'
        ? I18N.t('noProjectPathOrIssue', lang)
        : 'GitLab project path or Issue ID not found.'
    };
  }

  const encodedProject = encodeURIComponent(projectPath);
  const targetSeconds = parseDurationToSeconds(rawDuration);
  const occurrence = data.occurrenceIndex || 1;

  // -------------------------------------------------------------
  // Step 1: GraphQL Timelogs duplicate check
  // -------------------------------------------------------------
  try {
    const graphqlQuery = `
      query GetIssueTimelogs($fullPath: ID!, $iid: String!) {
        project(fullPath: $fullPath) {
          issue(iid: $iid) {
            timelogs {
              nodes {
                timeSpent
                spentAt
                summary
                user { username }
              }
            }
          }
        }
      }
    `;

    const gqlRes = await fetch(`${host}/api/graphql`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: graphqlQuery,
        variables: { fullPath: projectPath, iid: String(iid) }
      })
    });

    if (gqlRes.ok) {
      const gqlData = await gqlRes.json();
      const nodes = gqlData?.data?.project?.issue?.timelogs?.nodes || [];

      const matchingNodes = nodes.filter((n) => {
        if (!n.spentAt) return false;
        const matchesDate = n.spentAt.startsWith(dateStr);
        if (!matchesDate) return false;

        // Tolerance of 65s for round-off difference
        if (targetSeconds > 0 && Math.abs(n.timeSpent - targetSeconds) <= 65) {
          return true;
        }
        return n.timeSpent === targetSeconds;
      });

      if (matchingNodes.length >= occurrence) {
        return {
          success: false,
          alreadyExists: true,
          message: typeof I18N !== 'undefined'
            ? I18N.t('alreadyRecordedInIssue', lang, { dur: gitlabDuration, date: dateStr })
            : `Time (${gitlabDuration}) for ${dateStr} already recorded in this issue.`
        };
      }
    }
  } catch (gqlErr) {
    console.warn('[GitLab Syncer] GraphQL timelog check notice:', gqlErr);
  }

  // -------------------------------------------------------------
  // Step 2: REST Notes API duplicate check (system notes)
  // -------------------------------------------------------------
  try {
    const notesRes = await fetch(
      `${host}/api/v4/projects/${encodedProject}/issues/${iid}/notes?per_page=100`,
      {
        headers: {
          'PRIVATE-TOKEN': token
        }
      }
    );

    if (notesRes.ok) {
      const notes = await notesRes.json();
      const matchingNotes = notes.filter((n) => {
        if (!n.system || !n.body) return false;
        const b = n.body.toLowerCase();
        const hasSpend = b.includes('time spent') || b.includes('added');
        const hasDate = b.includes(dateStr);
        if (hasSpend && hasDate) {
          if (b.includes(gitlabDuration.toLowerCase())) return true;
          const tokens = gitlabDuration.toLowerCase().split(' ');
          if (tokens.every((tok) => b.includes(tok))) return true;
        }
        return false;
      });

      if (matchingNotes.length >= occurrence) {
        return {
          success: false,
          alreadyExists: true,
          message: typeof I18N !== 'undefined'
            ? I18N.t('alreadyRecordedInIssue', lang, { dur: gitlabDuration, date: dateStr })
            : `Time (${gitlabDuration}) for ${dateStr} already recorded in issue notes.`
        };
      }
    }
  } catch (notesErr) {
    console.warn('[GitLab Syncer] Notes check warning:', notesErr);
  }

  // -------------------------------------------------------------
  // Step 3: Record spend via GitLab Quick Action /spend
  // -------------------------------------------------------------
  try {
    const spendCommand = `/spend ${gitlabDuration} ${dateStr}`;
    const addRes = await fetch(
      `${host}/api/v4/projects/${encodedProject}/issues/${iid}/notes`,
      {
        method: 'POST',
        headers: {
          'PRIVATE-TOKEN': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ body: spendCommand })
      }
    );

    if (addRes.ok) {
      return {
        success: true,
        message: typeof I18N !== 'undefined'
          ? I18N.t('successfullySyncedToIssue', lang, { iid })
          : `Successfully recorded in GitLab Issue #${iid}!`,
        command: spendCommand,
        issueIid: iid
      };
    } else {
      const errText = await addRes.text();
      let errMsg = errText;
      try {
        const errJson = JSON.parse(errText);
        errMsg = errJson.message || errJson.error || errText;
      } catch (_) {}
      return {
        success: false,
        error: 'API_ERROR',
        status: addRes.status,
        message: `GitLab API Error (${addRes.status}): ${errMsg}`
      };
    }
  } catch (addErr) {
    return {
      success: false,
      error: 'NETWORK_ERROR',
      message: `Network error: ${addErr.message}`
    };
  }
}

// Runtime message listener for content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'syncSpend') {
    handleSyncSpend(request.data)
      .then(sendResponse)
      .catch((err) =>
        sendResponse({ success: false, error: 'UNKNOWN', message: err.message })
      );
    return true; // Keep message channel open for async response
  }

  if (request.action === 'testConnection') {
    handleTestConnection(request.data?.host, request.data?.token, request.data?.lang)
      .then(sendResponse)
      .catch((err) =>
        sendResponse({ success: false, message: err.message })
      );
    return true;
  }
});
