// performanceTest.js
const performanceMeasure = {
  startTime: 0,
  measurements: [],

  start() {
    this.startTime = performance.now();
  },

  end(label) {
    const endTime = performance.now();
    const duration = endTime - this.startTime;
    this.measurements.push({ label, duration });
    console.log(`${label}: ${duration.toFixed(6)}ms`);
    return duration;
  },

  printAverages() {
    const averages = this.measurements.reduce((acc, { label, duration }) => {
      if (!acc[label]) {
        acc[label] = { total: 0, count: 0 };
      }
      acc[label].total += duration;
      acc[label].count++;
      return acc;
    }, {});

    console.log("\nAverage Durations:");
    Object.entries(averages).forEach(([label, { total, count }]) => {
      const average = total / count;
      console.log(`${label}: ${average.toFixed(2)}ms`);
    });
  }
};

export async function runPerformanceTest(OldFn, NewFn, round, player, iterations = 100) {
  console.log(`Running performance test for ${iterations} iterations...`);
  // get player ids
  const players = Object.keys(round.get('playerStates'));

  function generateUpdates(playerId) {
    return (() => {
      const updateX = Math.random() < 0.5;
      const change = Math.random() < 0.5 ? 1 : -1;
      
      let x = round.get('playerStates')[playerId].position.x;
      let y = round.get('playerStates')[playerId].position.y;
      
      if (updateX) {
        x = Math.max(1, Math.min(14, x + change));
      } else {
        y = Math.max(1, Math.min(14, y + change));
      }

      let score = round.get('playerStates')[playerId].score;
      if (Math.random() < 0.1) {
        score = Math.max(0, score + 1);
      }

      return {
        x: x,
        y: y,
        direction: ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)],
        carrying: Math.random() < 0.2,
        score: score
      };
    })();
  }

  for (let i = 0; i < iterations; i++) {
    const playerId = getRandomItem(players);
    console.log("Player ID:", playerId);
    
    let updates = generateUpdates(playerId);
    
    // add 65ms delay to simulate real game at speed of 2 (2 tiles per second)
    // which is 500ms per round, 
    // with 8 players, would expect one update every 62.5ms per player
    await delay(30);

    performanceMeasure.start();
    OldFn(playerId, updates, round, player);
    performanceMeasure.end("Current Setup Update");

    updates = generateUpdates(playerId);
    await delay(30);
    performanceMeasure.start();
    NewFn(playerId, updates, round, player);
    performanceMeasure.end("New Setup Update");
  }

  performanceMeasure.printAverages();
}

function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Export the function to make it available globally
window.runPerformanceTest = runPerformanceTest;