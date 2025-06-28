import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function Overview({ compras }) {
  const statusCounts = compras.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});
  const fornecedores = Array.from(new Set(compras.map(c => c.fornecedor).filter(Boolean)));

  const pieData = {
    labels: Object.keys(statusCounts),
    datasets: [{
      data: Object.values(statusCounts),
      backgroundColor: ['#60a5fa', '#10b981', '#f59e0b', '#ef4444'],
    }]
  };

  const barData = {
    labels: compras.map(c => c.nome),
    datasets: [{
      label: 'Preço',
      data: compras.map(c => c.preco),
      backgroundColor: '#3b82f6',
    }]
  };

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold">Visão Geral Analítica</h2>
      {compras.length === 0 ? (
        <p className="text-slate-500">Nenhum dado disponível.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow">
            <h3 className="font-medium mb-2">Distribuição por Status</h3>
            <Pie data={pieData} />
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow">
            <h3 className="font-medium mb-2">Preço por Produto</h3>
            <Bar data={barData} />
          </div>
        </div>
      )}
      {fornecedores.length > 0 && (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow">
          <h3 className="font-medium mb-2">Total de Fornecedores</h3>
          <p>{fornecedores.length}</p>
        </div>
      )}
    </div>
  );
}
