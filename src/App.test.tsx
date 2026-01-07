import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Procent Mini Games header', () => {
  render(<App />);
  const headerElement = screen.getByText(/Procent Mini Games/i);
  expect(headerElement).toBeInTheDocument();
});
