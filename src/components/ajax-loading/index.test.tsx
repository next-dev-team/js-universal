import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import AjaxLoading from './index';

vi.mock('@/router/utils/loading', () => ({
  __esModule: true,
  default: () => <div data-testid="loading">Loading...</div>,
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe('AjaxLoading Component', () => {
  it('renders without crashing when visible is true', () => {
    render(<AjaxLoading visible={true} />);
    expect(screen.getByText('Loading...')).toBeDefined();
  });

  it('does not render when visible is false', () => {
    render(<AjaxLoading visible={false} />);
    expect(screen.queryByText('Loading...')).toBeNull();
  });

  it('renders with a custom loading message', () => {
    render(<AjaxLoading visible={true} />);
    expect(screen.getByText('Loading...')).toBeDefined();
  });

  it('renders with additional props', () => {
    render(<AjaxLoading visible={true} data-testid="loading" />);
    const loadingElement = screen.getByTestId('loading');
    expect(loadingElement).toBeDefined();
  });

  it('handles null or undefined visible prop', () => {
    render(<AjaxLoading visible={null} />);
    expect(screen.queryByText('Loading...')).toBeNull();

    render(<AjaxLoading visible={undefined} />);
    expect(screen.queryByText('Loading...')).toBeNull();
  });
});
