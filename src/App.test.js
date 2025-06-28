import { render, screen } from '@testing-library/react';
import App from './App';

test('renders login screen', () => {
  render(<App />);
  const heading = screen.getByText(/dashboard de compras/i);
  expect(heading).toBeInTheDocument();
});
