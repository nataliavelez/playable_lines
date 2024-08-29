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

async export function runPerformanceTest(OldFn, NewFn, round, player, iterations = 100) {
  console.log(`Running performance test for ${iterations} iterations...`);
  // get player ids
  const players = Object.keys(round.get('playerStates'))
  for (let i = 0; i < iterations; i++) {
    const playerId = getRandomItem(players);
    console.log("Player ID:", playerId);
    const updates = {
      x: players[playerId].position.x + Math.random() * 1,
      y: players[playerId].position.x + Math.random() * 1,
      direction: ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)],
      carrying: Math.random() > 0.5,
      score: Math.floor(Math.random() * 100)
    };
    // add 200 ms delay to simulate real game
    await delay(200);

    performanceMeasure.start();
    OldFn(playerId, updates, round, player);
    performanceMeasure.end("Current Setup Update");

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