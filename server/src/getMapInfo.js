export function getMapInfo(universalizability) {
    // Note the logic is written so that if X players are in a game, the map will take the first X start positions
    // and permute them. This is to ensure that players start in different locations each round, but to also allow 
    // for the same map to be used for different player counts and to have control over what that looks like.
    const mapData = {
        low: {
            low1: [
                {x: 5, y: 6}, {x: 6, y: 8}, {x: 7, y: 7}, {x: 8, y: 9},
                {x: 6, y: 7}, {x: 7, y: 9}, {x: 8, y: 10}, {x: 7, y: 5}
            ],
            low2: [
                {x: 5, y: 6}, {x: 6, y: 8}, {x: 7, y: 7}, {x: 8, y: 9},
                {x: 6, y: 7}, {x: 7, y: 9}, {x: 8, y: 10}, {x: 7, y: 5}
            ],
            low3: [
                {x: 5, y: 6}, {x: 6, y: 8}, {x: 7, y: 7}, {x: 8, y: 9},
                {x: 6, y: 7}, {x: 7, y: 9}, {x: 8, y: 10}, {x: 7, y: 5}
            ]
        },
        medium: {   
            medium1: [
                {x: 6, y: 2}, {x: 7, y: 4}, {x: 8, y: 1}, {x: 9, y: 3},
                {x: 5, y: 4}, {x: 7, y: 3}, {x: 8, y: 5}, {x: 8, y: 3}
            ]
        },
        high: {
            high1: [
                {x: 5, y: 6}, {x: 6, y: 8}, {x: 7, y: 7}, {x: 8, y: 9},
                {x: 6, y: 7}, {x: 7, y: 9}, {x: 8, y: 10}, {x: 7, y: 5}
            ],
            high2: [
                {x: 9, y: 1}, {x: 11, y: 3}, {x: 12, y: 4}, {x: 13, y: 5},
                {x: 8, y: 3}, {x: 14, y: 4}, {x: 12, y: 2}, {x: 14, y: 6}
            ],
            high3: [
                {x: 9, y: 1}, {x: 11, y: 3}, {x: 12, y: 4}, {x: 13, y: 5},
                {x: 8, y: 3}, {x: 14, y: 4}, {x: 12, y: 2}, {x: 14, y: 6}
            ]
        }
    };

    return mapData[universalizability.toLowerCase()] || {};
}