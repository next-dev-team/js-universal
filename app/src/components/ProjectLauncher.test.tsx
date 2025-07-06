import { render, screen, waitFor } from '@testing-library/react';
import * as antd from 'antd';
import { ipcRenderer } from 'electron';
import ProjectLauncher from './ProjectLauncher';

vi.mock('antd', () => ({
  Button: ({ children, ...props }: { children?: React.ReactNode }) => (
    <button {...props}>{children}</button>
  ),
  message: {
    success: vi.fn(),
    error: vi.fn((..._args) => {
      // This is a workaround to make waitFor work with antd.message
      // In a real application, antd.message would update the DOM,
      // but in tests, we need to explicitly tell waitFor when the mock is called.
      return Promise.resolve();
    }),
  },
}));

vi.mock('@/router/utils/loading', () => ({
  __esModule: true,
  default: () => <div>Loading...</div>,
}));

vi.mock('electron', () => ({
  ipcRenderer: {
    invoke: vi.fn(),
  },
}));

beforeAll(() => {
  Object.defineProperty(window, 'electron', {
    value: {
      ipcRenderer: {
        invoke: vi.fn(),
      },
    },
    writable: true,
  });
});

const mockOpenProject = vi.spyOn(ipcRenderer, 'invoke');

afterEach(() => {
  vi.clearAllMocks();
});

describe('ProjectLauncher Component', () => {
  it('renders without crashing', () => {
    render(<ProjectLauncher />);
    expect(screen.getByText('Select Project Folder')).toBeInTheDocument();
  });

  it('opens a project and displays the path', async () => {
    mockOpenProject.mockResolvedValueOnce('/path/to/project');
    render(<ProjectLauncher />);
    const button = screen.getByText('Select Project Folder');
    button.click();
    await screen.findByText('/path/to/project');
    expect(screen.getByText('/path/to/project')).toBeInTheDocument();
  });

  it('handles errors when opening a project', async () => {
    mockOpenProject.mockRejectedValueOnce(new Error('Failed to open project'));
    render(<ProjectLauncher />);
    const button = screen.getByText('Select Project Folder');
    button.click();
    await waitFor(() => {
      expect(antd.message.error).toHaveBeenCalledWith('Failed to open project');
    });
    expect(screen.queryByText('/path/to/project')).not.toBeInTheDocument();
  });

  it('displays a success message when a project is opened', async () => {
    mockOpenProject.mockResolvedValueOnce('/path/to/project');
    render(<ProjectLauncher />);
    const button = screen.getByText('Select Project Folder');
    button.click();
    await screen.findByText('/path/to/project');
    expect(antd.message.success).toHaveBeenCalledWith(
      `Project opened: /path/to/project`,
    );
  });

  it('displays an error message when a project fails to open', async () => {
    mockOpenProject.mockRejectedValueOnce(new Error('Failed to open project'));
    render(<ProjectLauncher />);
    const button = screen.getByText('Select Project Folder');
    button.click();
    await waitFor(() => {
      expect(antd.message.error).toHaveBeenCalledWith('Failed to open project');
    });
    expect(antd.message.error).toHaveBeenCalledWith('Failed to open project');
  });

  it('does not display the project path when no project is selected', () => {
    render(<ProjectLauncher />);
    expect(screen.queryByText(/path\/to\/project/)).not.toBeInTheDocument();
  });

  it('logs an error when project opening fails', async () => {
    console.error = vi.fn();
    mockOpenProject.mockRejectedValueOnce(new Error('Failed to open project'));
    render(<ProjectLauncher />);
    const button = screen.getByText('Select Project Folder');
    button.click();

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
      'Error selecting project:',
      expect.objectContaining({ message: 'Failed to open project' }),
    );
    });
  });

  it('opens a project in a new window and displays the path', async () => {
    mockOpenProject.mockResolvedValueOnce('/path/to/project');
    render(<ProjectLauncher />);
    const button = screen.getByText('Open Project in New Window');
    button.click();
    await screen.findByText('/path/to/project');
    expect(screen.getByText('/path/to/project')).toBeInTheDocument();
  });

  it('handles errors when opening a project in a new window', async () => {
    mockOpenProject.mockRejectedValueOnce(new Error('Failed to open project'));
    render(<ProjectLauncher />);
    const button = screen.getByText('Open Project in New Window');
    button.click();
    await waitFor(() => {
      expect(antd.message.error).toHaveBeenCalledWith(
        'Failed to open project',
      );
    });
    expect(screen.queryByText('/path/to/project')).not.toBeInTheDocument();
  });

  it('displays a success message when a project is opened in a new window', async () => {
    mockOpenProject.mockResolvedValueOnce('/path/to/project');
    render(<ProjectLauncher />);
    const button = screen.getByText('Open Project in New Window');
    button.click();
    await screen.findByText('/path/to/project');
    expect(antd.message.success).toHaveBeenCalledWith(
      `Project opened: /path/to/project`,
    );
  });

  it('displays an error message when a project fails to open in a new window', async () => {
    mockOpenProject.mockRejectedValueOnce(new Error('Failed to open project'));
    render(<ProjectLauncher />);
    const button = screen.getByText('Open Project in New Window');
    button.click();
    await waitFor(() => {
      expect(antd.message.error).toHaveBeenCalledWith(
        'Failed to open project',
      );
    });
  });
});
