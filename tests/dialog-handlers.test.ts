import { describe, it, expect } from 'vitest'
import { readFile } from 'fs/promises'
import { join } from 'path'

describe('Dialog Handlers Tests', () => {
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
})