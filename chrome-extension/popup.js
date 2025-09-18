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
        this.isNumber1PoolPage = tab.url.includes('number1pool.com') &&
                                tab.url.includes('picks_weekly.php');

        this.updateStatus(
          this.isNumber1PoolPage
            ? '✅ Number1Pool page detected'
            : '⚠️ Not on Number1Pool picks page',
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

    // Auto-fill buttons
    document.getElementById('fill-favorites').addEventListener('click', () => {
      this.sendAutoFillMessage('favorites');
    });

    document.getElementById('fill-underdogs').addEventListener('click', () => {
      this.sendAutoFillMessage('underdogs');
    });

    document.getElementById('fill-ai').addEventListener('click', () => {
      this.sendAutoFillMessage('custom');
    });

    document.getElementById('clear-all').addEventListener('click', () => {
      this.sendClearMessage();
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
      if (!firstGame.favorite || !firstGame.underdog || !firstGame.sortOrder) {
        throw new Error('Game data missing required fields');
      }

      // Store the games
      this.games = gameData;

      // Save to Chrome storage
      chrome.storage.local.set({
        poolmanagerGames: gameData,
        lastUpdate: Date.now()
      }, () => {
        this.updateStatus(`✅ Loaded ${gameData.length} games successfully`, 'success');
        this.updateUI();

        // Clear the input
        gameDataInput.value = '';
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

  updateUI() {
    const gamesInfoEl = document.getElementById('games-info');
    const fillFavoritesBtn = document.getElementById('fill-favorites');
    const fillUnderdogsBtn = document.getElementById('fill-underdogs');
    const fillAiBtn = document.getElementById('fill-ai');
    const clearAllBtn = document.getElementById('clear-all');

    if (this.games.length > 0) {
      // Check if AI recommendations are available
      const hasAiPicks = this.games.some(game => game.recommendation && game.recommendation !== '00');

      gamesInfoEl.textContent = `${this.games.length} games loaded${hasAiPicks ? ' (with AI picks)' : ''}`;

      const buttonsEnabled = this.isNumber1PoolPage;
      fillFavoritesBtn.disabled = !buttonsEnabled;
      fillUnderdogsBtn.disabled = !buttonsEnabled;
      fillAiBtn.disabled = !buttonsEnabled || !hasAiPicks;
      clearAllBtn.disabled = !buttonsEnabled;

      if (!buttonsEnabled) {
        this.updateStatus('Navigate to Number1Pool to enable auto-fill', 'info');
      }
    } else {
      gamesInfoEl.textContent = 'No game data loaded';
      fillFavoritesBtn.disabled = true;
      fillUnderdogsBtn.disabled = true;
      fillAiBtn.disabled = true;
      clearAllBtn.disabled = true;
    }
  }
}

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
});