const KEY = "tab";
const INBOX = "w-inbox";

async function addLink(title, url) {
  if (!url || !/^https?:/i.test(url)) return false;
  const { [KEY]: state } = await chrome.storage.local.get(KEY);
  if (!state?.spaces?.length) return false;

  let target = null;
  for (const space of state.spaces) {
    target = space.widgets.find((w) => w.id === INBOX);
    if (target) break;
  }
  if (!target) {
    for (const space of state.spaces) {
      target = space.widgets.find((w) => w.kind === "links");
      if (target) break;
    }
  }
  if (!target) return false;
  target.links = target.links || [];
  if (target.links.some((l) => l.url === url)) return true;

  target.links.unshift({ id: crypto.randomUUID(), title: title || url, url });
  state._rev = crypto.randomUUID();
  await chrome.storage.local.set({ [KEY]: state });
  return true;
}

async function flash(tabId, ok) {
  try {
    await chrome.action.setBadgeBackgroundColor({ color: ok ? "#1f9d55" : "#c81e1e" });
    await chrome.action.setBadgeText({ text: ok ? "✓" : "!", tabId });
    setTimeout(() => chrome.action.setBadgeText({ text: "", tabId }), 1600);
  } catch {
    /* Tab schon zu */
  }
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "tab-add",
      title: "In die Zentrale-Inbox legen",
      contexts: ["page", "link"],
    });
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "tab-add") return;
  const url = info.linkUrl || info.pageUrl || tab?.url;
  const title = info.linkUrl ? info.selectionText || info.linkUrl : tab?.title || url;
  flash(tab?.id, await addLink(title, url));
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "save-tab") return;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.url) flash(tab.id, await addLink(tab.title, tab.url));
});

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({});
});
