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
    console.log(`${label}: ${duration.toFixed(2)}ms`);
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

function runPerformanceTest(OldFn, NewFn, iterations = 1000) {
  console.log(`Running performance test for ${iterations} iterations...`);

  for (let i = 0; i < iterations; i++) {
    const playerId = `player${i % 8}`; // Simulate 8 players
    const updates = {
      x: Math.random() * 100,
      y: Math.random() * 100,
      direction: ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)],
      carrying: Math.random() > 0.5,
      score: Math.floor(Math.random() * 100)
    };

    performanceMeasure.start();
    OldFn(playerId, updates);
    performanceMeasure.end("Current Setup Update");

    performanceMeasure.start();
    NewFn(playerId, updates);
    performanceMeasure.end("New Setup Update");
  }

  performanceMeasure.printAverages();
}

// Export the function to make it available globally
window.runPerformanceTest = runPerformanceTest;