import { info, warn, error, debug } from "@empirica/core/console";

class EmpiricalLogger {
  constructor() {
    this.logs = []; // In-memory buffer for batch operations
    this.currentRound = null;
    this.currentGame = null;
  }

  // Set the current round and game context
  setContext(game, round = null) {
    this.currentGame = game;
    this.currentRound = round;
  }

  // Core logging function that both prints and saves
  _log(level, message, data = null, category = 'general') {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data: data ? JSON.stringify(data) : null,
      category,
      roundId: this.currentRound?.id || null,
      gameId: this.currentGame?.id || null
    };

    // Print to console based on level
    switch (level) {
      case 'info':
        info(`[${category}] ${message}`, data || '');
        break;
      case 'warn':
        warn(`[${category}] ${message}`, data || '');
        break;
      case 'error':
        error(`[${category}] ${message}`, data || '');
        break;
      case 'debug':
        debug(`[${category}] ${message}`, data || '');
        break;
      default:
        console.log(`[${category}] ${message}`, data || '');
    }

    // Save to Empirica data system
    this._saveToEmpiricalData(logEntry);
  }

  // Save log entry to Empirica's data system
  _saveToEmpiricalData(logEntry) {
    try {
      if (this.currentRound) {
        // Save to round data
        const existingLogs = this.currentRound.get("serverLogs") || [];
        existingLogs.push(logEntry);
        this.currentRound.set("serverLogs", existingLogs);
      } else if (this.currentGame) {
        // Save to game data if no round context
        const existingLogs = this.currentGame.get("serverLogs") || [];
        existingLogs.push(logEntry);
        this.currentGame.set("serverLogs", existingLogs);
      }
    } catch (err) {
      console.error("Failed to save log to Empirica data system:", err);
    }
  }

  // Public logging methods
  info(message, data = null, category = 'general') {
    this._log('info', message, data, category);
  }

  warn(message, data = null, category = 'general') {
    this._log('warn', message, data, category);
  }

  error(message, data = null, category = 'general') {
    this._log('error', message, data, category);
  }

  debug(message, data = null, category = 'general') {
    this._log('debug', message, data, category);
  }

  // Specialized logging methods for common game events
  playerAction(playerId, action, data = null) {
    this._log('info', `Player ${playerId} performed action: ${action}`, data, 'player_action');
  }

  gameEvent(event, data = null) {
    this._log('info', `Game event: ${event}`, data, 'game_event');
  }

  movement(playerId, fromPos, toPos, direction) {
    this._log('info', `Player ${playerId} moved from (${fromPos.x},${fromPos.y}) to (${toPos.x},${toPos.y}) facing ${direction}`, 
      { playerId, fromPos, toPos, direction }, 'movement');
  }

  waterAction(playerId, action, data = null) {
    this._log('info', `Player ${playerId} water action: ${action}`, data, 'water_action');
  }

  roundEvent(event, data = null) {
    this._log('info', `Round event: ${event}`, data, 'round_event');
  }

  // Save all logs to a specific location (useful for round end)
  saveLogsBatch(target = 'round') {
    if (this.logs.length === 0) return;
    
    const batchData = {
      timestamp: new Date().toISOString(),
      logs: this.logs,
      count: this.logs.length
    };

    if (target === 'round' && this.currentRound) {
      this.currentRound.set("logsBatch", batchData);
    } else if (target === 'game' && this.currentGame) {
      this.currentGame.set("logsBatch", batchData);
    }

    this.logs = []; // Clear buffer
  }
}

// Export singleton instance
export const GameLogger = new EmpiricalLogger(); 