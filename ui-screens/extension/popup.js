/**
 * Serendipity | StoryWeaver — Extension Popup
 *
 * Minimal launcher that opens the full app in a new tab.
 */

const APP_PAGE = 'index.html';

function openApp(hash) {
  const url = chrome.runtime.getURL(APP_PAGE + (hash ? '#' + hash : ''));

  // Check if there's already an open StoryWeaver tab and focus it
  chrome.tabs.query({}, (tabs) => {
    const existing = tabs.find(t => t.url && t.url.startsWith(chrome.runtime.getURL(APP_PAGE)));
    if (existing) {
      // Focus existing tab, optionally update hash
      chrome.tabs.update(existing.id, { active: true });
      if (hash) {
        chrome.tabs.update(existing.id, { url });
      }
      chrome.windows.update(existing.windowId, { focused: true });
    } else {
      chrome.tabs.create({ url });
    }
    window.close();
  });
}

document.getElementById('open-app').addEventListener('click', () => openApp(''));
document.getElementById('open-hub').addEventListener('click', () => openApp('/hub'));
document.getElementById('open-wizard').addEventListener('click', () => openApp('/wizard'));

// Show version from manifest
const manifest = chrome.runtime.getManifest();
document.querySelector('.popup-version').textContent = `v${manifest.version}`;
