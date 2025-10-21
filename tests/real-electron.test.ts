import { describe, it, expect } from 'vitest'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { spawn } from 'child_process'

// Real tests that don't use mocks - testing actual files and builds
describe('Real Electron Application Tests', () => {
  const timeout = 15000

  it('should build main process successfully', async () => {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Build process timed out'))
      }, timeout)

      const buildProcess = spawn('npx', ['vite', 'build', '--config', 'vite.main.config.ts'], {
        cwd: process.cwd(),
        stdio: 'pipe'
      })

      let output = ''
      let errorOutput = ''

      buildProcess.stdout?.on('data', (data) => {
        output += data.toString()
      })

      buildProcess.stderr?.on('data', (data) => {
        errorOutput += data.toString()
      })

      buildProcess.on('close', (code) => {
        clearTimeout(timer)
        if (code === 0) {
          expect(output).toContain('built in')
          resolve(true)
        } else {
          reject(new Error(`Build failed with code ${code}. Error: ${errorOutput}`))
        }
      })

      buildProcess.on('error', (error) => {
        clearTimeout(timer)
        reject(new Error(`Build process error: ${error.message}`))
      })
    })
  }, timeout)

  it('should have DB_UPDATE_USER handler in built main.js', async () => {
    const mainJsPath = join(process.cwd(), 'dist-main', 'main.js')
    
    try {
      const content = await readFile(mainJsPath, 'utf-8')
      
      // Check that the DB_UPDATE_USER handler is present
      expect(content).toContain('DB_UPDATE_USER')
      expect(content).toContain('updateUser')
      
      // Check that the handler registration pattern exists
      expect(content).toMatch(/ipcMain\.handle.*DB_UPDATE_USER/)
      
    } catch (error) {
      expect.fail(`Could not read built main.js: ${error}`)
    }
  })

  it('should have all required IPC channels defined in types', async () => {
    const typesPath = join(process.cwd(), 'shared', 'types.ts')
    
    try {
      const content = await readFile(typesPath, 'utf-8')
      
      const requiredChannels = [
        'DB_UPDATE_USER',
        'DB_GET_PLUGINS',
        'DB_GET_USER_PLUGINS',
        'DB_GET_SETTINGS',
        'DB_UPDATE_SETTINGS',
        'PLUGIN_INSTALL',
        'PLUGIN_UNINSTALL',
        'WINDOW_MINIMIZE',
        'WINDOW_MAXIMIZE',
        'WINDOW_CLOSE'
      ]
      
      for (const channel of requiredChannels) {
        expect(content).toContain(channel)
      }
      
    } catch (error) {
      expect.fail(`Could not read types.ts: ${error}`)
    }
  })

  it('should have updateUser method in database service', async () => {
    const dbServicePath = join(process.cwd(), 'src', 'main', 'database-service.ts')
    
    try {
      const content = await readFile(dbServicePath, 'utf-8')
      
      // Check that updateUser method exists
      expect(content).toContain('async updateUser')
      expect(content).toMatch(/updateUser.*id.*string.*data/)
      
    } catch (error) {
      expect.fail(`Could not read database-service.ts: ${error}`)
    }
  })

  it('should have DB_UPDATE_USER handler registered in main.ts', async () => {
    const mainPath = join(process.cwd(), 'src', 'main', 'main.ts')
    
    try {
      const content = await readFile(mainPath, 'utf-8')
      
      // Check that DB_UPDATE_USER handler is registered
      expect(content).toContain('IPC_CHANNELS.DB_UPDATE_USER')
      expect(content).toMatch(/ipcMain\.handle.*DB_UPDATE_USER/)
      expect(content).toContain('databaseService.updateUser')
      
    } catch (error) {
      expect.fail(`Could not read main.ts: ${error}`)
    }
  })

  it('should have updateUser exposed in preload script', async () => {
    const preloadPath = join(process.cwd(), 'src', 'preload', 'preload.ts')
    
    try {
      const content = await readFile(preloadPath, 'utf-8')
      
      // Check that updateUser is exposed
      expect(content).toContain('updateUser')
      expect(content).toContain('DB_UPDATE_USER')
      
    } catch (error) {
      expect.fail(`Could not read preload.ts: ${error}`)
    }
  })

  it('should build preload script successfully', async () => {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Preload build process timed out'))
      }, timeout)

      const buildProcess = spawn('npx', ['vite', 'build', '--config', 'vite.preload.config.ts'], {
        cwd: process.cwd(),
        stdio: 'pipe'
      })

      let output = ''
      let errorOutput = ''

      buildProcess.stdout?.on('data', (data) => {
        output += data.toString()
      })

      buildProcess.stderr?.on('data', (data) => {
        errorOutput += data.toString()
      })

      buildProcess.on('close', (code) => {
        clearTimeout(timer)
        if (code === 0) {
          expect(output).toContain('built in')
          resolve(true)
        } else {
          reject(new Error(`Preload build failed with code ${code}. Error: ${errorOutput}`))
        }
      })

      buildProcess.on('error', (error) => {
        clearTimeout(timer)
        reject(new Error(`Preload build process error: ${error.message}`))
      })
    })
  }, timeout)

  it('should have updateUser in built preload.js', async () => {
    const preloadJsPath = join(process.cwd(), 'dist-preload', 'preload.js')
    
    try {
      const content = await readFile(preloadJsPath, 'utf-8')
      
      // Check that updateUser is exposed in the built preload
      expect(content).toContain('updateUser')
      expect(content).toContain('DB_UPDATE_USER')
      
    } catch (error) {
      expect.fail(`Could not read built preload.js: ${error}`)
    }
  })

  it('should have openDirectoryDialog exposed in preload API', async () => {
    const preloadTsPath = join(process.cwd(), 'src', 'preload', 'preload.ts')
    
    try {
      const content = await readFile(preloadTsPath, 'utf-8')
      
      // Check that openDirectoryDialog is properly exposed
      expect(content).toContain('openDirectoryDialog')
      expect(content).toContain('IPC_CHANNELS.DIALOG_OPEN_DIRECTORY')
      
    } catch (error) {
      expect.fail(`Could not read preload.ts: ${error}`)
    }
  })

  it('should have DIALOG_OPEN_DIRECTORY handler in built main.js', async () => {
    const mainJsPath = join(process.cwd(), 'dist-main', 'main.js')
    
    try {
      const content = await readFile(mainJsPath, 'utf-8')
      
      // Check that the DIALOG_OPEN_DIRECTORY handler is present
      expect(content).toContain('DIALOG_OPEN_DIRECTORY')
      expect(content).toContain('dialog:openDirectory')
      
      // Check that the handler registration pattern exists
      expect(content).toMatch(/ipcMain\.handle.*DIALOG_OPEN_DIRECTORY/)
      
    } catch (error) {
      expect.fail(`Could not read built main.js: ${error}`)
    }
  })

  it('should have SHELL_OPEN_EXTERNAL handler in built main.js', async () => {
    const mainJsPath = join(process.cwd(), 'dist-main', 'main.js')
    
    try {
      const content = await readFile(mainJsPath, 'utf-8')
      
      // Check that the SHELL_OPEN_EXTERNAL handler is present
      expect(content).toContain('SHELL_OPEN_EXTERNAL')
      expect(content).toContain('shell:openExternal')
      
      // Check that the handler registration pattern exists
      expect(content).toMatch(/ipcMain\.handle.*SHELL_OPEN_EXTERNAL/)
      
    } catch (error) {
      expect.fail(`Could not read built main.js: ${error}`)
    }
  })

  it('should have dialog and shell channels defined in types', async () => {
    const typesPath = join(process.cwd(), 'shared', 'types.ts')
    
    try {
      const content = await readFile(typesPath, 'utf-8')
      
      // Check that dialog and shell channels are defined
      expect(content).toContain('DIALOG_OPEN_DIRECTORY')
      expect(content).toContain('SHELL_OPEN_EXTERNAL')
      expect(content).toContain("'dialog:openDirectory'")
      expect(content).toContain("'shell:openExternal'")
      
    } catch (error) {
      expect.fail(`Could not read types.ts: ${error}`)
    }
  })

  it('should have correct IPC channel usage in preload script', async () => {
    const preloadJsPath = join(process.cwd(), 'dist-preload', 'preload.js')
    
    try {
      const content = await readFile(preloadJsPath, 'utf-8')
      
      // Check that preload uses the correct IPC channels
      expect(content).toContain('DIALOG_OPEN_DIRECTORY')
      expect(content).toContain('SHELL_OPEN_EXTERNAL')
      
    } catch (error) {
      expect.fail(`Could not read built preload.js: ${error}`)
    }
  })
})