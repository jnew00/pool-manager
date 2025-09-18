// PoolManager Listener - Runs on PoolManager domain to capture AI picks data

console.log('[PoolManager Listener] Script loaded on:', window.location.href);

// Listen for the custom event dispatched by the "+ AI Picks" button
window.addEventListener('poolmanager-data', async (event) => {
  console.log('[PoolManager Listener] Received data event:', event.detail);

  try {
    // Store the data in Chrome storage for the extension to access
    await chrome.storage.local.set({
      poolmanagerGames: event.detail.games,
      lastUpdate: event.detail.lastUpdate,
      week: event.detail.week,
      poolId: event.detail.poolId
    });

    console.log(`[PoolManager Listener] Stored ${event.detail.games.length} games in Chrome storage`);

    // Show a brief success indicator
    const indicator = document.createElement('div');
    indicator.textContent = '✅ Extension data updated!';
    indicator.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 14px;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    document.body.appendChild(indicator);

    setTimeout(() => {
      indicator.remove();
    }, 3000);

  } catch (error) {
    console.error('[PoolManager Listener] Failed to store data:', error);
  }
});

// Also monitor localStorage changes as a backup
let lastLocalStorageCheck = '';
setInterval(() => {
  const current = localStorage.getItem('poolmanagerExtensionData');
  if (current && current !== lastLocalStorageCheck) {
    lastLocalStorageCheck = current;
    try {
      const data = JSON.parse(current);
      if (data.games && data.games.length > 0) {
        console.log('[PoolManager Listener] Detected localStorage change, storing in Chrome storage');
        chrome.storage.local.set({
          poolmanagerGames: data.games,
          lastUpdate: data.lastUpdate,
          week: data.week,
          poolId: data.poolId
        });
      }
    } catch (e) {
      console.warn('[PoolManager Listener] Failed to parse localStorage data:', e);
    }
  }
}, 1000);