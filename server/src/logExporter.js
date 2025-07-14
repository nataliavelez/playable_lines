/**
 * Log Export Utility for Empirica Data
 * 
 * This utility helps extract and format logs from Empirica's data export.
 * Use this after running `empirica export` to analyze the saved logs.
 */

export class LogExporter {
  
  /**
   * Extract all server logs from a game data structure
   * @param {Object} gameData - The game data from Empirica export
   * @returns {Array} Array of log entries
   */
  static extractServerLogs(gameData) {
    const logs = [];
    
    // Extract game-level logs
    if (gameData.serverLogs) {
      logs.push(...gameData.serverLogs);
    }
    
    // Extract round-level logs
    if (gameData.rounds) {
      gameData.rounds.forEach(round => {
        if (round.serverLogs) {
          logs.push(...round.serverLogs);
        }
      });
    }
    
    return logs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }
  
  /**
   * Extract all client logs from a game data structure
   * @param {Object} gameData - The game data from Empirica export
   * @returns {Array} Array of log entries
   */
  static extractClientLogs(gameData) {
    const logs = [];
    
    // Extract player-level logs
    if (gameData.players) {
      gameData.players.forEach(player => {
        if (player.clientLogs) {
          logs.push(...player.clientLogs);
        }
      });
    }
    
    // Extract round-level client logs
    if (gameData.rounds) {
      gameData.rounds.forEach(round => {
        if (round.clientLogs) {
          logs.push(...round.clientLogs);
        }
      });
    }
    
    return logs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }
  
  /**
   * Filter logs by category
   * @param {Array} logs - Array of log entries
   * @param {string} category - Category to filter by
   * @returns {Array} Filtered logs
   */
  static filterByCategory(logs, category) {
    return logs.filter(log => log.category === category);
  }
  
  /**
   * Filter logs by level
   * @param {Array} logs - Array of log entries
   * @param {string} level - Log level to filter by
   * @returns {Array} Filtered logs
   */
  static filterByLevel(logs, level) {
    return logs.filter(log => log.level === level);
  }
  
  /**
   * Filter logs by player ID
   * @param {Array} logs - Array of log entries
   * @param {string} playerId - Player ID to filter by
   * @returns {Array} Filtered logs
   */
  static filterByPlayer(logs, playerId) {
    return logs.filter(log => log.playerId === playerId);
  }
  
  /**
   * Filter logs by time range
   * @param {Array} logs - Array of log entries
   * @param {Date} startTime - Start time
   * @param {Date} endTime - End time
   * @returns {Array} Filtered logs
   */
  static filterByTimeRange(logs, startTime, endTime) {
    return logs.filter(log => {
      const logTime = new Date(log.timestamp);
      return logTime >= startTime && logTime <= endTime;
    });
  }
  
  /**
   * Convert logs to CSV format
   * @param {Array} logs - Array of log entries
   * @returns {string} CSV string
   */
  static toCSV(logs) {
    if (logs.length === 0) return '';
    
    const headers = ['timestamp', 'level', 'category', 'message', 'playerId', 'roundId', 'gameId', 'data'];
    const csvRows = [headers.join(',')];
    
    logs.forEach(log => {
      const row = [
        log.timestamp,
        log.level,
        log.category,
        `"${log.message.replace(/"/g, '""')}"`, // Escape quotes
        log.playerId || '',
        log.roundId || '',
        log.gameId || '',
        log.data ? `"${log.data.replace(/"/g, '""')}"` : ''
      ];
      csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
  }
  
  /**
   * Generate a movement timeline for a specific player
   * @param {Array} logs - Array of log entries
   * @param {string} playerId - Player ID
   * @returns {Array} Movement timeline
   */
  static getMovementTimeline(logs, playerId) {
    const movementLogs = logs.filter(log => 
      log.category === 'movement' && 
      log.playerId === playerId
    );
    
    return movementLogs.map(log => {
      const data = JSON.parse(log.data || '{}');
      return {
        timestamp: log.timestamp,
        from: data.fromPos,
        to: data.toPos,
        direction: data.direction
      };
    });
  }
  
  /**
   * Get game event summary
   * @param {Array} logs - Array of log entries
   * @returns {Object} Summary of game events
   */
  static getGameEventSummary(logs) {
    const gameEvents = logs.filter(log => log.category === 'game_event');
    const summary = {};
    
    gameEvents.forEach(log => {
      const message = log.message.replace('Game event: ', '');
      summary[message] = (summary[message] || 0) + 1;
    });
    
    return summary;
  }
  
  /**
   * Get player action summary
   * @param {Array} logs - Array of log entries
   * @returns {Object} Summary of player actions
   */
  static getPlayerActionSummary(logs) {
    const playerActions = logs.filter(log => log.category === 'player_action');
    const summary = {};
    
    playerActions.forEach(log => {
      const playerId = log.playerId;
      const action = log.message.replace('Player ' + playerId + ' performed action: ', '');
      
      if (!summary[playerId]) {
        summary[playerId] = {};
      }
      
      summary[playerId][action] = (summary[playerId][action] || 0) + 1;
    });
    
    return summary;
  }
  
  /**
   * Print a formatted log report to console
   * @param {Array} logs - Array of log entries
   */
  static printReport(logs) {
    console.log('=== LOG REPORT ===');
    console.log(`Total logs: ${logs.length}`);
    console.log('');
    
    // Log levels
    const levels = {};
    logs.forEach(log => {
      levels[log.level] = (levels[log.level] || 0) + 1;
    });
    console.log('Log levels:');
    Object.entries(levels).forEach(([level, count]) => {
      console.log(`  ${level}: ${count}`);
    });
    console.log('');
    
    // Categories
    const categories = {};
    logs.forEach(log => {
      categories[log.category] = (categories[log.category] || 0) + 1;
    });
    console.log('Categories:');
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`  ${category}: ${count}`);
    });
    console.log('');
    
    // Time range
    if (logs.length > 0) {
      const startTime = new Date(logs[0].timestamp);
      const endTime = new Date(logs[logs.length - 1].timestamp);
      console.log(`Time range: ${startTime.toISOString()} to ${endTime.toISOString()}`);
      console.log(`Duration: ${(endTime - startTime) / 1000} seconds`);
    }
    
    console.log('=== END REPORT ===');
  }
}

// Example usage (uncomment to use in Node.js environment):
/*
// After running `empirica export` and having the data
import fs from 'fs';

const gameData = JSON.parse(fs.readFileSync('path/to/exported/data.json', 'utf8'));
const serverLogs = LogExporter.extractServerLogs(gameData);
const clientLogs = LogExporter.extractClientLogs(gameData);

// Print reports
LogExporter.printReport(serverLogs);
LogExporter.printReport(clientLogs);

// Export to CSV
const serverCSV = LogExporter.toCSV(serverLogs);
fs.writeFileSync('server_logs.csv', serverCSV);

const clientCSV = LogExporter.toCSV(clientLogs);
fs.writeFileSync('client_logs.csv', clientCSV);

// Get movement timeline for a player
const movementTimeline = LogExporter.getMovementTimeline(serverLogs, 'player_id_here');
console.log('Movement timeline:', movementTimeline);
*/ 