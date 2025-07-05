import type { LogFile } from 'electron-log';
import fs from 'node:fs';
import path from 'node:path';

function formatNumber(number: number) {
  const n = number.toString();
  return n[1] ? n : `0${n}`;
}

const fileNameFormatTime = () => {
  // yyddmmHHMMSS+milliseconds
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  const milliseconds = date.getMilliseconds();

  return (
    [year, month, day].map(formatNumber).join('') +
    [hour, minute, second].map(formatNumber).join('') +
    '.' +
    milliseconds
  );
};

const archiveLogFn = (file: LogFile) => {
  const oldPath = file.toString();
  const info = path.parse(oldPath);
  try {
    fs.renameSync(
      oldPath,
      path.join(
        info.dir,
        `${info.name}.old.${fileNameFormatTime()}${info.ext}`,
      ),
    );
  } catch (e) {
    const data = ['electron-log.transports.file: Could not rotate log'];

    if (e) {
      data.push(e as string);
    }
    console.warn(data);
  }
};

export { archiveLogFn };
