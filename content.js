/**
 * Clockify to GitLab /spend Copier - Content Script
 */

(function () {
  'use strict';

  // Default configuration
  let config = {
    includeSeconds: true,
    roundMinutes: false,
    customCommand: '/spend'
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
        for (const [key, { newValue }] of Object.entries(changes)) {
          config[key] = newValue;
        }
      }
    });
  }

  // SVGs for GitLab Tanuki Logo and Success Checkmark
  const GITLAB_SVG = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 380" class="gitlab-icon" width="17" height="17">
      <path fill="#e24329" d="m190.07 359.18 42.86-131.91h-85.72l42.86 131.91z"/>
      <path fill="#fc6d26" d="m190.07 359.18-42.86-131.91h-89.8l132.66 131.91z"/>
      <path fill="#fca326" d="m57.41 227.27-24.58 75.64a10.84 10.84 0 0 0 3.94 12.13l153.3 104.14-132.66-191.91z"/>
      <path fill="#e24329" d="m57.41 227.27h89.8l-42-129.24a10.84 10.84 0 0 0-20.61 0l-27.19 129.24z"/>
      <path fill="#fc6d26" d="m190.07 359.18 42.86-131.91h89.8l-132.66 131.91z"/>
      <path fill="#fca326" d="m322.73 227.27 24.58 75.64a10.84 10.84 0 0 1-3.94 12.13l-153.3 104.14 132.66-191.91z"/>
      <path fill="#e24329" d="m322.73 227.27h-89.8l42-129.24a10.84 10.84 0 0 1 20.61 0l27.19 129.24z"/>
    </svg>
  `;

  const CHECKMARK_SVG = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="checkmark-icon" width="17" height="17" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  `;

  /**
   * Helper to format Date object into YYYY-MM-DD
   */
  function formatDate(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Parse Clockify date header text into YYYY-MM-DD
   * Supports: "Today", "Yesterday", "Wed, Oct 21", "Oct 21", "21 Oct", "2026-10-21", etc.
   */
  function parseClockifyDate(rawText, refDate = new Date()) {
    if (!rawText) return formatDate(refDate);
    const text = rawText.trim();
    const lower = text.toLowerCase();

    if (lower === 'today') {
      return formatDate(refDate);
    }

    if (lower === 'yesterday') {
      const y = new Date(refDate);
      y.setDate(y.getDate() - 1);
      return formatDate(y);
    }

    // Try ISO format: YYYY-MM-DD
    const isoMatch = text.match(/(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
    if (isoMatch) {
      const y = parseInt(isoMatch[1], 10);
      const m = String(parseInt(isoMatch[2], 10)).padStart(2, '0');
      const d = String(parseInt(isoMatch[3], 10)).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }

    // Try DD/MM/YYYY
    const ddmmyyyy = text.match(/(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
    if (ddmmyyyy) {
      const d = String(parseInt(ddmmyyyy[1], 10)).padStart(2, '0');
      const m = String(parseInt(ddmmyyyy[2], 10)).padStart(2, '0');
      const y = parseInt(ddmmyyyy[3], 10);
      return `${y}-${m}-${d}`;
    }

    const months = {
      jan: 1, january: 1,
      feb: 2, february: 2,
      mar: 3, march: 3,
      apr: 4, april: 4,
      may: 5,
      jun: 6, june: 6,
      jul: 7, july: 7,
      aug: 8, august: 8,
      sep: 9, september: 9,
      oct: 10, october: 10,
      nov: 11, november: 11,
      dec: 12, december: 12
    };

    // Pattern 1: e.g. "Wed, Oct 21" or "Oct 21, 2026"
    const m1 = text.match(/(?:[a-zA-Z]+,?\s+)?([a-zA-Z]+)\s+(\d{1,2})(?:,?\s+(\d{4}))?/);
    if (m1 && months[m1[1].toLowerCase()]) {
      const monthNum = months[m1[1].toLowerCase()];
      const day = parseInt(m1[2], 10);
      let year = m1[3] ? parseInt(m1[3], 10) : refDate.getFullYear();
      if (!m1[3]) {
        const currentMonth = refDate.getMonth() + 1;
        // If entry month is much later than current month, it's likely from last year
        if (monthNum - currentMonth > 6) {
          year -= 1;
        }
      }
      return `${year}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }

    // Pattern 2: e.g. "21 Oct" or "Wed, 21 Oct 2026"
    const m2 = text.match(/(?:[a-zA-Z]+,?\s+)?(\d{1,2})\s+([a-zA-Z]+)(?:,?\s+(\d{4}))?/);
    if (m2 && months[m2[2].toLowerCase()]) {
      const day = parseInt(m2[1], 10);
      const monthNum = months[m2[2].toLowerCase()];
      let year = m2[3] ? parseInt(m2[3], 10) : refDate.getFullYear();
      if (!m2[3]) {
        const currentMonth = refDate.getMonth() + 1;
        if (monthNum - currentMonth > 6) {
          year -= 1;
        }
      }
      return `${year}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }

    // Fallback: Date.parse
    const parsed = Date.parse(text);
    if (!isNaN(parsed)) {
      return formatDate(new Date(parsed));
    }

    return formatDate(refDate);
  }

  /**
   * Convert duration string (e.g. "01:51:11" or "04:20:28") to GitLab spend format (e.g. "1h 51m 11s")
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

    // Handle decimal hours like "1.5h" or "2h"
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
   * Find the date string for an entry row by searching ancestor card or preceding headers
   */
  function extractDateForEntry(entryEl) {
    // 1. Closest card ancestor
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

    // 2. Preceding entry-group-header in document hierarchy
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
    // Duration input is usually inside .cl-entry-duration
    const durationInput =
      entryEl.querySelector('.cl-entry-duration input') ||
      entryEl.querySelector('input[aria-label="Duration"]') ||
      entryEl.querySelector('.cl-input-time-picker-sum');

    if (durationInput) {
      const val = durationInput.value || durationInput.getAttribute('value') || '';
      if (val.trim()) return val.trim();
    }

    // Fallback: check textContent of .cl-entry-duration
    const durationContainer = entryEl.querySelector('.cl-entry-duration');
    if (durationContainer) {
      const text = durationContainer.textContent.trim();
      const match = text.match(/\b\d{1,2}:\d{2}(?::\d{2})?\b/);
      if (match) return match[0];
    }

    return '00:00:00';
  }

  /**
   * Extract description / GitLab issue URL if available
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
   * Display a floating feedback toast
   */
  let toastTimeout = null;
  function showToast(command, description) {
    let toast = document.getElementById('cl-gitlab-toast-notification');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'cl-gitlab-toast-notification';
      toast.className = 'cl-gitlab-toast';
      document.body.appendChild(toast);
    }

    let extraHtml = '';
    if (description) {
      // If description contains a work_item or issue URL, display shortened info
      const workItemMatch = description.match(/(?:work_items|issues)\/(\d+)/i);
      if (workItemMatch) {
        extraHtml = `<div class="cl-gitlab-toast-extra">GitLab Issue #${workItemMatch[1]}</div>`;
      } else if (description.length > 40) {
        extraHtml = `<div class="cl-gitlab-toast-extra">${description.substring(0, 37)}...</div>`;
      } else {
        extraHtml = `<div class="cl-gitlab-toast-extra">${description}</div>`;
      }
    }

    toast.innerHTML = `
      <div style="font-size: 18px; line-height: 1;">🦊</div>
      <div>
        <div>Copied: <span class="cl-gitlab-toast-cmd">${command}</span></div>
        ${extraHtml}
      </div>
    `;

    // Trigger show class
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
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
        console.warn('[Clockify-GitLab] navigator.clipboard failed, using fallback:', err);
      }
    }

    // Fallback: document.execCommand
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
      console.error('[Clockify-GitLab] Copy command failed:', e);
      return false;
    }
  }

  /**
   * Handle button click
   */
  async function handleButtonClick(e, entryEl, btn) {
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
      // Visual feedback on button: switch to checkmark and keep it as checkmark
      btn.classList.add('copied');
      btn.innerHTML = CHECKMARK_SVG;

      // Trigger pop animation even if clicked again
      const svg = btn.querySelector('svg');
      if (svg) {
        svg.style.animation = 'none';
        void svg.offsetWidth;
        svg.style.animation = 'gitlab-pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      }

      // Show toast
      showToast(command, description);
    }
  }

  /**
   * Update tooltip preview on hover
   */
  function handleButtonHover(entryEl, btn) {
    const rawDuration = extractDurationForEntry(entryEl);
    const gitlabDuration = formatGitLabDuration(
      rawDuration,
      config.includeSeconds,
      config.roundMinutes
    );
    const dateStr = extractDateForEntry(entryEl);
    const command = `${config.customCommand || '/spend'} ${gitlabDuration} ${dateStr}`;
    const isCopied = btn.classList.contains('copied');
    btn.title = isCopied ? `Copied! Click to re-copy: ${command}` : `Click to copy: ${command}`;
  }

  /**
   * Inject button into a single Clockify entry row
   */
  function injectButtonIntoEntry(entryEl) {
    // Avoid double injection
    if (entryEl.querySelector('.cl-gitlab-spend-btn')) {
      return;
    }

    // Find the duration container: .cl-entry-duration
    const durationEl = entryEl.querySelector('.cl-entry-duration');
    const actionsContainer = entryEl.querySelector('.cl-timetracker-list-actions');

    if (!durationEl && !actionsContainer) {
      return;
    }

    // Create button element
    const btn = document.createElement('div');
    btn.className = 'cl-component-divided-left cl-gitlab-spend-btn pointer cl-non-selectable';
    btn.setAttribute('role', 'button');
    btn.setAttribute('tabindex', '0');
    btn.title = 'Copy GitLab /spend command';
    btn.innerHTML = GITLAB_SVG;

    // Attach event listeners
    btn.addEventListener('click', (e) => handleButtonClick(e, entryEl, btn));
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        handleButtonClick(e, entryEl, btn);
      }
    });
    btn.addEventListener('mouseenter', () => handleButtonHover(entryEl, btn));

    // Position the button: right beside the duration element
    if (durationEl && durationEl.parentNode) {
      durationEl.insertAdjacentElement('afterend', btn);
    } else if (actionsContainer) {
      const playIcon = actionsContainer.querySelector('.cl-icon-play');
      if (playIcon) {
        actionsContainer.insertBefore(btn, playIcon);
      } else {
        actionsContainer.appendChild(btn);
      }
    }
  }

  /**
   * Process all tracker entries currently in the DOM
   */
  function processAllEntries() {
    const entries = document.querySelectorAll(
      '.cl-tracker-entry, time-tracker-entry, parent-tracker-entry'
    );
    entries.forEach((el) => {
      // If it's a wrapper, find .cl-tracker-entry inside, or use el itself
      const entryRow = el.classList.contains('cl-tracker-entry')
        ? el
        : el.querySelector('.cl-tracker-entry') || el;
      injectButtonIntoEntry(entryRow);
    });
  }

  // Initial pass
  processAllEntries();

  // Observe dynamic additions with debounce
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

  console.log('[Clockify-GitLab] Extension loaded and observer active.');
})();

