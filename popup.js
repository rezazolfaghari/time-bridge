/**
 * Popup Script for Clockify to GitLab /spend Copier
 */

document.addEventListener('DOMContentLoaded', () => {
  const includeSecondsEl = document.getElementById('includeSeconds');
  const roundMinutesEl = document.getElementById('roundMinutes');
  const previewBoxEl = document.getElementById('previewBox');

  const sampleDuration = '01:51:11';
  const sampleDate = '2026-10-21';

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
    chrome.storage.sync.get({ includeSeconds: true, roundMinutes: false }, (items) => {
      includeSecondsEl.checked = items.includeSeconds;
      roundMinutesEl.checked = items.roundMinutes;
      updatePreview();
    });
  } else {
    updatePreview();
  }

  // Save settings on change
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
