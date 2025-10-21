import { describe, it, expect, vi, beforeEach } from 'vitest'
import { spawn, ChildProcess } from 'child_process'
import { join } from 'path'

describe('Electron Main Process - Real Testing', () => {
  let electronProcess: ChildProcess | null = null
  const timeout = 15000

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(async () => {
    if (electronProcess) {
      electronProcess.kill('SIGTERM')
      electronProcess = null
    }
  })

  it('should build main process without errors', async () => {
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

  it('should verify DB_UPDATE_USER handler exists in built main.js', async () => {
    const fs = await import('fs/promises')
    const path = join(process.cwd(), 'dist-main', 'main.js')
    
    try {
      const content = await fs.readFile(path, 'utf-8')
      
      // Check that the DB_UPDATE_USER handler is present in the built file
      expect(content).toContain('DB_UPDATE_USER')
      expect(content).toContain('updateUser')
      
      // Check that the handler registration pattern exists
      expect(content).toMatch(/ipcMain\.handle.*DB_UPDATE_USER/)
      
    } catch (error) {
      expect.fail(`Could not read built main.js: ${error}`)
    }
  })

  it('should verify all required IPC channels are defined', async () => {
    const fs = await import('fs/promises')
    const typesPath = join(process.cwd(), 'shared', 'types.ts')
    
    try {
      const content = await fs.readFile(typesPath, 'utf-8')
      
      // Check that all required IPC channels are defined
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

  it('should verify database service has updateUser method', async () => {
    const fs = await import('fs/promises')
    const dbServicePath = join(process.cwd(), 'src', 'main', 'database-service.ts')
    
    try {
      const content = await fs.readFile(dbServicePath, 'utf-8')
      
      // Check that updateUser method exists
      expect(content).toContain('async updateUser')
      expect(content).toMatch(/updateUser.*id.*string.*data/)
      
    } catch (error) {
      expect.fail(`Could not read database-service.ts: ${error}`)
    }
  })

  it('should verify main.ts has DB_UPDATE_USER handler', async () => {
    const fs = await import('fs/promises')
    const mainPath = join(process.cwd(), 'src', 'main', 'main.ts')
    
    try {
      const content = await fs.readFile(mainPath, 'utf-8')
      
      // Check that DB_UPDATE_USER handler is registered
      expect(content).toContain('IPC_CHANNELS.DB_UPDATE_USER')
      expect(content).toMatch(/ipcMain\.handle.*DB_UPDATE_USER/)
      expect(content).toContain('databaseService.updateUser')
      
    } catch (error) {
      expect.fail(`Could not read main.ts: ${error}`)
    }
  })
})