import { createLogger, format, Logger, transports } from "winston";

enum LoggerLevel {
  error = "error",
  warn = "warn",
  info = "info",
  verbose = "verbose",
  debug = "debug",
  silly = "silly"
}
const PROD_LOG_LEVEL = LoggerLevel.debug;
const DEV_LOG_LEVEL = LoggerLevel.debug;
const LOG_FILE = LoggerLevel.error;

let logLevel = process.env.LOG_LEVEL;

if (!logLevel || !LoggerLevel[logLevel]) {
  logLevel = process.env.NODE_ENV === "production" ? PROD_LOG_LEVEL : DEV_LOG_LEVEL
}

const logger: Logger = createLogger({
  format: format.combine(format.colorize(), format.splat(), format.simple(), format.timestamp()),
  transports: [
    new transports.Console({ level: logLevel }),
    new transports.File({ filename: "error.log", level: LOG_FILE })
  ]
});

if (process.env.NODE_ENV !== "production") {
  logger.debug("Logging initialized at debug level");
}
export default logger;
