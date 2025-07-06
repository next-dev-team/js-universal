import { render, screen } from '@testing-library/react';

import * as antd from 'antd';
import ProjectLauncher from './ProjectLauncher';

vi.mock('antd', () => ({
  Button: ({ children, ...props }: { children?: React.ReactNode }) => <button {...props}>{children}</button>,
  message: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/router/utils/loading', () => {
  const Loading = () => <div>Loading...</div>;
  Loading.displayName = 'Loading';
  return Loading;
});

vi.mock('electron', () => ({
  ipcRenderer: {
    invoke: vi.fn(),
  },
}));

const mockOpenProject = vi.spyOn(window.electron.ipcRenderer, 'invoke');

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
    await screen.findByText('Failed to open project');
    expect(screen.queryByText('/path/to/project')).not.toBeInTheDocument();
  });

  it('displays a success message when a project is opened', async () => {
    mockOpenProject.mockResolvedValueOnce('/path/to/project');
    render(<ProjectLauncher />);
    const button = screen.getByText('Select Project Folder');
    button.click();
    await screen.findByText('/path/to/project');
    expect(antd.message.success).toHaveBeenCalledWith(`Project opened: /path/to/project`);
  });

  it('displays an error message when a project fails to open', async () => {
    mockOpenProject.mockRejectedValueOnce(new Error('Failed to open project'));
    render(<ProjectLauncher />);
    const button = screen.getByText('Select Project Folder');
    button.click();
    await screen.findByText('Failed to open project');
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
    await screen.findByText('Failed to open project');
    expect(console.error).toHaveBeenCalledWith('Error selecting project:', new Error('Failed to open project'));
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
    mockOpenProject.mockRejectedValueOnce(new Error('Failed to open project in new window'));
    render(<ProjectLauncher />);
    const button = screen.getByText('Open Project in New Window');
    button.click();
    await screen.findByText('Failed to open project in new window');
    expect(screen.queryByText('/path/to/project')).not.toBeInTheDocument();
  });

  it('displays a success message when a project is opened in a new window', async () => {
    mockOpenProject.mockResolvedValueOnce('/path/to/project');
    render(<ProjectLauncher />);
    const button = screen.getByText('Open Project in New Window');
    button.click();
    await screen.findByText('/path/to/project');
    expect(antd.message.success).toHaveBeenCalledWith(`Project opened in new window: /path/to/project`);
  });

  it('displays an error message when a project fails to open in a new window', async () => {
    mockOpenProject.mockRejectedValueOnce(new Error('Failed to open project in new window'));
    render(<ProjectLauncher />);
    const button = screen.getByText('Open Project in New Window');
    button.click();
    await screen.findByText('Failed to open project in new window');
    expect(antd.message.error).toHaveBeenCalledWith('Failed to open project in new window');
  });
});