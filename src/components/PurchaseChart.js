import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PurchaseChart = ({ data }) => {
    // Dados para o gráfico de pizza (por status)
    const statusData = data.reduce((acc, curr) => {
        const status = curr.status || 'Não definido';
        const existing = acc.find(item => item.name === status);
        if (existing) {
            existing.value += curr.preco;
        } else {
            acc.push({ name: status, value: curr.preco });
        }
        return acc;
    }, []);

    // Dados para o gráfico de barras (por fornecedor)
    const supplierData = data.reduce((acc, curr) => {
        const supplier = curr.fornecedor || 'Não definido';
        const existing = acc.find(item => item.name === supplier);
        if (existing) {
            existing.value += curr.preco;
        } else {
            acc.push({ name: supplier, value: curr.preco });
        }
        return acc;
    }, []);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Distribuição por Status</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={statusData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                            {statusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Total por Fornecedor</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={supplierData}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)} />
                        <Legend />
                        <Bar dataKey="value" fill="#82ca9d" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default PurchaseChart;