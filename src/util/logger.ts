import { createLogger, format, transports } from "winston";

const { colorize, combine, errors, printf, splat, timestamp } = format;

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
  logLevel = process.env.NODE_ENV === "production" ? PROD_LOG_LEVEL : DEV_LOG_LEVEL;
}

const logFormat = printf((info) => {
  const stacktrace = info.stack ? `\n${info.stack}` : "";
  return `${info.timestamp} ${info.level}: ${info.message}${stacktrace}`;
});

const logger = createLogger({
  format: combine(
    errors({ stack: true }),
    colorize(),
    splat(),
    timestamp(),
    logFormat,
  ),
  transports: [
    new transports.Console({ level: logLevel }),
    new transports.File({ filename: "error.log", level: LOG_FILE })
  ]
});

if (process.env.NODE_ENV !== "production") {
  logger.debug("Logging initialized at debug level");
}
export default logger;
