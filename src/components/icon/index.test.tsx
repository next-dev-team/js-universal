import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import Icon from './index';

vi.mock('@/components/icon/icons-loader', async () => {
  const actual = await vi.importActual('@/components/icon/icons-loader');
  return {
    __esModule: true,
    default: {
      ...(actual as any).default,
      '/src/icons/test-icon.svg': () => <svg>Test Icon</svg>,
      '/src/icons/another-icon.svg': () => <svg>Another Icon</svg>,
    },
  };
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('Icon Component', () => {
  it('renders without crashing with a valid icon name', () => {
    render(<Icon name="test-icon" />);
    expect(screen.getByText('Test Icon')).toBeDefined();
  });

  it('does not render when an invalid icon name is provided', () => {
    render(<Icon name="invalid-icon" />);
    expect(screen.queryByText('Test Icon')).not.toBeDefined();
  });

  it('renders with another valid icon name', () => {
    render(<Icon name="another-icon" />);
    expect(screen.getByText('Another Icon')).toBeDefined();
  });
});
