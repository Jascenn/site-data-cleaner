// Injected only into sites in the silent list (registered by background.js).
// Intercepts F5 / ⌘R / Ctrl+R to clear-and-reload via the extension.
(function () {
  const handler = (e) => {
    const isReload =
      e.key === 'F5' ||
      ((e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey && (e.key === 'r' || e.key === 'R'));
    if (!isReload) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    try {
      chrome.runtime.sendMessage({ type: 'SILENT_RELOAD' });
    } catch (err) {
      // extension context invalidated — fall back to default reload
      location.reload();
    }
  };
  window.addEventListener('keydown', handler, true);
})();
