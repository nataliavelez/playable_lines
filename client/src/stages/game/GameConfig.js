// Set this to false when you want to disable console logs
export const CONSOLE_ENABLED = true;

// Enhanced logging wrapper that also saves to Empirica
export const GameLog = {
  // Internal storage for logs
  _logs: [],
  _player: null,
  _round: null,
  
  // Set context for logging
  setContext(player, round = null) {
    this._player = player;
    this._round = round || player?.round;
  },
  
  // Core logging function
  _log(level, message, data = null, category = 'client') {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data: data ? JSON.stringify(data) : null,
      category,
      playerId: this._player?.id || null,
      roundId: this._round?.id || null
    };
    
    // Print to console if enabled
    if (CONSOLE_ENABLED) {
      const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
      console[consoleMethod](`[${category}] ${message}`, data || '');
    }
    
    // Store in memory
    this._logs.push(logEntry);
    
    // Save to Empirica if we have context
    this._saveToEmpiricalData(logEntry);
  },
  
  // Save to Empirica data system
  _saveToEmpiricalData(logEntry) {
    try {
      if (this._round) {
        const existingLogs = this._round.get("clientLogs") || [];
        existingLogs.push(logEntry);
        this._round.set("clientLogs", existingLogs);
      } else if (this._player) {
        const existingLogs = this._player.get("clientLogs") || [];
        existingLogs.push(logEntry);
        this._player.set("clientLogs", existingLogs);
      }
    } catch (err) {
      console.error("Failed to save client log to Empirica:", err);
    }
  },
  
  // Public methods
  log: (message, data = null, category = 'client') => {
    GameLog._log('log', message, data, category);
  },
  
  warn: (message, data = null, category = 'client') => {
    GameLog._log('warn', message, data, category);
  },
  
  error: (message, data = null, category = 'client') => {
    GameLog._log('error', message, data, category);
  },
  
  debug: (message, data = null, category = 'client') => {
    GameLog._log('debug', message, data, category);
  },
  
  // Specialized logging methods
  playerAction: (action, data = null) => {
    GameLog._log('log', `Player action: ${action}`, data, 'player_action');
  },
  
  gameEvent: (event, data = null) => {
    GameLog._log('log', `Game event: ${event}`, data, 'game_event');
  },
  
  movement: (fromPos, toPos, direction, data = null) => {
    GameLog._log('log', `Movement from (${fromPos?.x},${fromPos?.y}) to (${toPos?.x},${toPos?.y}) facing ${direction}`, 
      { fromPos, toPos, direction, ...data }, 'movement');
  },
  
  // Get all logs
  getLogs: () => GameLog._logs,
  
  // Clear logs
  clearLogs: () => {
    GameLog._logs = [];
  },
  
  // Save logs batch
  saveLogsBatch: () => {
    if (GameLog._logs.length === 0) return;
    
    const batchData = {
      timestamp: new Date().toISOString(),
      logs: GameLog._logs,
      count: GameLog._logs.length
    };
    
    if (GameLog._round) {
      GameLog._round.set("clientLogsBatch", batchData);
    } else if (GameLog._player) {
      GameLog._player.set("clientLogsBatch", batchData);
    }
    
    GameLog._logs = [];
  }
}; 