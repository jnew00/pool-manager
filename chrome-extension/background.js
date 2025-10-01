// PoolManager Chrome Extension Background Script

chrome.runtime.onInstalled.addListener(() => {
  console.log('PoolManager Auto-Fill extension installed');

  // Create context menu for easy access
  try {
    chrome.contextMenus.create({
      id: 'poolmanager-autofill',
      title: 'PoolManager Auto-Fill',
      contexts: ['page'],
      documentUrlPatterns: ['https://number1pool.com/*']
    });
  } catch (error) {
    console.error('Error creating context menu:', error);
  }
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'STORE_GAMES_DATA') {
    // Store games data in Chrome storage - determine pool type
    const poolType = message.poolType || 'ATS'; // Default to ATS
    const storageKey = poolType === 'PP' ? 'poolmanagerGames_PP' : 'poolmanagerGames_ATS';

    chrome.storage.local.set({
      [storageKey]: message.games,
      lastUpdate: Date.now()
    }, () => {
      sendResponse({ success: true });
    });
    return true; // Keep message channel open for async response
  }

  if (message.type === 'GET_GAMES_DATA') {
    // Retrieve games data from Chrome storage - both pool types
    chrome.storage.local.get(['poolmanagerGames_ATS', 'poolmanagerGames_PP', 'lastUpdate'], (result) => {
      sendResponse({
        atsGames: result.poolmanagerGames_ATS || [],
        ppGames: result.poolmanagerGames_PP || [],
        lastUpdate: result.lastUpdate || null
      });
    });
    return true; // Keep message channel open for async response
  }
});

// Handle context menu clicks with error checking
if (chrome.contextMenus && chrome.contextMenus.onClicked) {
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'poolmanager-autofill') {
      // Send message to content script to show the auto-fill panel
      chrome.tabs.sendMessage(tab.id, {
        type: 'SHOW_AUTOFILL_PANEL'
      });
    }
  });
} else {
  console.warn('Context menus not available');
}

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