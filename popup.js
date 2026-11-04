/**
 * Popup Script for Clockify to GitLab /spend & Sync Extension
 * Handles settings, i18n language switching, RTL/LTR layout, and connection testing.
 */

document.addEventListener('DOMContentLoaded', () => {
  const languageSelect = document.getElementById('languageSelect');
  const gitlabHostEl = document.getElementById('gitlabHost');
  const gitlabTokenEl = document.getElementById('gitlabToken');
  const saveBtn = document.getElementById('saveBtn');
  const testBtn = document.getElementById('testBtn');
  const statusMsg = document.getElementById('statusMsg');

  const includeSecondsEl = document.getElementById('includeSeconds');
  const roundMinutesEl = document.getElementById('roundMinutes');
  const previewBoxEl = document.getElementById('previewBox');

  let currentLang = 'en';
  const sampleDuration = '01:51:11';
  const sampleDate = '2026-10-21';

  /**
   * Apply language to the popup DOM and switch RTL/LTR layout
   */
  function applyLanguage(lang) {
    currentLang = lang;
    const dir = (typeof I18N !== 'undefined') ? I18N.getDir(lang) : 'ltr';

    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    document.body.dir = dir;

    if (languageSelect) {
      languageSelect.value = lang;
    }

    if (typeof I18N !== 'undefined') {
      // Update all elements with data-i18n
      document.querySelectorAll('[data-i18n]').forEach((el) => {
        const key = el.getAttribute('data-i18n');
        if (key) {
          el.textContent = I18N.t(key, lang);
        }
      });

      // Update placeholders
      if (gitlabHostEl) {
        gitlabHostEl.placeholder = 'https://gitlab.com';
      }
      if (gitlabTokenEl) {
        gitlabTokenEl.placeholder = 'glpat-xxxxxxxxxxxxxxxxxxxx';
      }
    }
  }

  function showStatus(text, type = 'success') {
    statusMsg.className = `status-msg ${type}`;
    statusMsg.textContent = text;
    statusMsg.style.display = 'block';
  }

  function updatePreview() {
    const includeSec = includeSecondsEl.checked;
    const roundMin = roundMinutesEl.checked;

    let timeStr = '1h 51m 11s';
    if (!includeSec) {
      timeStr = roundMin ? '1h 51m' : '1h 51m';
    }

    previewBoxEl.textContent = `/spend ${timeStr} ${sampleDate}`;
  }

  // Load saved settings
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
    chrome.storage.sync.get(
      {
        language: 'en',
        gitlabHost: 'https://gitlab.com',
        gitlabToken: '',
        includeSeconds: true,
        roundMinutes: false
      },
      (items) => {
        const initialLang = items.language || 'en';
        applyLanguage(initialLang);

        gitlabHostEl.value = items.gitlabHost || 'https://gitlab.com';
        gitlabTokenEl.value = items.gitlabToken || '';
        includeSecondsEl.checked = items.includeSeconds;
        roundMinutesEl.checked = items.roundMinutes;
        updatePreview();
      }
    );
  } else {
    applyLanguage('en');
    updatePreview();
  }

  // Language Change Event
  if (languageSelect) {
    languageSelect.addEventListener('change', (e) => {
      const newLang = e.target.value;
      applyLanguage(newLang);
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.set({ language: newLang });
      }
    });
  }

  // Save settings
  saveBtn.addEventListener('click', () => {
    const host = gitlabHostEl.value.trim();
    const token = gitlabTokenEl.value.trim();

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.set(
        {
          language: currentLang,
          gitlabHost: host,
          gitlabToken: token,
          includeSeconds: includeSecondsEl.checked,
          roundMinutes: roundMinutesEl.checked
        },
        () => {
          const msg = (typeof I18N !== 'undefined') ? I18N.t('settingsSaved', currentLang) : 'Settings saved successfully.';
          showStatus(`✅ ${msg}`, 'success');
          setTimeout(() => {
            statusMsg.style.display = 'none';
          }, 3000);
        }
      );
    }
  });

  // Test connection
  testBtn.addEventListener('click', async () => {
    const host = gitlabHostEl.value.trim();
    const token = gitlabTokenEl.value.trim();

    const checkingMsg = (typeof I18N !== 'undefined') ? I18N.t('testingConn', currentLang) : 'Checking connection...';
    showStatus(checkingMsg, 'info');

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'testConnection',
        data: { host, token, lang: currentLang }
      });

      if (response && response.success) {
        showStatus(response.message, 'success');
      } else {
        const defaultErr = (typeof I18N !== 'undefined') ? I18N.t('connError', currentLang, { error: 'Unknown' }) : 'Connection failed.';
        showStatus(response ? response.message : defaultErr, 'error');
      }
    } catch (e) {
      const errTemplate = (typeof I18N !== 'undefined') ? I18N.t('connError', currentLang, { error: e.message }) : `Error: ${e.message}`;
      showStatus(errTemplate, 'error');
    }
  });

  // Toggle options
  includeSecondsEl.addEventListener('change', () => {
    updatePreview();
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.set({ includeSeconds: includeSecondsEl.checked });
    }
  });

  roundMinutesEl.addEventListener('change', () => {
    updatePreview();
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.set({ roundMinutes: roundMinutesEl.checked });
    }
  });
});
