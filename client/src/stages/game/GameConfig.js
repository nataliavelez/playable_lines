// Set this to false when you want to disable console logs
export const CONSOLE_ENABLED = true;

// Simple logging wrapper - use this instead of console.log
export const GameLog = {
  log: (...args) => CONSOLE_ENABLED && console.log(...args),
  warn: (...args) => CONSOLE_ENABLED && console.warn(...args),
  error: (...args) => console.error(...args), // Always show errors
  debug: (...args) => CONSOLE_ENABLED && console.debug(...args),
}; 