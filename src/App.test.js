import { render, screen } from '@testing-library/react';
import App from './App';

test('renders dashboard title', () => {
  render(<App />);
  const heading = screen.getByText(/Dashboard de Compras/i);
  expect(heading).toBeInTheDocument();
});
