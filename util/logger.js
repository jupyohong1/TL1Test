// util/logger.js
const callerId = require('caller-id');
const winston = require('winston');

const myLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
    trace: 4,
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'blue',
    trace: 'white',
  },
};

/**
 * return First Initial of level name
 * @param {string} level - level name
 * @return {string} First Initial of level name
 */
function getLevelInitial(level) {
  switch (level) {
    case 'error': return 'E';
    case 'warn': return 'W';
    case 'info': return 'I';
    case 'debug': return 'D';
    case 'trace': return 'T';
    default: return 'UNKNOWN';
  }
}

const myFormat = winston.format.printf((info) => {
//   return `${getLevelInitial(info.level)} ${info.timestamp} ${info.fileName}/\
// ${info.funcName}():${info.lineNumber} - ${info.message}`;
  return `${getLevelInitial(info.level)} ${info.timestamp} ${info.fileName}\
:${info.lineNumber} - ${info.message}`;
});

winston.addColors(myLevels.colors);
const myLogger = winston.createLogger({
  levels: myLevels.levels,
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    // myFormat,
    winston.format.splat(),
    myFormat
  ),
  // timestampprefix: 'true',
  transports: [
    // console
    new (winston.transports.Console)({
      level: 'trace',
      colorize: true,
    }),
    // file
    new (require('winston-daily-rotate-file'))({
      level: 'info',
      filename: 'log/log',
      datePattern: 'YYYY-MM-DD',
      prepend: true,
    }),
  ],
});

winston.addColors(myLevels.colors);

/**
 * return filename, functionname, linenumber
 * @param {object} caller - callerId.getData()
 * @return {object} callerInfo
 */
function getCallerInfo(caller) {
  if (caller != undefined) {
    let fileName = '';
    let funcName = '';
    let lineNumber = 0;

    let sp = caller.filePath.lastIndexOf('\\') + 1;
    let ep = caller.filePath.lastIndexOf('.');
    fileName = caller.filePath.slice(sp, ep);

    // let idx = caller.functionName.lastIndexOf('.');
    // funcName = caller.functionName.slice(idx+1);

    lineNumber = Number(caller.lineNumber);

    return {fileName, funcName, lineNumber};
  }
  return null;
}

const logger = {};


logger.error = (message) => {
  const caller = callerId.getData();
  myLogger.error(message, getCallerInfo(caller));
};

logger.warn = (message) => {
  const caller = callerId.getData();
  myLogger.warn(message, getCallerInfo(caller));
};

logger.info = (message) => {
  const caller = callerId.getData();
  myLogger.info(message, getCallerInfo(caller));
};

logger.debug = (message) => {
  const caller = callerId.getData();
  myLogger.debug(message, getCallerInfo(caller));
};

logger.trace = (message) => {
  const caller = callerId.getData();
  myLogger.trace(message, getCallerInfo(caller));
};


module.exports = logger;
