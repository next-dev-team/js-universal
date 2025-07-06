import { render, screen } from '@testing-library/react';
import Button from './index';

afterEach(() => {
  vi.clearAllMocks();
});

describe('Button Component', () => {
  it('renders without crashing with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDefined();
  });

  it('renders with a custom class name', () => {
    render(<Button className="custom-class">Click me</Button>);
    const buttonElement = screen.getByText('Click me');
    expect(buttonElement.className).toContain('custom-class');
  });
});
