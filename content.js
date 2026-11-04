/**
 * Clockify to GitLab /spend Copier & Direct Syncer - Content Script
 * Glassmorphic & Modern UI with Multi-language (i18n) Support
 */

(function () {
  'use strict';

  // Config with fallback to config.js
  let config = {
    language: (typeof GITLAB_CONFIG !== 'undefined' && GITLAB_CONFIG.language ? GITLAB_CONFIG.language : 'en'),
    gitlabHost: (typeof GITLAB_CONFIG !== 'undefined' ? GITLAB_CONFIG.defaultHost : 'https://gitlab.com'),
    gitlabToken: (typeof GITLAB_CONFIG !== 'undefined' ? GITLAB_CONFIG.defaultToken : ''),
    includeSeconds: (typeof GITLAB_CONFIG !== 'undefined' ? GITLAB_CONFIG.includeSeconds : true),
    roundMinutes: (typeof GITLAB_CONFIG !== 'undefined' ? GITLAB_CONFIG.roundMinutes : false),
    customCommand: (typeof GITLAB_CONFIG !== 'undefined' ? GITLAB_CONFIG.customCommand : '/spend')
  };

  // Load configuration from chrome storage if available
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
    chrome.storage.sync.get(config, (items) => {
      if (items) {
        config = { ...config, ...items };
      }
    });

    // Listen for setting changes in popup
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'sync') {
        let langChanged = false;
        for (const [key, { newValue }] of Object.entries(changes)) {
          config[key] = newValue;
          if (key === 'language') langChanged = true;
        }
        if (langChanged) {
          processAllEntries();
        }
      }
    });
  }

  // SVGs
  const GITLAB_COPY_SVG = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 380" class="gitlab-icon" width="15" height="15">
      <path fill="#e24329" d="m190.07 359.18 42.86-131.91h-85.72l42.86 131.91z"/>
      <path fill="#fc6d26" d="m190.07 359.18-42.86-131.91h-89.8l132.66 131.91z"/>
      <path fill="#fca326" d="m57.41 227.27-24.58 75.64a10.84 10.84 0 0 0 3.94 12.13l153.3 104.14-132.66-191.91z"/>
      <path fill="#e24329" d="m57.41 227.27h89.8l-42-129.24a10.84 10.84 0 0 0-20.61 0l-27.19 129.24z"/>
      <path fill="#fc6d26" d="m190.07 359.18 42.86-131.91h89.8l-132.66 131.91z"/>
      <path fill="#fca326" d="m322.73 227.27 24.58 75.64a10.84 10.84 0 0 1-3.94 12.13l-153.3 104.14 132.66-191.91z"/>
      <path fill="#e24329" d="m322.73 227.27h-89.8l42-129.24a10.84 10.84 0 0 1 20.61 0l27.19 129.24z"/>
    </svg>
  `;

  // Cloud/Upload Direct Sync SVG
  const GITLAB_SYNC_SVG = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#fc6d26" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" class="sync-icon">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="17 8 12 3 7 8"></polyline>
      <line x1="12" y1="3" x2="12" y2="15"></line>
    </svg>
  `;

  // Checkmark SVG
  const CHECKMARK_SVG = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="checkmark-icon" width="15" height="15" fill="none" stroke="#10b981" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  `;

  // Warning SVG (Already exists)
  const WARNING_SVG = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="warning-icon" width="15" height="15" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="9"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
  `;

  // Spinner SVG
  const SPINNER_SVG = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#fc6d26" stroke-width="2.5" class="cl-spin">
      <circle cx="12" cy="12" r="9" stroke="rgba(252, 109, 38, 0.25)"></circle>
      <path d="M12 3a9 9 0 0 1 9 9" stroke="#fc6d26" stroke-linecap="round"></path>
    </svg>
  `;

  /**
   * Format Date object into YYYY-MM-DD
   */
  function formatDate(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Parse Clockify date header into YYYY-MM-DD
   */
  function parseClockifyDate(rawText, refDate = new Date()) {
    if (!rawText) return formatDate(refDate);
    const text = rawText.trim();
    const lower = text.toLowerCase();

    if (lower === 'today') return formatDate(refDate);
    if (lower === 'yesterday') {
      const y = new Date(refDate);
      y.setDate(y.getDate() - 1);
      return formatDate(y);
    }

    // ISO format: YYYY-MM-DD
    const isoMatch = text.match(/(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
    if (isoMatch) {
      const y = parseInt(isoMatch[1], 10);
      const m = String(parseInt(isoMatch[2], 10)).padStart(2, '0');
      const d = String(parseInt(isoMatch[3], 10)).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }

    // DD/MM/YYYY
    const ddmmyyyy = text.match(/(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
    if (ddmmyyyy) {
      const d = String(parseInt(ddmmyyyy[1], 10)).padStart(2, '0');
      const m = String(parseInt(ddmmyyyy[2], 10)).padStart(2, '0');
      const y = parseInt(ddmmyyyy[3], 10);
      return `${y}-${m}-${d}`;
    }

    const months = {
      jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3,
      apr: 4, april: 4, may: 5, jun: 6, june: 6, jul: 7, july: 7,
      aug: 8, august: 8, sep: 9, september: 9, oct: 10, october: 10,
      nov: 11, november: 11, dec: 12, december: 12
    };

    // "Wed, Oct 21" or "Oct 21, 2026"
    const m1 = text.match(/(?:[a-zA-Z]+,?\s+)?([a-zA-Z]+)\s+(\d{1,2})(?:,?\s+(\d{4}))?/);
    if (m1 && months[m1[1].toLowerCase()]) {
      const monthNum = months[m1[1].toLowerCase()];
      const day = parseInt(m1[2], 10);
      let year = m1[3] ? parseInt(m1[3], 10) : refDate.getFullYear();
      if (!m1[3]) {
        const currentMonth = refDate.getMonth() + 1;
        if (monthNum - currentMonth > 6) year -= 1;
      }
      return `${year}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }

    // "21 Oct" or "Wed, 21 Oct 2026"
    const m2 = text.match(/(?:[a-zA-Z]+,?\s+)?(\d{1,2})\s+([a-zA-Z]+)(?:,?\s+(\d{4}))?/);
    if (m2 && months[m2[2].toLowerCase()]) {
      const day = parseInt(m2[1], 10);
      const monthNum = months[m2[2].toLowerCase()];
      let year = m2[3] ? parseInt(m2[3], 10) : refDate.getFullYear();
      if (!m2[3]) {
        const currentMonth = refDate.getMonth() + 1;
        if (monthNum - currentMonth > 6) year -= 1;
      }
      return `${year}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }

    const parsed = Date.parse(text);
    if (!isNaN(parsed)) return formatDate(new Date(parsed));

    return formatDate(refDate);
  }

  /**
   * Convert duration string (e.g. "01:51:11") to GitLab spend format (e.g. "1h 51m 11s")
   */
  function formatGitLabDuration(rawDuration, includeSeconds = true, roundMinutes = false) {
    if (!rawDuration) return '0m';
    const str = rawDuration.trim();

    if (str.includes(':')) {
      const parts = str.split(':').map((p) => parseInt(p, 10));
      let h = 0, m = 0, s = 0;

      if (parts.length === 3) {
        h = parts[0] || 0;
        m = parts[1] || 0;
        s = parts[2] || 0;
      } else if (parts.length === 2) {
        h = parts[0] || 0;
        m = parts[1] || 0;
      } else if (parts.length === 1) {
        m = parts[0] || 0;
      }

      if (!includeSeconds) {
        if (roundMinutes && s >= 30) {
          m += 1;
          if (m >= 60) {
            h += 1;
            m -= 60;
          }
        }
        s = 0;
      }

      const tokens = [];
      if (h > 0) tokens.push(`${h}h`);
      if (m > 0) tokens.push(`${m}m`);
      if (includeSeconds && s > 0) tokens.push(`${s}s`);

      if (tokens.length === 0) return '0m';
      return tokens.join(' ');
    }

    const decMatch = str.match(/^([0-9.]+)\s*h?$/i);
    if (decMatch) {
      const totalHours = parseFloat(decMatch[1]);
      const totalMinutes = Math.round(totalHours * 60);
      const h = Math.floor(totalMinutes / 60);
      const m = totalMinutes % 60;
      const tokens = [];
      if (h > 0) tokens.push(`${h}h`);
      if (m > 0) tokens.push(`${m}m`);
      return tokens.length ? tokens.join(' ') : '0m';
    }

    return str;
  }

  /**
   * Find the date string for an entry row
   */
  function extractDateForEntry(entryEl) {
    const card = entryEl.closest('.cl-card, [class*="cl-card"]');
    if (card) {
      const header = card.querySelector('entry-group-header, .cl-card-header');
      if (header) {
        const span = header.querySelector('.cl-h6 span') || header.querySelector('.cl-h6');
        if (span && span.textContent.trim()) {
          return parseClockifyDate(span.textContent.trim());
        }
      }
    }

    let current = entryEl.closest('time-tracker-entry, parent-tracker-entry, .cl-card') || entryEl;
    while (current) {
      if (current.previousElementSibling) {
        current = current.previousElementSibling;
        const header = current.matches('entry-group-header')
          ? current
          : current.querySelector('entry-group-header, .cl-card-header');
        if (header) {
          const span = header.querySelector('.cl-h6 span') || header.querySelector('.cl-h6');
          if (span && span.textContent.trim()) {
            return parseClockifyDate(span.textContent.trim());
          }
        }
      } else {
        current = current.parentElement;
      }
    }

    return formatDate(new Date());
  }

  /**
   * Extract duration from an entry element
   */
  function extractDurationForEntry(entryEl) {
    const durationInput =
      entryEl.querySelector('.cl-entry-duration input') ||
      entryEl.querySelector('input[aria-label="Duration"]') ||
      entryEl.querySelector('.cl-input-time-picker-sum');

    if (durationInput) {
      const val = durationInput.value || durationInput.getAttribute('value') || '';
      if (val.trim()) return val.trim();
    }

    const durationContainer = entryEl.querySelector('.cl-entry-duration');
    if (durationContainer) {
      const text = durationContainer.textContent.trim();
      const match = text.match(/\b\d{1,2}:\d{2}(?::\d{2})?\b/);
      if (match) return match[0];
    }

    return '00:00:00';
  }

  /**
   * Extract description text
   */
  function extractDescription(entryEl) {
    const descEl =
      entryEl.querySelector('[data-cy="time-entry-description"]') ||
      entryEl.querySelector('.cl-input-description') ||
      entryEl.querySelector('.cl-fake-input');

    if (descEl) {
      return (descEl.value || descEl.textContent || '').trim();
    }
    return '';
  }

  /**
   * Parse GitLab Issue or Work Item URL from text
   */
  function parseGitLabIssueUrl(text) {
    if (!text) return null;
    const regex = /(https?:\/\/[^\/\s]+)\/([^\/\s]+(?:\/[^\/\s]+)+?)(?:\/-)?\/(?:work_items|issues)\/(\d+)/i;
    const match = text.match(regex);
    if (match) {
      return {
        host: match[1],
        projectPath: match[2],
        iid: match[3]
      };
    }
    return null;
  }

  /**
   * Glassmorphic Toast notification (supports RTL/LTR dynamically)
   */
  let toastTimeout = null;
  function showToast(message, type = 'success', extra = '') {
    let toast = document.getElementById('cl-gitlab-toast-notification');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'cl-gitlab-toast-notification';
      document.body.appendChild(toast);
    }

    const isRtl = (typeof I18N !== 'undefined' && I18N.getDir(config.language) === 'rtl');
    toast.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
    toast.className = `cl-gitlab-toast toast-${type}`;

    let iconSymbol = '🦊';
    if (type === 'success') iconSymbol = '✓';
    if (type === 'warning') iconSymbol = '!';
    if (type === 'error') iconSymbol = '✕';

    let extraHtml = extra ? `<div class="cl-gitlab-toast-extra">${extra}</div>` : '';

    toast.innerHTML = `
      <div class="cl-gitlab-toast-icon-badge">${iconSymbol}</div>
      <div style="flex-grow: 1;">
        <div style="font-weight: 600; font-size: 13.5px;">${message}</div>
        ${extraHtml}
      </div>
    `;

    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 4000);
  }

  /**
   * Copy text to clipboard reliably
   */
  async function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        console.warn('[Clockify-GitLab] navigator.clipboard fallback:', err);
      }
    }

    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    } catch (e) {
      return false;
    }
  }

  /**
   * Handle Click on Button 1: Copy to Clipboard
   */
  async function handleCopyButtonClick(e, entryEl, btn) {
    e.preventDefault();
    e.stopPropagation();

    const rawDuration = extractDurationForEntry(entryEl);
    const gitlabDuration = formatGitLabDuration(
      rawDuration,
      config.includeSeconds,
      config.roundMinutes
    );
    const dateStr = extractDateForEntry(entryEl);
    const description = extractDescription(entryEl);

    const command = `${config.customCommand || '/spend'} ${gitlabDuration} ${dateStr}`;

    const success = await copyToClipboard(command);
    if (success) {
      btn.classList.add('copied');
      btn.innerHTML = CHECKMARK_SVG;

      const issueDetails = parseGitLabIssueUrl(description);
      const extra = issueDetails
        ? `GitLab Issue #${issueDetails.iid}`
        : (description ? description.substring(0, 38) : '');

      const prefix = typeof I18N !== 'undefined'
        ? I18N.t('toastCopied', config.language)
        : 'Command copied to clipboard:';

      showToast(`${prefix} <span class="cl-gitlab-toast-cmd">${command}</span>`, 'success', extra);
    }
  }

  /**
   * Handle Click on Button 2: Direct Sync to GitLab API
   */
  async function handleSyncButtonClick(e, entryEl, btn) {
    e.preventDefault();
    e.stopPropagation();

    if (btn.classList.contains('loading')) return;

    const description = extractDescription(entryEl);
    const issueDetails = parseGitLabIssueUrl(description);

    if (!issueDetails) {
      const msg = typeof I18N !== 'undefined'
        ? I18N.t('syncNoLinkTooltip', config.language)
        : 'No GitLab Issue or Work Item link found in description.';
      showToast(msg, 'warning');
      return;
    }

    const rawDuration = extractDurationForEntry(entryEl);
    const gitlabDuration = formatGitLabDuration(
      rawDuration,
      config.includeSeconds,
      config.roundMinutes
    );
    const dateStr = extractDateForEntry(entryEl);

    // Show loading state
    btn.classList.add('loading');
    btn.innerHTML = SPINNER_SVG;

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'syncSpend',
        data: {
          lang: config.language,
          host: issueDetails.host || config.gitlabHost,
          projectPath: issueDetails.projectPath,
          iid: issueDetails.iid,
          gitlabDuration,
          rawDuration,
          dateStr
        }
      });

      btn.classList.remove('loading');

      if (!response) {
        const noWorkerMsg = typeof I18N !== 'undefined'
          ? I18N.t('toastNoWorker', config.language)
          : 'No response from extension background worker.';
        showToast(noWorkerMsg, 'error');
        btn.innerHTML = GITLAB_SYNC_SVG;
        return;
      }

      if (response.alreadyExists) {
        // Already exists on GitLab
        btn.classList.add('synced');
        btn.classList.add('already-exists');
        btn.innerHTML = WARNING_SVG;
        btn.title = typeof I18N !== 'undefined'
          ? I18N.t('alreadyExistsTooltip', config.language, { iid: issueDetails.iid })
          : `Already recorded in Issue #${issueDetails.iid}`;
        showToast(
          response.message || (typeof I18N !== 'undefined' ? I18N.t('toastAlreadyExists', config.language, { iid: issueDetails.iid }) : 'Already recorded.'),
          'warning',
          `<span class="cl-gitlab-toast-cmd">/spend ${gitlabDuration} ${dateStr}</span>`
        );
      } else if (response.success) {
        // Successfully synced
        btn.classList.add('synced');
        btn.classList.remove('already-exists');
        btn.innerHTML = CHECKMARK_SVG;
        btn.title = typeof I18N !== 'undefined'
          ? I18N.t('successRecordedTooltip', config.language, { iid: issueDetails.iid })
          : `Successfully recorded in Issue #${issueDetails.iid}`;
        showToast(
          response.message || (typeof I18N !== 'undefined' ? I18N.t('toastSuccess', config.language, { iid: issueDetails.iid }) : 'Successfully recorded!'),
          'success',
          `<span class="cl-gitlab-toast-cmd">${response.command}</span>`
        );
      } else {
        // Error from GitLab
        btn.innerHTML = GITLAB_SYNC_SVG;
        showToast(
          response.message || 'Error syncing time to GitLab.',
          'error',
          response.error === 'NO_TOKEN' ? (typeof I18N !== 'undefined' ? I18N.t('noToken', config.language) : 'Please set GitLab token.') : ''
        );
      }
    } catch (err) {
      btn.classList.remove('loading');
      btn.innerHTML = GITLAB_SYNC_SVG;
      const errMsg = typeof I18N !== 'undefined'
        ? I18N.t('toastCommError', config.language, { err: err.message })
        : `Extension communication error: ${err.message}`;
      showToast(errMsg, 'error');
    }
  }

  /**
   * Hover preview for copy button
   */
  function handleCopyButtonHover(entryEl, btn) {
    const rawDuration = extractDurationForEntry(entryEl);
    const gitlabDuration = formatGitLabDuration(
      rawDuration,
      config.includeSeconds,
      config.roundMinutes
    );
    const dateStr = extractDateForEntry(entryEl);
    const command = `${config.customCommand || '/spend'} ${gitlabDuration} ${dateStr}`;
    const isCopied = btn.classList.contains('copied');
    const label = isCopied
      ? (typeof I18N !== 'undefined' ? I18N.t('copiedTooltip', config.language) : 'Copied!')
      : (typeof I18N !== 'undefined' ? I18N.t('copyTooltip', config.language) : 'Copy command');
    btn.title = `${label}: ${command}`;
  }

  /**
   * Hover preview for sync button
   */
  function handleSyncButtonHover(entryEl, btn) {
    if (btn.classList.contains('synced')) {
      btn.title = typeof I18N !== 'undefined'
        ? I18N.t('successRecordedTooltip', config.language, { iid: '' })
        : 'Already recorded in GitLab';
      return;
    }
    const description = extractDescription(entryEl);
    const issueDetails = parseGitLabIssueUrl(description);
    if (issueDetails) {
      btn.title = typeof I18N !== 'undefined'
        ? I18N.t('syncDirectTooltip', config.language, { iid: issueDetails.iid })
        : `Sync directly to GitLab Issue #${issueDetails.iid} (API)`;
    } else {
      btn.title = typeof I18N !== 'undefined'
        ? I18N.t('syncNoLinkTooltip', config.language)
        : 'Sync to GitLab (Requires Issue link in description)';
    }
  }

  /**
   * Check if element is a Parent / Group total row (which aggregates multiple entries)
   */
  function isParentTrackerEntry(el) {
    if (!el) return false;
    if (el.tagName && el.tagName.toLowerCase() === 'parent-tracker-entry') return true;
    if (el.closest && el.closest('parent-tracker-entry') !== null) return true;
    if (el.classList && el.classList.contains('cl-parent-collapse')) return true;
    if (
      el.querySelector &&
      (el.querySelector('.cl-badge-same-entries') !== null ||
        el.querySelector('input[id$="_PARENT"]') !== null)
    ) {
      return true;
    }
    return false;
  }

  /**
   * Inject buttons wrapped in a Glassmorphic Pill container into a single Clockify entry row
   */
  function injectButtonsIntoEntry(entryEl) {
    // NEVER inject buttons into parent/grouped summary rows
    if (isParentTrackerEntry(entryEl)) {
      const existing = entryEl.querySelector('.cl-gitlab-glass-pill, .cl-gitlab-spend-btn');
      if (existing) existing.remove();
      return;
    }

    // Avoid double injection
    if (entryEl.querySelector('.cl-gitlab-glass-pill') || entryEl.querySelector('.cl-gitlab-spend-btn')) {
      return;
    }

    const durationEl = entryEl.querySelector('.cl-entry-duration');
    const actionsContainer = entryEl.querySelector('.cl-timetracker-list-actions');

    if (!durationEl && !actionsContainer) {
      return;
    }

    // Glass Capsule Pill Container
    const pill = document.createElement('div');
    pill.className = 'cl-component-divided-left cl-gitlab-glass-pill';

    // Button 1: Copy to clipboard
    const copyBtn = document.createElement('div');
    copyBtn.className = 'cl-gitlab-btn cl-gitlab-spend-btn pointer cl-non-selectable';
    copyBtn.setAttribute('role', 'button');
    copyBtn.setAttribute('tabindex', '0');
    copyBtn.title = typeof I18N !== 'undefined'
      ? I18N.t('copyTooltip', config.language)
      : 'Copy GitLab /spend command to clipboard';
    copyBtn.innerHTML = GITLAB_COPY_SVG;

    copyBtn.addEventListener('click', (e) => handleCopyButtonClick(e, entryEl, copyBtn));
    copyBtn.addEventListener('mouseenter', () => handleCopyButtonHover(entryEl, copyBtn));

    // Button 2: Direct sync to GitLab API
    const syncBtn = document.createElement('div');
    syncBtn.className = 'cl-gitlab-btn cl-gitlab-sync-btn pointer cl-non-selectable';
    syncBtn.setAttribute('role', 'button');
    syncBtn.setAttribute('tabindex', '0');
    syncBtn.title = typeof I18N !== 'undefined'
      ? I18N.t('syncDirectTooltip', config.language, { iid: '' })
      : 'Directly sync to GitLab (API)';
    syncBtn.innerHTML = GITLAB_SYNC_SVG;

    const initialDesc = extractDescription(entryEl);
    if (!parseGitLabIssueUrl(initialDesc)) {
      syncBtn.classList.add('no-link');
    }

    syncBtn.addEventListener('click', (e) => handleSyncButtonClick(e, entryEl, syncBtn));
    syncBtn.addEventListener('mouseenter', () => handleSyncButtonHover(entryEl, syncBtn));

    // Listen for description edits to toggle no-link dynamically
    const descInput = entryEl.querySelector('.cl-input-description, [data-cy="time-entry-description"] input');
    if (descInput) {
      descInput.addEventListener('input', () => {
        const hasLink = !!parseGitLabIssueUrl(descInput.value);
        syncBtn.classList.toggle('no-link', !hasLink);
      });
    }

    // Add buttons inside the glass pill
    pill.appendChild(copyBtn);
    pill.appendChild(syncBtn);

    // Position glass pill right next to duration
    if (durationEl && durationEl.parentNode) {
      durationEl.insertAdjacentElement('afterend', pill);
    } else if (actionsContainer) {
      const playIcon = actionsContainer.querySelector('.cl-icon-play');
      if (playIcon) {
        actionsContainer.insertBefore(pill, playIcon);
      } else {
        actionsContainer.appendChild(pill);
      }
    }
  }

  /**
   * Handle Click on "Sync Total / Day"
   */
  async function handleTotalSyncClick(headerEl, totalBtn) {
    if (totalBtn.classList.contains('loading')) return;

    const card = headerEl.closest('.cl-card, [class*="cl-card"]') || headerEl.parentElement;
    if (!card) return;

    // Find all individual time-tracker-entry rows in this card (ignoring parent-tracker-entry)
    const entryRows = Array.from(card.querySelectorAll('time-tracker-entry'))
      .map((el) => {
        return el.classList.contains('cl-tracker-entry')
          ? el
          : el.querySelector('.cl-tracker-entry') || el;
      })
      .filter((row) => {
        if (!row) return false;
        if (isParentTrackerEntry(row)) return false;
        return true;
      });

    if (entryRows.length === 0) {
      const noTasksMsg = typeof I18N !== 'undefined'
        ? I18N.t('toastNoTasks', config.language)
        : 'No individual time entries found for this day.';
      showToast(noTasksMsg, 'warning');
      return;
    }

    // Set Total button to loading
    totalBtn.classList.add('loading');
    const initialProgress = typeof I18N !== 'undefined'
      ? I18N.t('toastProgress', config.language, { curr: '0', total: entryRows.length })
      : 'Syncing...';
    totalBtn.innerHTML = `
      ${SPINNER_SVG}
      <span class="cl-gitlab-total-sync-text">${initialProgress}</span>
    `;

    let syncedCount = 0;
    let alreadyExistsCount = 0;
    let noLinkCount = 0;
    let failedCount = 0;
    let dateStr = '';

    // Track occurrence of identical items within the same day
    const occurrenceTracker = {};

    for (let i = 0; i < entryRows.length; i++) {
      const entryRow = entryRows[i];
      const desc = extractDescription(entryRow);
      const issueDetails = parseGitLabIssueUrl(desc);
      const rawDuration = extractDurationForEntry(entryRow);
      const gitlabDuration = formatGitLabDuration(
        rawDuration,
        config.includeSeconds,
        config.roundMinutes
      );
      dateStr = extractDateForEntry(entryRow);
      const syncBtn = entryRow.querySelector('.cl-gitlab-sync-btn');

      if (!issueDetails) {
        noLinkCount++;
        continue;
      }

      // Calculate occurrence index for identical items in the same day
      const key = `${issueDetails.iid}_${gitlabDuration}_${dateStr}`;
      occurrenceTracker[key] = (occurrenceTracker[key] || 0) + 1;
      const occurrenceIndex = occurrenceTracker[key];

      // Update button text to show progress
      const progressText = typeof I18N !== 'undefined'
        ? I18N.t('toastProgress', config.language, { curr: i + 1, total: entryRows.length })
        : `(${i + 1}/${entryRows.length}) Syncing...`;
      const textSpan = totalBtn.querySelector('.cl-gitlab-total-sync-text');
      if (textSpan) textSpan.textContent = progressText;

      if (syncBtn) {
        syncBtn.classList.add('loading');
        syncBtn.innerHTML = SPINNER_SVG;
      }

      try {
        const response = await chrome.runtime.sendMessage({
          action: 'syncSpend',
          data: {
            lang: config.language,
            host: issueDetails.host || config.gitlabHost,
            projectPath: issueDetails.projectPath,
            iid: issueDetails.iid,
            gitlabDuration,
            rawDuration,
            dateStr,
            occurrenceIndex
          }
        });

        if (syncBtn) syncBtn.classList.remove('loading');

        if (response && response.alreadyExists) {
          alreadyExistsCount++;
          if (syncBtn) {
            syncBtn.classList.add('synced', 'already-exists');
            syncBtn.innerHTML = WARNING_SVG;
            syncBtn.title = typeof I18N !== 'undefined'
              ? I18N.t('alreadyExistsTooltip', config.language, { iid: issueDetails.iid })
              : `Already recorded in Issue #${issueDetails.iid}`;
          }
        } else if (response && response.success) {
          syncedCount++;
          if (syncBtn) {
            syncBtn.classList.add('synced');
            syncBtn.classList.remove('already-exists');
            syncBtn.innerHTML = CHECKMARK_SVG;
            syncBtn.title = typeof I18N !== 'undefined'
              ? I18N.t('successRecordedTooltip', config.language, { iid: issueDetails.iid })
              : `Recorded in Issue #${issueDetails.iid}`;
          }
        } else {
          failedCount++;
          if (syncBtn) {
            syncBtn.innerHTML = GITLAB_SYNC_SVG;
          }
        }
      } catch (err) {
        if (syncBtn) {
          syncBtn.classList.remove('loading');
          syncBtn.innerHTML = GITLAB_SYNC_SVG;
        }
        failedCount++;
      }
    }

    // Finished
    totalBtn.classList.remove('loading');
    totalBtn.classList.add('synced');
    const syncedDoneText = typeof I18N !== 'undefined'
      ? I18N.t('toastTasksSynced', config.language, { count: syncedCount })
      : `${syncedCount} synced`;
    totalBtn.innerHTML = `
      ${CHECKMARK_SVG}
      <span class="cl-gitlab-total-sync-text">${syncedDoneText}</span>
    `;

    setTimeout(() => {
      totalBtn.classList.remove('synced');
      const syncDayLabel = typeof I18N !== 'undefined'
        ? I18N.t('syncDayBtn', config.language)
        : 'Sync Day';
      totalBtn.innerHTML = `
        ${GITLAB_SYNC_SVG}
        <span class="cl-gitlab-total-sync-text">${syncDayLabel}</span>
      `;
    }, 3500);

    // Summary Toast
    const totalDurationText = headerEl.querySelector('[data-cy="entry-header-total-duration"]')?.textContent.trim() || '';
    const parts = [];
    if (syncedCount > 0) parts.push(`✅ ${typeof I18N !== 'undefined' ? I18N.t('toastTasksSynced', config.language, { count: syncedCount }) : syncedCount + ' synced'}`);
    if (alreadyExistsCount > 0) parts.push(`⚠️ ${typeof I18N !== 'undefined' ? I18N.t('toastTasksAlready', config.language, { count: alreadyExistsCount }) : alreadyExistsCount + ' already exists'}`);
    if (noLinkCount > 0) parts.push(`ℹ️ ${typeof I18N !== 'undefined' ? I18N.t('toastTasksNoLink', config.language, { count: noLinkCount }) : noLinkCount + ' without link'}`);
    if (failedCount > 0) parts.push(`❌ ${typeof I18N !== 'undefined' ? I18N.t('toastTasksFailed', config.language, { count: failedCount }) : failedCount + ' failed'}`);

    const toastType = failedCount > 0
      ? (syncedCount > 0 ? 'warning' : 'error')
      : (syncedCount > 0 ? 'success' : 'warning');

    const doneTitle = typeof I18N !== 'undefined'
      ? I18N.t('toastDaySyncDone', config.language, { date: dateStr || '' })
      : `Day sync completed (${dateStr || ''})`;

    const noTasksMsg = typeof I18N !== 'undefined' ? I18N.t('toastNoTasks', config.language) : 'No tasks recorded.';
    const totalDurMsg = totalDurationText && typeof I18N !== 'undefined'
      ? ` (${I18N.t('toastTotalDuration', config.language, { dur: totalDurationText })})`
      : (totalDurationText ? ` (${totalDurationText})` : '');

    showToast(
      doneTitle,
      toastType,
      (parts.length ? parts.join(' | ') : noTasksMsg) + totalDurMsg
    );
  }

  /**
   * Inject Total Sync button into a Day header (entry-group-header)
   */
  function injectTotalSyncButtonIntoHeader(headerEl) {
    if (headerEl.querySelector('.cl-gitlab-total-sync-btn')) {
      const textSpan = headerEl.querySelector('.cl-gitlab-total-sync-text');
      if (textSpan && typeof I18N !== 'undefined') {
        textSpan.textContent = I18N.t('syncDayBtn', config.language);
      }
      return;
    }

    const totalDurationEl = headerEl.querySelector('[data-cy="entry-header-total-duration"]');
    const totalLabelEl = headerEl.querySelector('.cl-entry-total-label');

    if (!totalDurationEl && !totalLabelEl) {
      return;
    }

    const totalBtn = document.createElement('div');
    totalBtn.className = 'cl-gitlab-total-sync-btn pointer cl-non-selectable';
    totalBtn.setAttribute('role', 'button');
    totalBtn.setAttribute('tabindex', '0');
    totalBtn.title = typeof I18N !== 'undefined'
      ? I18N.t('syncDayTooltip', config.language)
      : 'Sync all entries of this day to GitLab (auto-check & record)';
    const syncDayLabel = typeof I18N !== 'undefined'
      ? I18N.t('syncDayBtn', config.language)
      : 'Sync Day';
    totalBtn.innerHTML = `
      ${GITLAB_SYNC_SVG}
      <span class="cl-gitlab-total-sync-text">${syncDayLabel}</span>
    `;

    totalBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleTotalSyncClick(headerEl, totalBtn);
    });

    if (totalDurationEl && totalDurationEl.parentNode) {
      totalDurationEl.insertAdjacentElement('afterend', totalBtn);
    } else if (totalLabelEl && totalLabelEl.parentNode) {
      totalLabelEl.insertAdjacentElement('afterend', totalBtn);
    }

    // Also make the "Total:" label clickable for direct sync
    if (totalLabelEl && !totalLabelEl.dataset.gitlabClickable) {
      totalLabelEl.dataset.gitlabClickable = 'true';
      totalLabelEl.classList.add('cl-gitlab-clickable');
      totalLabelEl.title = typeof I18N !== 'undefined'
        ? I18N.t('totalClickableTooltip', config.language)
        : 'Click to sync all entries of this day to GitLab';
      totalLabelEl.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleTotalSyncClick(headerEl, totalBtn);
      });
    }
  }

  /**
   * Process all tracker entries and day headers currently in the DOM
   */
  function processAllEntries() {
    // 1. Remove buttons if previously injected into any parent-tracker-entry
    document.querySelectorAll('parent-tracker-entry').forEach((parentEl) => {
      const existing = parentEl.querySelector('.cl-gitlab-glass-pill, .cl-gitlab-spend-btn');
      if (existing) existing.remove();
    });

    // 2. Process ONLY individual single/child entries (time-tracker-entry)
    const timeEntries = document.querySelectorAll('time-tracker-entry');
    timeEntries.forEach((el) => {
      if (isParentTrackerEntry(el)) return;
      const entryRow = el.classList.contains('cl-tracker-entry')
        ? el
        : el.querySelector('.cl-tracker-entry') || el;
      if (entryRow && !isParentTrackerEntry(entryRow)) {
        injectButtonsIntoEntry(entryRow);
      }
    });

    // 3. Process day headers (Total)
    const headers = document.querySelectorAll('entry-group-header, .cl-card-header');
    headers.forEach((headerEl) => {
      injectTotalSyncButtonIntoHeader(headerEl);
    });
  }

  // Initial pass
  processAllEntries();

  // MutationObserver with debounce
  let observerTimer = null;
  const observer = new MutationObserver(() => {
    if (observerTimer) return;
    observerTimer = setTimeout(() => {
      observerTimer = null;
      processAllEntries();
    }, 120);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  console.log('[Clockify-GitLab] Glassmorphic UI initialized.');
})();
