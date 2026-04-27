const $ = (id) => document.getElementById(id);
const listEl = $('list');
const inputEl = $('newHost');
const addBtn = $('add');

function normalize(input) {
  if (!input) return '';
  let s = input.trim().toLowerCase();
  s = s.replace(/^https?:\/\//, '');
  s = s.replace(/^www\./, '');
  s = s.split('/')[0];
  s = s.split(':')[0];
  return s;
}

async function load() {
  const { ok, list } = await chrome.runtime.sendMessage({ type: 'GET_LIST' });
  render(ok ? list : []);
}

function render(list) {
  listEl.innerHTML = '';
  if (!list.length) {
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.textContent = 'No sites yet. Add one above, or open the popup on a site and click "+ Silent".';
    listEl.appendChild(empty);
    return;
  }
  for (const host of list) {
    const li = document.createElement('li');
    li.className = 'item';
    const name = document.createElement('span');
    name.textContent = host;
    const rm = document.createElement('button');
    rm.className = 'danger';
    rm.textContent = 'Remove';
    rm.addEventListener('click', async () => {
      const next = list.filter(h => h !== host);
      await chrome.runtime.sendMessage({ type: 'SET_LIST', list: next });
      render(next);
    });
    li.append(name, rm);
    listEl.appendChild(li);
  }
}

addBtn.addEventListener('click', async () => {
  const host = normalize(inputEl.value);
  if (!host) return;
  const { list = [] } = await chrome.runtime.sendMessage({ type: 'GET_LIST' });
  if (list.includes(host)) {
    inputEl.value = '';
    return;
  }
  const next = [...list, host];
  await chrome.runtime.sendMessage({ type: 'SET_LIST', list: next });
  inputEl.value = '';
  render(next);
});

inputEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addBtn.click();
});

load();
