export function getMapInfo(universalizability) {
    const mapData = {
        low: {
            low1: [
                {x: 3, y: 4}, {x: 5, y: 6}, {x: 7, y: 8}, {x: 9, y: 10},
                {x: 1, y: 5}, {x: 7, y: 9}, {x: 2, y: 12}, {x: 12, y: 1}
            ],
            low2: [
                {x: 3, y: 4}, {x: 5, y: 6}, {x: 7, y: 8}, {x: 9, y: 10},
                {x: 1, y: 5}, {x: 7, y: 9}, {x: 2, y: 12}, {x: 12, y: 1}
            ],
            low3: [
                {x: 3, y: 4}, {x: 5, y: 6}, {x: 7, y: 8}, {x: 9, y: 10},
                {x: 1, y: 5}, {x: 7, y: 9}, {x: 2, y: 12}, {x: 12, y: 1}
            ]
        },
        medium: {
            medium1: [
                {x: 3, y: 4}, {x: 5, y: 6}, {x: 7, y: 8}, {x: 9, y: 10},
                {x: 1, y: 5}, {x: 7, y: 9}, {x: 2, y: 12}, {x: 12, y: 1}
            ]
        },
        high: {
            high1: [
                {x: 3, y: 4}, {x: 5, y: 6}, {x: 7, y: 8}, {x: 9, y: 10},
                {x: 1, y: 5}, {x: 7, y: 9}, {x: 2, y: 12}, {x: 12, y: 1}
            ],
            high2: [
                {x: 3, y: 4}, {x: 5, y: 6}, {x: 7, y: 8}, {x: 9, y: 10},
                {x: 1, y: 5}, {x: 7, y: 9}, {x: 2, y: 12}, {x: 12, y: 1}
            ],
            high3: [
                {x: 3, y: 4}, {x: 5, y: 6}, {x: 7, y: 8}, {x: 9, y: 10},
                {x: 1, y: 5}, {x: 7, y: 9}, {x: 2, y: 12}, {x: 12, y: 1}
            ]
        }
    };

    return mapData[universalizability.toLowerCase()] || {};
}