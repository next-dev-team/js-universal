import React from 'react';
import { render, screen } from '@testing-library/react';
import Button from './index';

jest.mock('@/components/button', () => ({
  Button: (props) => <button {...props}>Mocked Button</button>,
}));

afterEach(() => {
  jest.clearAllMocks();
});

describe('Button Component', () => {
  it('renders without crashing with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('renders with a custom class name', () => {
    render(<Button className='custom-class'>Click me</Button>);
    const buttonElement = screen.getByText('Click me');
    expect(buttonElement).toHaveClass('custom-class');
  });
});
