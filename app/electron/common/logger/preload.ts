import { ipcRenderer } from 'electron';
import type { LogFunctions } from 'electron-log';

/* eslint-disable @typescript-eslint/no-explicit-any */

type ILog = LogFunctions & { scope: (label: string) => LogFunctions };

const initializeLogger = () => {
  ipcRenderer
    .invoke('__ELECTRON_LOG__', { cmd: 'getOptions' })
    .catch((e) =>
      console.error(
        new Error(
          "electron-log isn't initialized in the main process. " +
            `Please call log.initialize() before. ${e.message}`,
        ),
      ),
    );

  const electronLog: any = {
    sendToMain(message: any) {
      try {
        ipcRenderer.send('__ELECTRON_LOG__', message);
      } catch (e: any) {
        console.error('electronLog.sendToMain ', e, 'data:', message);

        ipcRenderer.send('__ELECTRON_LOG__', {
          cmd: 'errorHandler',
          error: { message: e?.message, stack: e?.stack },
          errorName: 'sendToMain',
        });
      }
    },

    log(...data: any[]) {
      electronLog.sendToMain({
        data,
        level: 'info',
        variables: { processType: 'preload' },
      });
    },
    functions: {},
    scope(label: string) {
      const newLog: any = {
        log(...data: any[]) {
          electronLog.sendToMain({
            data,
            level: 'info',
            variables: { processType: 'preload' },
            scope: label,
          });
        },
      };

      for (const level of [
        'error',
        'warn',
        'info',
        'verbose',
        'debug',
        'silly',
      ]) {
        newLog[level] = (...data: any[]) =>
          electronLog.sendToMain({
            data,
            level,
            variables: { processType: 'preload' },
            scope: label,
          });
      }
      return newLog;
    },
  };

  electronLog.functions.log = electronLog.log;

  for (const level of ['error', 'warn', 'info', 'verbose', 'debug', 'silly']) {
    electronLog[level] = (...data: any[]) =>
      electronLog.sendToMain({
        data,
        level,
        variables: { processType: 'preload' },
      });
    electronLog.functions[level] = electronLog[level];
  }

  return electronLog;
};

let logger: any = undefined;
const initPreloadLogger = () => {
  if (!logger) {
    logger = initializeLogger();
    Object.assign(console, logger.functions);
    console.log('initPreloadLogger success');
  } else {
    console.log('initPreloadLogger has initialized');
  }
  return logger as ILog;
};

const getPreloadLogger = () => {
  if (!logger) {
    throw Error('getPreloadLogger err: no init');
  }
  return logger as ILog;
};

export { initPreloadLogger, getPreloadLogger };
