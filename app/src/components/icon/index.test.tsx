import { render, screen } from '@testing-library/react';
import Icon from './index';

jest.mock('@/components/icon/icons-loader', () => ({
  '/src/icons/test-icon.svg': () => <svg>Test Icon</svg>,
  '/src/icons/another-icon.svg': () => <svg>Another Icon</svg>,
}));

afterEach(() => {
  jest.clearAllMocks();
});

describe('Icon Component', () => {
  it('renders without crashing with a valid icon name', () => {
    render(<Icon name='test-icon' />);
    expect(screen.getByText('Test Icon')).toBeInTheDocument();
  });

  it('does not render when an invalid icon name is provided', () => {
    render(<Icon name='invalid-icon' />);
    expect(screen.queryByText('Test Icon')).not.toBeInTheDocument();
  });

  it('renders with another valid icon name', () => {
    render(<Icon name='another-icon' />);
    expect(screen.getByText('Another Icon')).toBeInTheDocument();
  });
});