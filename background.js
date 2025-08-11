chrome.action.onClicked.addListener(() => {
  chrome.windows.getCurrent({}, w => {
    chrome.tabs.create({ url: chrome.runtime.getURL('index.html'), windowId: w.id });
  });
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({ id: 'save-current-tab', title: 'Save this tab URL', contexts: ['page','frame'] });
  chrome.contextMenus.create({ id: 'save-domain-tabs', title: 'Save all tabs from this domain', contexts: ['page','frame'] });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if(!tab||!tab.url) return;
  if(info.menuItemId==='save-current-tab') {
    chrome.runtime.sendMessage({ type:'SAVE_SINGLE', url: tab.url, title: tab.title });
  }
  if(info.menuItemId==='save-domain-tabs') {
    const u=new URL(tab.url);
    chrome.runtime.sendMessage({ type:'SAVE_DOMAIN', domain: u.hostname });
  }
});

chrome.commands.onCommand.addListener(cmd => {
  if(cmd==='save-tabs') {
    chrome.runtime.sendMessage({ type:'SAVE_ALL' });
  } else if(cmd==='open-last-snapshot') {
    chrome.windows.getCurrent({}, w => {
      chrome.tabs.create({ url: chrome.runtime.getURL('index.html'), windowId: w.id });
    });
  }
});