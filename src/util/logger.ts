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
  logLevel = process.env.NODE_ENV === "production" ? PROD_LOG_LEVEL : DEV_LOG_LEVEL;
}
const errorWithStacktraceFormat = format(info => {
  if (info instanceof Error) {
    return { message: info.message, stack: info.stack, ...info };
  }

  return info;
});

const logger: Logger = createLogger({
  format: format.combine(
    errorWithStacktraceFormat(),
    format.colorize(),
    format.splat(),
    format.timestamp(),
    format.simple()
    // format.printf(info => `${info.timestamp} ${info.level}: ${info.message} Stacktrace: ${info.stack}`)
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
