import { EventBus } from './EventBus';

class GameState {
    constructor() {
        this.state = {
            playerStates: {},
            mapName: null,
            obstacles: null,
            isVisible: true
        };
        
        // Subscribe to state changes
        EventBus.on('player-state-change', this.handlePlayerStateChange.bind(this));
        EventBus.on('visibility-change', this.handleVisibilityChange.bind(this));
    }

    handlePlayerStateChange({ playerId, changes }) {
        if (!this.state.playerStates[playerId]) {
            this.state.playerStates[playerId] = {};
        }
        
        // Update only changed values
        Object.entries(changes).forEach(([key, value]) => {
            this.state.playerStates[playerId][key] = value;
        });

        // Notify listeners of state change
        EventBus.emit('game-state-updated', this.state);
    }

    handleVisibilityChange(isVisible) {
        this.state.isVisible = isVisible;
        EventBus.emit('game-state-updated', this.state);
    }

    setMapName(mapName) {
        this.state.mapName = mapName;
        EventBus.emit('game-state-updated', this.state);
    }

    setObstacles(obstacles) {
        this.state.obstacles = obstacles;
        EventBus.emit('game-state-updated', this.state);
    }

    getState() {
        return this.state;
    }

    getPlayerState(playerId) {
        return this.state.playerStates[playerId];
    }

    getAllPlayerStates() {
        return this.state.playerStates;
    }
}

// Create singleton instance
export const gameState = new GameState(); 