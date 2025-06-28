export default function Suppliers({ compras }) {
  const grouped = compras.reduce((acc, c) => {
    const key = c.fornecedor || 'Desconhecido';
    if (!acc[key]) acc[key] = [];
    acc[key].push(c);
    return acc;
  }, {});

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Hub de Fornecedores</h1>
      {Object.keys(grouped).length === 0 ? (
        <p className="text-slate-500">Nenhum fornecedor cadastrado.</p>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([fornecedor, itens]) => (
            <div key={fornecedor} className="bg-white dark:bg-slate-800 rounded-xl shadow p-4 border border-slate-200 dark:border-slate-700">
              <h3 className="font-medium mb-2">{fornecedor}</h3>
              <ul className="list-disc ml-5 text-slate-600 dark:text-slate-300">
                {itens.map(i => (
                  <li key={i.id || i.rowIndex}>{i.nome} - {(i.preco || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
