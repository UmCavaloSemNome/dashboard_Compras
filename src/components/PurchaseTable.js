import React from 'react';

const PencilIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
);
const TrashIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><polyline points="10 11 10 17"></polyline><polyline points="14 11 14 17"></polyline></svg>
);

export default function PurchaseTable({ purchases, onEdit, onDelete }) {
  return (
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
          {purchases.length > 0 ? (
            purchases.map(purchase => (
              <tr key={purchase.id || purchase.rowIndex} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200">
                <td className="p-4 font-medium text-slate-900 dark:text-white">{purchase.nome}</td>
                <td className="p-4 text-slate-500 dark:text-slate-400">{purchase.fornecedor}</td>
                <td className="p-4 text-slate-500 dark:text-slate-400">{(purchase.preco || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td className="p-4 text-slate-500 dark:text-slate-400">{purchase.status}</td>
                <td className="p-4">
                  <div className="flex justify-center gap-3">
                    <button onClick={() => onEdit(purchase)} className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 transition-colors" title="Editar">
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button onClick={() => onDelete(purchase)} className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors" title="Excluir">
                      <TrashIcon className="h-5 w-5" />
                    </button>
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
  );
}
