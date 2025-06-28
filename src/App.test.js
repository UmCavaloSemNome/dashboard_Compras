import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the Dashboard header', () => {
  render(<App />);
  const headerElement = screen.getByRole('heading', { name: /dashboard de compras/i });
  expect(headerElement).toBeInTheDocument();
});
