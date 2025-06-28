import { render, screen } from '@testing-library/react';
import App from './App';

test('renders dashboard title', () => {
  render(<App />);
  const title = screen.getByText(/Dashboard de Compras/i);
  expect(title).toBeInTheDocument();
});
