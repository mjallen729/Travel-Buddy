const LOG_LEVELS = {
  DEBUG: { level: 0, style: "color: #4299E1", label: "DEBUG" }, // Blue
  INFO: { level: 1, style: "color: #48BB78", label: "INFO" }, // Green
  WARN: { level: 2, style: "color: #ECC94B", label: "WARN" }, // Yellow
  ERROR: { level: 3, style: "color: #F56565", label: "ERROR" }, // Red
  FATAL: { level: 4, style: "color: #B83280", label: "FATAL" }, // Magenta
};

// Default to INFO if not set in localStorage
let currentLogLevel =
  parseInt(localStorage.getItem("logLevel")) || LOG_LEVELS.INFO.level;

const formatMessage = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const logConfig = LOG_LEVELS[level];

  let metaStr = "";
  if (Object.keys(meta).length > 0) {
    metaStr = ` ${JSON.stringify(meta)}`;
  }

  return {
    message: `${timestamp} [${logConfig.label}] ${message}${metaStr}`,
    style: logConfig.style,
  };
};

const shouldLog = (level) => {
  return LOG_LEVELS[level].level >= currentLogLevel;
};

const logger = {
  setLogLevel: (level) => {
    if (LOG_LEVELS[level]) {
      currentLogLevel = LOG_LEVELS[level].level;
      localStorage.setItem("logLevel", currentLogLevel);
    } else {
      console.warn(`Invalid log level: ${level}. Using INFO.`);
    }
  },

  debug: (message, meta) => {
    if (shouldLog("DEBUG")) {
      const { message: formattedMsg, style } = formatMessage(
        "DEBUG",
        message,
        meta,
      );
      console.log(`%c${formattedMsg}`, style);
    }
  },

  info: (message, meta) => {
    if (shouldLog("INFO")) {
      const { message: formattedMsg, style } = formatMessage(
        "INFO",
        message,
        meta,
      );
      console.info(`%c${formattedMsg}`, style);
    }
  },

  warn: (message, meta) => {
    if (shouldLog("WARN")) {
      const { message: formattedMsg, style } = formatMessage(
        "WARN",
        message,
        meta,
      );
      console.warn(`%c${formattedMsg}`, style);
    }
  },

  error: (message, meta) => {
    if (shouldLog("ERROR")) {
      const { message: formattedMsg, style } = formatMessage(
        "ERROR",
        message,
        meta,
      );
      console.error(`%c${formattedMsg}`, style);
    }
  },

  fatal: (message, meta) => {
    if (shouldLog("FATAL")) {
      const { message: formattedMsg, style } = formatMessage(
        "FATAL",
        message,
        meta,
      );
      console.error(`%c${formattedMsg}`, style);
    }
  },
};

export default logger;
