// PoolManager Chrome Extension Background Script

chrome.runtime.onInstalled.addListener(() => {
  console.log('PoolManager Auto-Fill extension installed');
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'STORE_GAMES_DATA') {
    // Store games data in Chrome storage
    chrome.storage.local.set({
      poolmanagerGames: message.games,
      lastUpdate: Date.now()
    }, () => {
      sendResponse({ success: true });
    });
    return true; // Keep message channel open for async response
  }

  if (message.type === 'GET_GAMES_DATA') {
    // Retrieve games data from Chrome storage
    chrome.storage.local.get(['poolmanagerGames', 'lastUpdate'], (result) => {
      sendResponse({
        games: result.poolmanagerGames || [],
        lastUpdate: result.lastUpdate || null
      });
    });
    return true; // Keep message channel open for async response
  }
});

// Context menu for easy access
chrome.contextMenus.create({
  id: 'poolmanager-autofill',
  title: 'PoolManager Auto-Fill',
  contexts: ['page'],
  documentUrlPatterns: ['https://number1pool.com/*']
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'poolmanager-autofill') {
    // Send message to content script to show the auto-fill panel
    chrome.tabs.sendMessage(tab.id, {
      type: 'SHOW_AUTOFILL_PANEL'
    });
  }
});

// Badge to show when on Number1Pool
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    if (tab.url.includes('number1pool.com') && tab.url.includes('picks_weekly.php')) {
      chrome.action.setBadgeText({
        text: '⚡',
        tabId: tabId
      });
      chrome.action.setBadgeBackgroundColor({
        color: '#2563eb',
        tabId: tabId
      });
    } else {
      chrome.action.setBadgeText({
        text: '',
        tabId: tabId
      });
    }
  }
});