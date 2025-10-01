// PoolManager Listener - Runs on PoolManager domain to capture AI picks data

console.log('[PoolManager Listener] Script loaded on:', window.location.href);

// Listen for the custom event dispatched by the "+ AI Picks" button
window.addEventListener('poolmanager-data', async (event) => {
  console.log('[PoolManager Listener] Received data event:', event.detail);

  try {
    // Store ATS/O-U and Points Plus picks separately in Chrome storage
    await chrome.storage.local.set({
      poolmanagerGames_ATS: event.detail.atsOuGames,
      poolmanagerGames_PP: event.detail.pointsPlusGames,
      lastUpdate: event.detail.lastUpdate,
      week: event.detail.week,
      poolId: event.detail.poolId
    });

    console.log(`[PoolManager Listener] Stored ${event.detail.atsOuGames?.length || 0} ATS/O-U picks + ${event.detail.pointsPlusGames?.length || 0} Points Plus picks in Chrome storage`);

    // Notification removed - now handled by SweetAlert2 in the React app

  } catch (error) {
    console.error('[PoolManager Listener] Failed to store data:', error);
  }
});

// Also monitor localStorage changes as a backup
let lastAtsCheck = '';
let lastPpCheck = '';
setInterval(() => {
  // Check ATS/O-U localStorage
  const currentAts = localStorage.getItem('poolmanagerExtensionData_ATS');
  if (currentAts && currentAts !== lastAtsCheck) {
    lastAtsCheck = currentAts;
    try {
      const data = JSON.parse(currentAts);
      if (data.games && data.games.length > 0) {
        console.log('[PoolManager Listener] Detected ATS/O-U localStorage change, storing in Chrome storage');
        chrome.storage.local.set({
          poolmanagerGames_ATS: data.games,
          lastUpdate: data.lastUpdate,
          week: data.week,
          poolId: data.poolId
        });
      }
    } catch (e) {
      console.warn('[PoolManager Listener] Failed to parse ATS localStorage data:', e);
    }
  }

  // Check Points Plus localStorage
  const currentPp = localStorage.getItem('poolmanagerExtensionData_PP');
  if (currentPp && currentPp !== lastPpCheck) {
    lastPpCheck = currentPp;
    try {
      const data = JSON.parse(currentPp);
      if (data.games && data.games.length > 0) {
        console.log('[PoolManager Listener] Detected Points Plus localStorage change, storing in Chrome storage');
        chrome.storage.local.set({
          poolmanagerGames_PP: data.games,
          lastUpdate: data.lastUpdate,
          week: data.week,
          poolId: data.poolId
        });
      }
    } catch (e) {
      console.warn('[PoolManager Listener] Failed to parse Points Plus localStorage data:', e);
    }
  }
}, 1000);