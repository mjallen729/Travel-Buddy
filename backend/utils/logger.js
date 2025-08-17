import chalk from "chalk";

const LOG_LEVELS = {
  DEBUG: { level: 0, color: "blue", label: "DEBUG" },
  INFO: { level: 1, color: "green", label: "INFO" },
  WARN: { level: 2, color: "yellow", label: "WARN" },
  ERROR: { level: 3, color: "red", label: "ERROR" },
  FATAL: { level: 4, color: "magenta", label: "FATAL" },
};

// Default to INFO if not set
let currentLogLevel = LOG_LEVELS.INFO.level;

const formatMessage = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const logConfig = LOG_LEVELS[level];
  const colorize = chalk[logConfig.color];

  let metaStr = "";
  if (Object.keys(meta).length > 0) {
    metaStr = ` ${JSON.stringify(meta)}`;
  }

  return `${timestamp} [${colorize(logConfig.label)}] ${message}${metaStr}`;
};

const shouldLog = (level) => {
  return LOG_LEVELS[level].level >= currentLogLevel;
};

const logger = {
  setLogLevel: (level) => {
    if (LOG_LEVELS[level]) {
      currentLogLevel = LOG_LEVELS[level].level;
    } else {
      console.warn(`Invalid log level: ${level}. Using INFO.`);
    }
  },

  debug: (message, meta) => {
    if (shouldLog("DEBUG")) {
      console.log(formatMessage("DEBUG", message, meta));
    }
  },

  info: (message, meta) => {
    if (shouldLog("INFO")) {
      console.log(formatMessage("INFO", message, meta));
    }
  },

  warn: (message, meta) => {
    if (shouldLog("WARN")) {
      console.warn(formatMessage("WARN", message, meta));
    }
  },

  error: (message, meta) => {
    if (shouldLog("ERROR")) {
      console.error(formatMessage("ERROR", message, meta));
    }
  },

  fatal: (message, meta) => {
    if (shouldLog("FATAL")) {
      console.error(formatMessage("FATAL", message, meta));
    }
  },
};

export default logger;
