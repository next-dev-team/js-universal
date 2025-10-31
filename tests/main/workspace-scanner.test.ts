import { WorkspaceScanner } from '../../apps/electron/src/main/workspace-scanner';
import { PluginDevLoader } from '../../apps/electron/src/main/plugin-dev-loader';
import { PluginWebviewManager } from '../../apps/electron/src/main/plugin-webview-manager';

describe('WorkspaceScanner', () => {
  let workspaceScanner: WorkspaceScanner;
  let mockPluginDevLoader: PluginDevLoader;
  let mockPluginWebviewManager: PluginWebviewManager;

  beforeEach(() => {
    mockPluginDevLoader = {} as PluginDevLoader;
    mockPluginWebviewManager = {} as PluginWebviewManager;
    workspaceScanner = new WorkspaceScanner(
      '/fake/apps/directory',
      mockPluginDevLoader,
      mockPluginWebviewManager
    );
  });

  describe('findRunningPort', () => {
    it('should return the base port if it is in use', async () => {
      // Mock isPortInUse to return true for the base port
      jest.spyOn(workspaceScanner as any, 'isPortInUse').mockImplementation(async (port: number) => {
        return port === 3000;
      });

      const port = await (workspaceScanner as any).findRunningPort(3000, 'test-project');
      expect(port).toBe(3000);
    });

    it('should return a nearby port if the base port is not in use but a nearby one is', async () => {
      // Mock isPortInUse to return true for a nearby port
      jest.spyOn(workspaceScanner as any, 'isPortInUse').mockImplementation(async (port: number) => {
        return port === 3002;
      });

      const port = await (workspaceScanner as any).findRunningPort(3000, 'test-project');
      expect(port).toBe(3002);
    });

    it('should return undefined if no running port is found', async () => {
      // Mock isPortInUse to always return false
      jest.spyOn(workspaceScanner as any, 'isPortInUse').mockImplementation(async (port: number) => {
        return false;
      });

      const port = await (workspaceScanner as any).findRunningPort(3000, 'test-project');
      expect(port).toBeUndefined();
    });
  });
});