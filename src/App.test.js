import { render, screen, fireEvent } from '@testing-library/react';
import App, { AddEditForm } from './App';

test('shows login screen on initial render', () => {
  render(<App />);
  expect(screen.getByText(/login com google/i)).toBeInTheDocument();
});

test('submits new purchase data in AddEditForm', () => {
  const handleSubmit = jest.fn();
  render(<AddEditForm onSubmit={handleSubmit} onCancel={() => {}} />);
  fireEvent.change(screen.getByLabelText(/nome/i), { target: { value: 'Produto X' } });
  fireEvent.change(screen.getByLabelText(/fornecedor/i), { target: { value: 'Fornecedor Y' } });
  fireEvent.change(screen.getByLabelText(/preço/i), { target: { value: '12' } });
  fireEvent.click(screen.getByRole('button', { name: /salvar na planilha/i }));
  expect(handleSubmit).toHaveBeenCalledWith({ nome: 'Produto X', fornecedor: 'Fornecedor Y', preco: '12', status: 'Orçamento' });
});
