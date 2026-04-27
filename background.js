// ===== Silent list state =====
const SILENT_KEY = 'silentList';

async function getSilentList() {
  const { [SILENT_KEY]: list = [] } = await chrome.storage.sync.get(SILENT_KEY);
  return list;
}
async function setSilentList(list) {
  await chrome.storage.sync.set({ [SILENT_KEY]: list });
}
function hostMatches(hostname, entry) {
  return hostname === entry || hostname.endsWith('.' + entry);
}

// ===== Core clear-and-reload =====
async function clearTabSiteData(tab) {
  if (!tab || !tab.url || !/^https?:/.test(tab.url)) return { ok: false, reason: 'unsupported-url' };
  const url = new URL(tab.url);
  const hostname = url.hostname;
  const root = hostname.split('.').slice(-2).join('.');

  for (const d of [hostname, '.' + hostname, root, '.' + root]) {
    try {
      const cs = await chrome.cookies.getAll({ domain: d });
      for (const c of cs) {
        const cu = `http${c.secure ? 's' : ''}://${c.domain.replace(/^\./, '')}${c.path}`;
        await chrome.cookies.remove({ url: cu, name: c.name, storeId: c.storeId });
      }
    } catch (e) {}
  }

  try {
    await chrome.browsingData.remove(
      { origins: [`${url.protocol}//${hostname}`, `${url.protocol}//${root}`] },
      { cookies: true, localStorage: true, indexedDB: true, cacheStorage: true, serviceWorkers: true }
    );
  } catch (e) {}

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        try { localStorage.clear(); } catch (e) {}
        try { sessionStorage.clear(); } catch (e) {}
        location.reload();
      }
    });
  } catch (e) {
    chrome.tabs.reload(tab.id);
  }

  return { ok: true, hostname };
}

async function clearActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) return clearTabSiteData(tab);
  return { ok: false };
}

// ===== Sync content scripts to silent list =====
// Inject keydown listener only on silent-list sites so that F5 / ⌘R triggers clear-and-reload.
async function syncContentScripts() {
  try { await chrome.scripting.unregisterContentScripts({ ids: ['silent-keylistener'] }); } catch (e) {}

  const list = await getSilentList();
  if (list.length === 0) return;

  const matches = [];
  for (const h of list) {
    matches.push(`*://${h}/*`);
    matches.push(`*://*.${h}/*`);
  }

  try {
    await chrome.scripting.registerContentScripts([{
      id: 'silent-keylistener',
      matches,
      js: ['content.js'],
      runAt: 'document_start',
      allFrames: false
    }]);
  } catch (e) {
    console.warn('registerContentScripts failed', e);
  }
}

// ===== Per-tab popup toggle =====
// silent-list site → no popup (left-click goes to onClicked, instant clear)
// other site       → show popup
async function updatePopupForTab(tab) {
  if (!tab || !tab.id) return;
  let isSilent = false;
  try {
    if (tab.url && /^https?:/.test(tab.url)) {
      const hostname = new URL(tab.url).hostname;
      const list = await getSilentList();
      isSilent = list.some(h => hostMatches(hostname, h));
    }
  } catch (e) {}
  try {
    await chrome.action.setPopup({ tabId: tab.id, popup: isSilent ? '' : 'popup.html' });
  } catch (e) {}
}

async function refreshAllTabs() {
  const tabs = await chrome.tabs.query({});
  await Promise.all(tabs.map(updatePopupForTab));
}

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  try { updatePopupForTab(await chrome.tabs.get(tabId)); } catch (e) {}
});
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url || changeInfo.status === 'complete') updatePopupForTab(tab);
});

// Fires only on silent-list tabs (where popup is empty)
chrome.action.onClicked.addListener(async (tab) => {
  await clearTabSiteData(tab);
});

chrome.runtime.onInstalled.addListener(() => { syncContentScripts(); refreshAllTabs(); });
chrome.runtime.onStartup.addListener(() => { syncContentScripts(); refreshAllTabs(); });
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes[SILENT_KEY]) {
    syncContentScripts();
    refreshAllTabs();
  }
});

// ===== Keyboard shortcut =====
// Only acts on silent-list sites — prevents accidental wipes on Gmail / banks / etc.
chrome.commands.onCommand.addListener(async (cmd) => {
  if (cmd !== 'clear-current-site') return;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.url || !/^https?:/.test(tab.url)) return;
  let hostname;
  try { hostname = new URL(tab.url).hostname; } catch { return; }
  const list = await getSilentList();
  if (!list.some(h => hostMatches(hostname, h))) return; // not silent → no-op
  await clearTabSiteData(tab);
});

// ===== Messages =====
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    try {
      if (msg.type === 'CLEAR_AND_RELOAD') {
        sendResponse(await clearActiveTab());
        return;
      }
      if (msg.type === 'SILENT_RELOAD' && sender.tab) {
        sendResponse(await clearTabSiteData(sender.tab));
        return;
      }
      if (msg.type === 'GET_STATE') {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab || !tab.url || !/^https?:/.test(tab.url)) {
          sendResponse({ ok: false, reason: 'unsupported-url' });
          return;
        }
        const hostname = new URL(tab.url).hostname;
        const list = await getSilentList();
        const matched = list.find(h => hostMatches(hostname, h));
        sendResponse({ ok: true, hostname, isSilent: !!matched, matchedEntry: matched || hostname, list });
        return;
      }
      if (msg.type === 'TOGGLE_SILENT') {
        const list = await getSilentList();
        const idx = list.indexOf(msg.hostname);
        if (idx >= 0) list.splice(idx, 1);
        else list.push(msg.hostname);
        await setSilentList(list);
        sendResponse({ ok: true, list });
        return;
      }
      if (msg.type === 'GET_LIST') {
        sendResponse({ ok: true, list: await getSilentList() });
        return;
      }
      if (msg.type === 'SET_LIST') {
        await setSilentList(Array.isArray(msg.list) ? msg.list : []);
        sendResponse({ ok: true });
        return;
      }
    } catch (e) {
      sendResponse({ ok: false, error: e.message });
    }
  })();
  return true;
});
