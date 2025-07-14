# Empirica Logging System

This document describes the enhanced logging system that both prints to console and saves logs to Empirica's data storage for later analysis.

## Overview

The logging system has been enhanced to provide:
- **Console logging** for real-time monitoring during development
- **Persistent storage** in Empirica's data system for analysis
- **Structured logging** with categories and metadata
- **Easy export** for post-game analysis

## Server-Side Logging

### Using GameLogger

The server uses the `GameLogger` class from `server/src/logger.js`:

```javascript
import { GameLogger } from './logger.js';

// Set context (done automatically in callbacks)
GameLogger.setContext(game, round);

// Basic logging
GameLogger.info("Game started", { playerCount: 4 });
GameLogger.warn("Low player count", { count: 1 });
GameLogger.error("Database connection failed", { error: "timeout" });

// Specialized logging methods
GameLogger.playerAction(playerId, "moved", { from: {x: 1, y: 2}, to: {x: 2, y: 2} });
GameLogger.gameEvent("round_started", { roundNumber: 1 });
GameLogger.movement(playerId, fromPos, toPos, direction);
GameLogger.waterAction(playerId, "picked_up_water", { timestamp: Date.now() });
```

### Log Categories

Server logs are automatically categorized:
- `general` - General information
- `player_action` - Player-specific actions
- `game_event` - Game-level events
- `movement` - Player movement
- `water_action` - Water-related actions
- `round_event` - Round-specific events

### Data Storage

Server logs are saved to:
- `round.get("serverLogs")` - Array of log entries for each round
- `game.get("serverLogs")` - Array of log entries for the entire game
- `round.get("logsBatch")` - Batched logs saved at round end
- `game.get("logsBatch")` - Batched logs saved at game end

## Client-Side Logging

### Using GameLog

The client uses the enhanced `GameLog` from `client/src/stages/game/GameConfig.js`:

```javascript
import { GameLog } from './GameConfig';

// Context is set automatically in GridWorld component
// GameLog.setContext(player, round);

// Basic logging
GameLog.log("Player joined game", { playerId: player.id });
GameLog.warn("Connection unstable", { latency: 500 });
GameLog.error("Failed to load assets", { asset: "map.png" });

// Specialized logging
GameLog.playerAction("button_clicked", { button: "ready" });
GameLog.gameEvent("phaser_game_loaded", { mapName: "map1" });
GameLog.movement(fromPos, toPos, direction, { timestamp: Date.now() });
```

### Data Storage

Client logs are saved to:
- `round.get("clientLogs")` - Array of log entries for each round
- `player.get("clientLogs")` - Array of log entries for each player
- `round.get("clientLogsBatch")` - Batched logs saved when requested
- `player.get("clientLogsBatch")` - Batched logs saved when requested

## Log Structure

Each log entry contains:
```javascript
{
  timestamp: "2024-01-15T10:30:00.000Z",
  level: "info",           // info, warn, error, debug
  message: "Player moved", // Human-readable message
  data: "JSON string",     // Additional data as JSON
  category: "movement",    // Log category
  playerId: "player_123",  // Player ID (if applicable)
  roundId: "round_456",    // Round ID (if applicable)
  gameId: "game_789"       // Game ID (if applicable)
}
```

## Accessing Logs

### During Development

Logs are printed to console in real-time:
```
[movement] Player player_123 moved from (1,2) to (2,2) facing right
[game_event] Game event: round_started
[player_action] Player player_123 performed action: player_ready
```

### After Game Completion

Use Empirica's export system:

```bash
# Export game data
empirica export

# This creates a ZIP file with JSON data including all logs
```

### Using the LogExporter Utility

The `LogExporter` class helps analyze exported logs:

```javascript
import { LogExporter } from './server/src/logExporter.js';
import fs from 'fs';

// Load exported data
const gameData = JSON.parse(fs.readFileSync('exported_data.json', 'utf8'));

// Extract logs
const serverLogs = LogExporter.extractServerLogs(gameData);
const clientLogs = LogExporter.extractClientLogs(gameData);

// Print summary reports
LogExporter.printReport(serverLogs);
LogExporter.printReport(clientLogs);

// Export to CSV
const serverCSV = LogExporter.toCSV(serverLogs);
fs.writeFileSync('server_logs.csv', serverCSV);

// Filter logs
const movementLogs = LogExporter.filterByCategory(serverLogs, 'movement');
const player1Logs = LogExporter.filterByPlayer(serverLogs, 'player_123');
const errorLogs = LogExporter.filterByLevel(serverLogs, 'error');

// Get specialized reports
const movementTimeline = LogExporter.getMovementTimeline(serverLogs, 'player_123');
const gameEventSummary = LogExporter.getGameEventSummary(serverLogs);
const playerActionSummary = LogExporter.getPlayerActionSummary(serverLogs);
```

## Configuration

### Disabling Console Logging

Client-side console logging can be disabled:

```javascript
// In client/src/stages/game/GameConfig.js
export const CONSOLE_ENABLED = false;
```

### Server Log Levels

Server log levels can be controlled via command line:

```bash
# Set log level when starting server
npm run dev -- --loglevel=debug
```

## Examples

### Tracking Player Movement

```javascript
// Server-side (in callbacks.js)
GameLogger.movement(player.id, currentPos, newPos, direction);

// Client-side (in Game.js)
GameLog.movement(oldPos, newPos, direction, { 
  timestamp: Date.now(),
  successful: true 
});
```

### Logging Game Events

```javascript
// When a round starts
GameLogger.roundEvent("Round started", { 
  roundNumber: 1, 
  mapName: "map1" 
});

// When all players are ready
GameLogger.gameEvent("All players ready", { 
  playerCount: 4, 
  readyTime: Date.now() 
});
```

### Error Tracking

```javascript
// Server-side error
GameLogger.error("Failed to process move", { 
  playerId: player.id, 
  error: "invalid position" 
});

// Client-side error
GameLog.error("Asset loading failed", { 
  asset: "player_sprite.png", 
  error: error.message 
});
```

## Best Practices

1. **Use appropriate log levels**: `info` for normal events, `warn` for potential issues, `error` for problems
2. **Include relevant data**: Always include context like player ID, round number, timestamps
3. **Use consistent categories**: Stick to the predefined categories for easier filtering
4. **Structured data**: Pass objects to the data parameter for better analysis
5. **Meaningful messages**: Write clear, descriptive messages that explain what happened

## Troubleshooting

### Logs Not Appearing in Console

1. Check if `CONSOLE_ENABLED` is true in `GameConfig.js`
2. Verify log level settings
3. Ensure context is set properly with `setContext()`

### Logs Not Saved to Empirica

1. Check if game/round context is set correctly
2. Verify Empirica connection is working
3. Check for JavaScript errors in browser console
4. Ensure you're using the correct `GameLogger` import

### Missing Logs in Export

1. Make sure logs were saved during the game
2. Check if `saveLogsBatch()` was called at appropriate times
3. Verify the export process completed successfully
4. Check both game-level and round-level data in the export

## Migration from Old Logging

If you have existing `console.log` statements, you can migrate them:

```javascript
// Old way
console.log("Player moved", { playerId, position });

// New way
GameLogger.movement(playerId, oldPos, newPos, direction);

// Or for general logging
GameLogger.info("Player moved", { playerId, position });
```

The new system provides the same console output plus persistent storage for analysis. 