import { useState } from 'react';
import { AddEditForm, DeleteConfirmationModal } from '../components/PurchaseForms';
import { PlusCircleIcon } from '../icons';

export default function Workflow({ compras, onAdd, onEdit, onDelete, isLoading, error, theme, toggleTheme }) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentPurchase, setCurrentPurchase] = useState(null);

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Fluxo de Trabalho Operacional</h1>
        <div className="flex items-center gap-4">
          <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-300">
            <PlusCircleIcon className="h-5 w-5" />
            <span className="hidden sm:inline">Adicionar Compra</span>
          </button>
          <button onClick={toggleTheme} className="p-2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors duration-300">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </header>
      {error && (
        <div className="bg-yellow-100 dark:bg-yellow-900/20 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-300 p-4 mb-6 rounded-md" role="alert">
          <p className="font-bold">Aviso:</p>
          <p>{error}</p>
        </div>
      )}
      {isLoading ? (
        <p className="text-center p-8 text-slate-500 dark:text-slate-400">Sincronizando com a planilha...</p>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300 uppercase tracking-wider">Produto</th>
                <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300 uppercase tracking-wider">Fornecedor</th>
                <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300 uppercase tracking-wider">Preço</th>
                <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300 uppercase tracking-wider">Status</th>
                <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300 uppercase tracking-wider text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {compras.length > 0 ? (
                compras.map(compra => (
                  <tr key={compra.id || compra.rowIndex} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200">
                    <td className="p-4 font-medium text-slate-900 dark:text-white">{compra.nome}</td>
                    <td className="p-4 text-slate-500 dark:text-slate-400">{compra.fornecedor}</td>
                    <td className="p-4 text-slate-500 dark:text-slate-400">{(compra.preco || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                    <td className="p-4 text-slate-500 dark:text-slate-400">{compra.status}</td>
                    <td className="p-4">
                      <div className="flex justify-center gap-3">
                        <button onClick={() => { setCurrentPurchase(compra); setIsEditModalOpen(true); }} className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 transition-colors" title="Editar">✎</button>
                        <button onClick={() => { setCurrentPurchase(compra); setIsDeleteModalOpen(true); }} className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors" title="Excluir">🗑</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center p-8 text-slate-500 dark:text-slate-400">Nenhum dado para exibir.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {isAddModalOpen && <AddEditForm onCancel={() => setIsAddModalOpen(false)} onSubmit={onAdd} />}
      {isEditModalOpen && currentPurchase && <AddEditForm isEditMode purchase={currentPurchase} onCancel={() => setIsEditModalOpen(false)} onSubmit={(id, data) => { onEdit(id, data); }} />}
      {isDeleteModalOpen && currentPurchase && <DeleteConfirmationModal onConfirm={() => { onDelete(currentPurchase.id); setIsDeleteModalOpen(false); }} onCancel={() => setIsDeleteModalOpen(false)} purchaseName={currentPurchase.nome} />}
    </div>
  );
}
