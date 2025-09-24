import { spawn } from 'child_process';
import { ipcMain } from 'electron';
import { cwd } from 'process';

const initIpcMain = () => {
  ipcMain.handle('run-pterm', async (_, args: string[]) => {
    const ptermPath = cwd() + '/node_modules/.bin/pterm.cmd';
    return new Promise((resolve, reject) => {
      const child = spawn(ptermPath, args, {
        shell: true,
      });

      let output = '';
      let errorOutput = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
        console.log('stdout:', data.toString());
        setTimeout(() => {
          resolve(output.trim());
        }, 5000); // 30 second timeout
      });

      child.stderr.on('data', (data) => {
        errorOutput += data.toString();
        console.log('stderr:', data.toString());
      });

      child.on('error', (error) => {
        console.error('Spawn error:', error);
        reject(error);
      });

      child.on('close', (code) => {
        console.log(`pterm exited with code ${code}`);
        console.log('stdout111111111111:', output);
        console.log('stderr:', errorOutput);

        if (code === 0) {
          resolve(output.trim());
        } else {
          reject(new Error(`pterm exited with code ${code}: ${errorOutput}`));
        }
      });
    });
  });
};
export default initIpcMain;
