// PoolManager Chrome Extension Popup Script

class PopupManager {
  constructor() {
    this.games = [];
    this.isNumber1PoolPage = false;
    this.init();
  }

  async init() {
    await this.checkCurrentTab();
    this.setupEventListeners();
    this.loadStoredData();
  }

  async checkCurrentTab() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (tab && tab.url) {
        // More flexible detection - allow any number1pool page
        this.isNumber1PoolPage = tab.url.includes('number1pool.com');

        this.updateStatus(
          this.isNumber1PoolPage
            ? '✅ Number1Pool page detected'
            : '⚠️ Not on Number1Pool page',
          this.isNumber1PoolPage ? 'success' : 'error'
        );
      }
    } catch (error) {
      console.error('Error checking tab:', error);
      this.updateStatus('Error checking current page', 'error');
    }
  }

  setupEventListeners() {
    // Load data button
    document.getElementById('load-data').addEventListener('click', () => {
      this.loadGameData();
    });

    // Auto-fill button
    document.getElementById('fill-ai').addEventListener('click', () => {
      this.sendAutoFillMessage('ai');
    });

    document.getElementById('clear-all').addEventListener('click', () => {
      this.sendClearMessage();
    });

    // Show panel button
    document.getElementById('show-panel').addEventListener('click', () => {
      this.showPanelOnPage();
    });
  }

  async loadStoredData() {
    try {
      const result = await chrome.storage.local.get(['poolmanagerGames']);
      if (result.poolmanagerGames && result.poolmanagerGames.length > 0) {
        this.games = result.poolmanagerGames;
        this.updateUI();
      }
    } catch (error) {
      console.error('Error loading stored data:', error);
    }
  }

  loadGameData() {
    const gameDataInput = document.getElementById('game-data-input');
    const gameDataText = gameDataInput.value.trim();

    if (!gameDataText) {
      this.updateStatus('Please paste game data from PoolManager', 'error');
      return;
    }

    try {
      // Parse the JSON data
      const gameData = JSON.parse(gameDataText);

      if (!Array.isArray(gameData) || gameData.length === 0) {
        throw new Error('Invalid game data format');
      }

      // Validate the data structure
      const firstGame = gameData[0];
      if (!firstGame.favorite || !firstGame.underdog) {
        throw new Error('Game data missing required fields (favorite/underdog)');
      }

      // Check if we have AI recommendations
      const hasAiPicks = gameData.some(game => game.recommendation || game.aiPick);
      console.log(`[PoolManager] Data loaded: ${gameData.length} games, AI picks: ${hasAiPicks}`);

      // Store the games
      this.games = gameData;

      // Save to Chrome storage
      chrome.storage.local.set({
        poolmanagerGames: gameData,
        lastUpdate: Date.now()
      }, () => {
        if (chrome.runtime.lastError) {
          console.error('Storage error:', chrome.runtime.lastError);
          this.updateStatus('Error saving data', 'error');
          return;
        }

        this.updateStatus(`✅ Loaded ${gameData.length} games successfully`, 'success');
        this.updateUI();

        // Clear the input
        gameDataInput.value = '';

        console.log(`[PoolManager] Stored ${gameData.length} games in Chrome storage`);
      });

    } catch (error) {
      console.error('Error parsing game data:', error);
      this.updateStatus('Invalid game data format. Make sure you copied the correct data.', 'error');
    }
  }

  async sendAutoFillMessage(type) {
    if (!this.isNumber1PoolPage) {
      this.updateStatus('Please navigate to Number1Pool picks page first', 'error');
      return;
    }

    if (this.games.length === 0) {
      this.updateStatus('No game data available. Fetch data first.', 'error');
      return;
    }

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      // Send message to content script
      const response = await chrome.tabs.sendMessage(tab.id, {
        type: 'SET_GAMES_DATA',
        games: this.games
      });

      if (response && response.success) {
        // Trigger auto-fill
        await chrome.tabs.sendMessage(tab.id, {
          type: 'AUTO_FILL_NOW',
          fillType: type
        });

        this.updateStatus(`✅ Auto-filled with ${type}`, 'success');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      this.updateStatus('Error communicating with page', 'error');
    }
  }

  async sendClearMessage() {
    if (!this.isNumber1PoolPage) {
      this.updateStatus('Please navigate to Number1Pool picks page first', 'error');
      return;
    }

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      await chrome.tabs.sendMessage(tab.id, {
        type: 'CLEAR_ALL_PICKS'
      });

      this.updateStatus('✅ Cleared all picks', 'success');
    } catch (error) {
      console.error('Error clearing picks:', error);
      this.updateStatus('Error clearing picks', 'error');
    }
  }

  updateStatus(message, type = 'info') {
    const statusEl = document.getElementById('status');
    statusEl.textContent = message;
    statusEl.className = `status status-${type}`;
  }

  async showPanelOnPage() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      // First, ensure the content script is injected
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });

      // Add styles too
      await chrome.scripting.insertCSS({
        target: { tabId: tab.id },
        files: ['styles.css']
      });

      // Send message to show the panel
      await chrome.tabs.sendMessage(tab.id, {
        type: 'SHOW_PANEL'
      });

      this.updateStatus('✅ Panel shown on page', 'success');

      // Close the popup
      window.close();
    } catch (error) {
      console.error('Error showing panel:', error);
      this.updateStatus('Error showing panel on page', 'error');
    }
  }

  updateUI() {
    const gamesInfoEl = document.getElementById('games-info');
    const fillAiBtn = document.getElementById('fill-ai');
    const clearAllBtn = document.getElementById('clear-all');

    if (this.games.length > 0) {
      // Check if AI recommendations are available
      const hasAiPicks = this.games.some(game => game.aiPick);

      gamesInfoEl.textContent = `${this.games.length} games loaded${hasAiPicks ? ' (with AI picks)' : ''}`;

      const buttonsEnabled = this.isNumber1PoolPage;
      fillAiBtn.disabled = !buttonsEnabled;
      clearAllBtn.disabled = !buttonsEnabled;

      if (!buttonsEnabled) {
        this.updateStatus('Navigate to Number1Pool to enable auto-fill', 'info');
      }
    } else {
      gamesInfoEl.textContent = 'No game data loaded';
      fillAiBtn.disabled = true;
      clearAllBtn.disabled = true;
    }
  }
}

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
});