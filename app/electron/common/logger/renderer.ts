import logger from 'electron-log/renderer';

let isInitialized = false;

const initRenderLogger = () => {
  if (!isInitialized) {
    logger.errorHandler.startCatching();
    isInitialized = true;
    Object.assign(console, logger.functions);
    console.log('initRenderLogger success');
  } else {
    console.log('initRenderLogger has initialized');
  }
  return logger;
};

const getRenderLogger = () => {
  if (!isInitialized) {
    throw Error('getRenderLogger err: no init');
  }
  return logger;
};

export { initRenderLogger, getRenderLogger };
