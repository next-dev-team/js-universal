import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as antd from 'antd';
import { vi } from 'vitest';
import IndexPage from './index';

// Mock antd components and message
vi.mock('antd', async () => {
  const actual = await vi.importActual('antd');
  return {
    ...actual,
    message: {
      success: vi.fn(),
      error: vi.fn(),
    },
  };
});

// Mock window.electronAPI
const mockElectronAPI = {
  projectManager: {
    getProjects: vi.fn(),
    getIDEs: vi.fn(),
    selectDirectory: vi.fn(),
    scanDirectory: vi.fn(),
    importProjects: vi.fn(),
    updateProject: vi.fn(),
    launchProject: vi.fn(),
    launchWithIDE: vi.fn(),
    openInExplorer: vi.fn(),
    openInTerminal: vi.fn(),
  },
};

// Setup window.electronAPI and matchMedia before tests
beforeAll(() => {
  Object.defineProperty(window, 'electronAPI', {
    value: mockElectronAPI,
    writable: true,
  });

  // Mock matchMedia for Ant Design components
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = vi.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

beforeEach(() => {
  vi.clearAllMocks();

  // Default mock implementations
  mockElectronAPI.projectManager.getProjects.mockResolvedValue({
    success: true,
    data: [],
  });

  mockElectronAPI.projectManager.getIDEs.mockResolvedValue({
    success: true,
    data: [],
  });
});

describe('IndexPage - handleScanDirectory', () => {
  it('should handle successful directory selection and scanning', async () => {
    const mockProjects = [
      {
        id: '1',
        name: 'Test Project',
        path: '/test/path',
        type: 'react',
        lastOpened: Date.now(),
        favorite: false,
      },
    ];

    mockElectronAPI.projectManager.selectDirectory.mockResolvedValue({
      success: true,
      canceled: false,
      data: '/selected/directory',
    });

    mockElectronAPI.projectManager.scanDirectory.mockResolvedValue({
      success: true,
      data: mockProjects,
    });

    mockElectronAPI.projectManager.importProjects.mockResolvedValue({
      success: true,
      data: mockProjects,
    });

    render(<IndexPage />);

    const addButton = screen.getByText('Add Your First Project');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(mockElectronAPI.projectManager.selectDirectory).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockElectronAPI.projectManager.scanDirectory).toHaveBeenCalledWith(
        '/selected/directory',
      );
    });

    await waitFor(() => {
      expect(
        mockElectronAPI.projectManager.importProjects,
      ).toHaveBeenCalledWith(mockProjects);
    });

    expect(antd.message.success).toHaveBeenCalledWith('Found 1 projects');
    expect(antd.message.success).toHaveBeenCalledWith('Imported 1 projects');
  });

  it('should handle user canceling directory selection', async () => {
    mockElectronAPI.projectManager.selectDirectory.mockResolvedValue({
      success: true,
      canceled: true,
    });

    render(<IndexPage />);

    const addButton = screen.getByText('Add Your First Project');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(mockElectronAPI.projectManager.selectDirectory).toHaveBeenCalled();
    });

    // Should not call scanDirectory if user canceled
    expect(mockElectronAPI.projectManager.scanDirectory).not.toHaveBeenCalled();
    // Should not show error message for cancellation
    expect(antd.message.error).not.toHaveBeenCalled();
  });

  it('should handle selectDirectory failure', async () => {
    mockElectronAPI.projectManager.selectDirectory.mockResolvedValue({
      success: false,
      error: 'Failed to open dialog',
    });

    render(<IndexPage />);

    const addButton = screen.getByText('Add Your First Project');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(antd.message.error).toHaveBeenCalledWith('Failed to open dialog');
    });

    expect(mockElectronAPI.projectManager.scanDirectory).not.toHaveBeenCalled();
  });

  it('should handle scanDirectory failure', async () => {
    mockElectronAPI.projectManager.selectDirectory.mockResolvedValue({
      success: true,
      canceled: false,
      data: '/selected/directory',
    });

    mockElectronAPI.projectManager.scanDirectory.mockResolvedValue({
      success: false,
      error: 'Failed to scan directory',
    });

    render(<IndexPage />);

    const addButton = screen.getByText('Add Your First Project');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(antd.message.error).toHaveBeenCalledWith(
        'Failed to scan directory',
      );
    });

    expect(
      mockElectronAPI.projectManager.importProjects,
    ).not.toHaveBeenCalled();
  });

  it('should handle importProjects failure', async () => {
    const mockProjects = [
      {
        id: '1',
        name: 'Test Project',
        path: '/test/path',
        type: 'react',
        lastOpened: Date.now(),
        favorite: false,
      },
    ];

    mockElectronAPI.projectManager.selectDirectory.mockResolvedValue({
      success: true,
      canceled: false,
      data: '/selected/directory',
    });

    mockElectronAPI.projectManager.scanDirectory.mockResolvedValue({
      success: true,
      data: mockProjects,
    });

    mockElectronAPI.projectManager.importProjects.mockResolvedValue({
      success: false,
      error: 'Failed to import projects',
    });

    render(<IndexPage />);

    const addButton = screen.getByText('Add Your First Project');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(antd.message.success).toHaveBeenCalledWith('Found 1 projects');
    });

    await waitFor(() => {
      expect(antd.message.error).toHaveBeenCalledWith(
        'Failed to import projects',
      );
    });
  });

  it('should handle no projects found', async () => {
    mockElectronAPI.projectManager.selectDirectory.mockResolvedValue({
      success: true,
      canceled: false,
      data: '/selected/directory',
    });

    mockElectronAPI.projectManager.scanDirectory.mockResolvedValue({
      success: true,
      data: [],
    });

    render(<IndexPage />);

    const addButton = screen.getByText('Add Your First Project');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(antd.message.success).toHaveBeenCalledWith('Found 0 projects');
    });

    // Should not try to import empty array
    expect(
      mockElectronAPI.projectManager.importProjects,
    ).not.toHaveBeenCalled();
  });

  it('should handle exception during scanning process', async () => {
    mockElectronAPI.projectManager.selectDirectory.mockRejectedValue(
      new Error('Unexpected error'),
    );

    render(<IndexPage />);

    const addButton = screen.getByText('Add Your First Project');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(antd.message.error).toHaveBeenCalledWith(
        'Error scanning directory',
      );
    });

    expect(console.error).toHaveBeenCalledWith(
      'Error scanning directory:',
      expect.any(Error),
    );
  });

  it('should handle missing data in successful selectDirectory response', async () => {
    mockElectronAPI.projectManager.selectDirectory.mockResolvedValue({
      success: true,
      canceled: false,
      // data is undefined
    });

    render(<IndexPage />);

    const addButton = screen.getByText('Add Your First Project');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(antd.message.error).toHaveBeenCalledWith(
        'Failed to select directory',
      );
    });

    expect(mockElectronAPI.projectManager.scanDirectory).not.toHaveBeenCalled();
  });
});

describe('IndexPage - General functionality', () => {
  it('should render without crashing', () => {
    render(<IndexPage />);
    expect(screen.getByText('Project Launcher')).toBeDefined();
  });

  it('should load projects on mount', async () => {
    const mockProjects = [
      {
        id: '1',
        name: 'Test Project',
        path: '/test/path',
        type: 'react',
        lastOpened: Date.now(),
        favorite: false,
      },
    ];

    mockElectronAPI.projectManager.getProjects.mockResolvedValue({
      success: true,
      data: mockProjects,
    });

    render(<IndexPage />);

    await waitFor(() => {
      expect(mockElectronAPI.projectManager.getProjects).toHaveBeenCalled();
    });

    expect(screen.getByText('Test Project')).toBeDefined();
  });

  it('should handle project loading failure', async () => {
    mockElectronAPI.projectManager.getProjects.mockResolvedValue({
      success: false,
      error: 'Database error',
    });

    render(<IndexPage />);

    await waitFor(() => {
      expect(antd.message.error).toHaveBeenCalledWith(
        'Failed to load projects',
      );
    });
  });
});
