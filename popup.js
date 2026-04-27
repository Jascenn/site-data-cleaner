const $ = (id) => document.getElementById(id);
const hostEl = $('host');
const hintEl = $('hint');
const clearBtn = $('clear');
const toggleBtn = $('toggle');
const badge = $('badge');
const statusEl = $('status');

let currentHost = null;

async function init() {
  const state = await chrome.runtime.sendMessage({ type: 'GET_STATE' });
  if (!state || !state.ok) {
    hostEl.textContent = '(unsupported page)';
    hintEl.textContent = 'This page cannot be cleaned (chrome:// or extension page).';
    clearBtn.disabled = true;
    toggleBtn.disabled = true;
    badge.style.display = 'none';
    document.body.classList.add('ready');
    return;
  }

  currentHost = state.hostname;
  // Note: popup only opens for non-silent sites (background dynamically sets popup="").
  // So we always show NORMAL state here; the "+ Silent" button is the entry point to enable silent mode.
  badge.textContent = 'NORMAL';
  badge.className = 'badge normal';
  hostEl.textContent = state.hostname;
  toggleBtn.textContent = '+ Silent';
  document.body.classList.add('ready');
}

clearBtn.addEventListener('click', async () => {
  clearBtn.disabled = true;
  clearBtn.textContent = 'Clearing…';
  const res = await chrome.runtime.sendMessage({ type: 'CLEAR_AND_RELOAD' });
  if (res && res.ok) {
    statusEl.className = 'status ok';
    statusEl.textContent = '✓ Cleared. Reloading…';
    setTimeout(() => window.close(), 500);
  } else {
    clearBtn.disabled = false;
    clearBtn.textContent = 'Clear & Reload';
    statusEl.className = 'status err';
    statusEl.textContent = '✗ ' + (res && res.reason ? res.reason : 'Failed');
  }
});

toggleBtn.addEventListener('click', async () => {
  if (!currentHost) return;
  toggleBtn.disabled = true;
  const res = await chrome.runtime.sendMessage({ type: 'TOGGLE_SILENT', hostname: currentHost });
  toggleBtn.disabled = false;
  if (res && res.ok && res.list.includes(currentHost)) {
    statusEl.className = 'status ok';
    statusEl.textContent = `✓ Added. Next click / F5 will silently clear & reload.`;
    setTimeout(() => window.close(), 1200);
  }
});

$('manage').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
  window.close();
});

init();
