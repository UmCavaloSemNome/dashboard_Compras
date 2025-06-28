import { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- Ícones (SVG) ---
const DollarSignIcon = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>);
const ShoppingCartIcon = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>);
const UsersIcon = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>);
const PlusCircleIcon = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>);
const GoogleIcon = () => (<svg viewBox="0 0 48 48" width="24px" height="24px"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C44.438,36.338,48,31,48,24C48,22.659,47.862,21.35,47.611,20.083z"></path></svg>);

// --- Configuração da Planilha ---
const SPREADSHEET_CONFIG = {
    clientId: '375849344447-5qvtr7kho4umqb731272nt6mh8rrp9h7.apps.googleusercontent.com',
    spreadsheetId: '15s9u9s-5UOeCA-__P1170512Y3TIIypxdKWUdSIJLzo',
    sheetName: 'compras'
};

const parseDate = (dateString) => {
    if (!dateString || typeof dateString !== 'string') return null;
    const parts = dateString.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts.map(p => parseInt(p, 10));
      // new Date(year, monthIndex, day)
      const date = new Date(year, month - 1, day);
      if (!isNaN(date.getTime())) {
          return date;
      }
    }
    // Fallback para outros formatos que o `new Date` possa entender
    const fallbackDate = new Date(dateString);
    return isNaN(fallbackDate.getTime()) ? null : fallbackDate;
  };
  
// --- Componentes do Dashboard ---
const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-slate-800 p-6 rounded-lg flex items-center gap-6">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-slate-400 text-sm">{title}</p>
            <p className="text-white text-2xl font-bold">{value}</p>
        </div>
    </div>
);

const Dashboard = ({ compras, onAddOrder }) => {
    const [filters, setFilters] = useState({ status: 'todos', solicitante: 'todos' });
    const [uniqueRequesters, setUniqueRequesters] = useState([]);

    useEffect(() => {
        const requesters = [...new Set(compras.map(c => c.solicitante))];
        setUniqueRequesters(requesters);
    }, [compras]);

    const filteredData = useMemo(() => {
        return compras.filter(compra => {
            const statusMatch = filters.status === 'todos' || compra.status.toLowerCase() === filters.status.toLowerCase();
            const requesterMatch = filters.solicitante === 'todos' || compra.solicitante === filters.solicitante;
            return statusMatch && requesterMatch;
        });
    }, [compras, filters]);

    const cardStats = useMemo(() => {
        try {
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            const gastoNoMes = filteredData
                .filter(c => {
                    const dataCompra = parseDate(c.dataCompra);
                    return dataCompra && dataCompra.getMonth() === currentMonth && dataCompra.getFullYear() === currentYear;
                })
                .reduce((acc, c) => acc + (c.preco * c.quantidade), 0);
                
            return {
                gastoMes: gastoNoMes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                comprasEfetivadas: filteredData.filter(c => c.status.toLowerCase() === 'comprado').length,
                produtosCotacao: filteredData.filter(c => c.status.toLowerCase() === 'cotando' || c.status.toLowerCase() === 'orçamento').length,
            };
        } catch (e) {
            console.error("Erro ao calcular stats dos cards:", e);
            return { gastoMes: 'Erro', comprasEfetivadas: 'Erro', produtosCotacao: 'Erro' };
        }
    }, [filteredData]);

    const monthlyChartData = useMemo(() => {
        try {
            const monthly = {};
            const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

            filteredData.forEach(compra => {
                if (compra.status.toLowerCase() === 'comprado') {
                    const date = parseDate(compra.dataCompra);
                    if (date) {
                        const month = date.getMonth();
                        const year = date.getFullYear();
                        const key = `${year}-${String(month).padStart(2, '0')}`;
                        if (!monthly[key]) {
                            monthly[key] = { name: `${monthNames[month]}/${year.toString().slice(-2)}`, value: 0 };
                        }
                        monthly[key].value += compra.preco * compra.quantidade;
                    }
                }
            });
            return Object.values(monthly).sort((a,b) => new Date(a.name.split('/')[1], monthNames.indexOf(a.name.split('/')[0])) - new Date(b.name.split('/')[1], monthNames.indexOf(b.name.split('/')[0])));
        } catch (e) {
            console.error("Erro ao calcular dados do gráfico mensal:", e);
            return [];
        }
    }, [filteredData]);

    const requesterChartData = useMemo(() => {
        try {
            const byRequester = {};
            filteredData.forEach(compra => {
                const requester = compra.solicitante || "N/A";
                if (!byRequester[requester]) {
                    byRequester[requester] = 0;
                }
                byRequester[requester] += compra.preco * compra.quantidade;
            });
            return Object.entries(byRequester).map(([name, value]) => ({ name, value }));
        } catch (e) {
            console.error("Erro ao calcular dados do gráfico de solicitante:", e);
            return [];
        }
    }, [filteredData]);
    
    return (
        <div className="bg-slate-900 min-h-screen text-slate-300 font-sans p-8">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Dashboard de Compras</h1>
                    <p className="text-slate-400">Bem-vindo(a) de volta!</p>
                </div>
            </header>

            <nav className="mb-8">
                <div className="flex space-x-4 border-b border-slate-700">
                    <button className="py-2 px-4 text-white border-b-2 border-blue-500 font-semibold">Visão Geral Analítica</button>
                </div>
            </nav>
            
            <div className="flex gap-4 mb-8">
                <select onChange={e => setFilters({...filters, status: e.target.value})} className="bg-slate-800 border border-slate-700 rounded-md p-2">
                    <option value="todos">Todos os Status</option>
                    <option value="Comprado">Comprado</option>
                    <option value="Pendente">Pendente</option>
                    <option value="Orçamento">Orçamento</option>
                    <option value="Cotando">Cotando</option>
                </select>
                <select onChange={e => setFilters({...filters, solicitante: e.target.value})} className="bg-slate-800 border border-slate-700 rounded-md p-2">
                    <option value="todos">Todos os Solicitantes</option>
                    {uniqueRequesters.map(req => <option key={req} value={req}>{req}</option>)}
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Gasto total no mês" value={cardStats.gastoMes} icon={<DollarSignIcon className="w-6 h-6 text-white"/>} color="bg-blue-500"/>
                <StatCard title="Compras Efetivadas" value={cardStats.comprasEfetivadas} icon={<ShoppingCartIcon className="w-6 h-6 text-white"/>} color="bg-green-500"/>
                <StatCard title="Produtos em Cotação" value={cardStats.produtosCotacao} icon={<UsersIcon className="w-6 h-6 text-white"/>} color="bg-yellow-500"/>
                <div onClick={onAddOrder} className="bg-slate-800 p-6 rounded-lg flex items-center gap-6 cursor-pointer hover:bg-slate-700 transition-colors">
                     <div className="w-12 h-12 rounded-full flex items-center justify-center bg-purple-500">
                        <PlusCircleIcon className="w-6 h-6 text-white"/>
                    </div>
                    <div>
                        <p className="text-white text-lg font-bold">Adicionar Pedido</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
                <div className="lg:col-span-3 bg-slate-800 p-6 rounded-lg">
                    <h2 className="text-xl font-semibold text-white mb-4">Compras por Mês (Status: Comprado)</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={monthlyChartData}>
                            <XAxis dataKey="name" stroke="#94a3b8"/>
                            <YAxis stroke="#94a3b8" tickFormatter={(value) => new Intl.NumberFormat('pt-BR', { notation: 'compact', compactDisplay: 'short' }).format(value)} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} formatter={(value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)} />
                            <Bar dataKey="value" fill="#3b82f6" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="lg:col-span-2 bg-slate-800 p-6 rounded-lg">
                    <h2 className="text-xl font-semibold text-white mb-4">Gasto por Solicitante</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={requesterChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5}>
                                {requesterChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} />)}
                            </Pie>
                            <Tooltip formatter={(value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
            
            <div className="bg-slate-800 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-white mb-4">Últimos Pedidos</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr>
                                <th className="p-3 text-sm font-semibold text-slate-400">ID Único</th>
                                <th className="p-3 text-sm font-semibold text-slate-400">Fornecedor</th>
                                <th className="p-3 text-sm font-semibold text-slate-400">Data</th>
                                <th className="p-3 text-sm font-semibold text-slate-400">Total</th>
                                <th className="p-3 text-sm font-semibold text-slate-400">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.slice(0, 5).map((compra) => (
                                <tr key={compra.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                                    <td className="p-3 text-white font-medium">{compra.id.split('-').pop()}</td>
                                    <td className="p-3">{compra.fornecedor}</td>
                                    <td className="p-3">{compra.dataCompra}</td>
                                    <td className="p-3 font-medium">{(compra.preco * compra.quantidade).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                            compra.status.toLowerCase() === 'comprado' ? 'bg-green-500/20 text-green-400' :
                                            compra.status.toLowerCase() === 'pendente' ? 'bg-yellow-500/20 text-yellow-400' :
                                            'bg-slate-600/50 text-slate-300'
                                        }`}>
                                            {compra.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default function App() {
    const [gapi, setGapi] = useState(null);
    const [google, setGoogle] = useState(null);
    const [tokenClient, setTokenClient] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [compras, setCompras] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);
    const [error, setError] = useState(null);
    const [isAddOrderModalOpen, setIsAddOrderModalOpen] = useState(false);

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.async = true;
        script.defer = true;
        script.onload = () => window.gapi.load('client', () => setGapi(window.gapi));
        document.body.appendChild(script);

        const script2 = document.createElement('script');
        script2.src = 'https://accounts.google.com/gsi/client';
        script2.async = true;
        script2.defer = true;
        script2.onload = () => setGoogle(window.google);
        document.body.appendChild(script2);
    }, []);

    useEffect(() => {
        if (gapi && google) {
            try {
                const client = google.accounts.oauth2.initTokenClient({
                    client_id: SPREADSHEET_CONFIG.clientId,
                    scope: 'https://www.googleapis.com/auth/spreadsheets',
                    callback: async (tokenResponse) => {
                        if (tokenResponse && tokenResponse.access_token) {
                            gapi.client.setToken(tokenResponse);
                            await gapi.client.load('sheets', 'v4');
                            setIsLoggedIn(true);
                            fetchSheetData();
                        } else {
                            setIsInitializing(false);
                        }
                    },
                });
                setTokenClient(client);
                setIsInitializing(false);
            } catch (err) {
                console.error("Erro ao inicializar cliente Google:", err);
                setError("Falha ao inicializar o Google. Verifique o Client ID.");
                setIsInitializing(false);
            }
        }
    }, [gapi, google]);

    const handleLogin = () => {
        if (tokenClient) {
            tokenClient.requestAccessToken();
        }
    };
    
    const fetchSheetData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const range = `${SPREADSHEET_CONFIG.sheetName}!A:L`;
            const response = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: SPREADSHEET_CONFIG.spreadsheetId,
                range: range,
            });
            const rows = response.result.values || [];
            if (rows.length > 0) {
                const header = rows[0].map(h => h.toLowerCase().trim());
                const idColIndex = header.indexOf('id_unico');
                if (idColIndex === -1) throw new Error('A coluna "ID_UNICO" não foi encontrada na planilha.');

                const data = rows.slice(1).map((row, index) => {
                    if (!row || !row[idColIndex]) return null;
                    return {
                        rowIndex: index + 2,
                        id: row[idColIndex],
                        fullRow: row,
                        nome: row[0] || '',
                        quantidade: parseInt(row[1] || '1', 10),
                        preco: parseFloat((row[2] || '0').toString().replace(/\./g, '').replace(',', '.')) || 0,
                        solicitante: row[4] || 'N/A',
                        fornecedor: row[5] || 'N/A',
                        comprador: row[7] || 'N/A',
                        dataCompra: row[8] || null,
                        status: row[10] || 'Orçamento',
                    };
                }).filter(Boolean);

                setCompras(data);
            }
        } catch (err) {
            console.error("Erro detalhado ao buscar dados: ", err);
            const errorMessage = err.result?.error?.message || err.message || 'Um erro desconhecido ocorreu.';
            setError(`Erro ao carregar dados: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleAddOrder = async (order) => {
        setIsLoading(true);
        const rowsToAdd = order.products.map(product => {
            const newId = `compra-${Date.now()}-${Math.random()}`;
            const newRow = Array(12).fill('');
            newRow[0] = product.nome;
            newRow[1] = product.quantidade;
            newRow[2] = product.preco;
            newRow[4] = order.solicitante;
            newRow[5] = order.fornecedor;
            newRow[7] = order.comprador;
            newRow[8] = new Date().toLocaleDateString('pt-BR');
            newRow[10] = 'Orçamento';
            newRow[11] = newId;
            return newRow;
        });

        try {
            await gapi.client.sheets.spreadsheets.values.append({
                spreadsheetId: SPREADSHEET_CONFIG.spreadsheetId,
                range: `${SPREADSHEET_CONFIG.sheetName}!A:L`,
                valueInputOption: 'USER_ENTERED',
                resource: { values: rowsToAdd }
            });
            await fetchSheetData();
            setIsAddOrderModalOpen(false);
        } catch (err) {
            setError("Falha ao adicionar o novo pedido.");
        }
        setIsLoading(false);
    };

    if (isInitializing) {
        return <div className="bg-slate-900 min-h-screen flex items-center justify-center text-white">Inicializando...</div>
    }

    if (!isLoggedIn) {
        return <LoginScreen onLogin={handleLogin} error={error} />;
    }

    if (isLoading) {
        return <div className="bg-slate-900 min-h-screen flex items-center justify-center text-white">Carregando dados da planilha...</div>
    }
    
    if (error) {
        return <div className="bg-slate-900 min-h-screen flex items-center justify-center text-red-400">{error}</div>
    }

    return (
        <>
            <Dashboard compras={compras} onAddOrder={() => setIsAddOrderModalOpen(true)} />
            {isAddOrderModalOpen && <AddOrderForm onCancel={() => setIsAddOrderModalOpen(false)} onSubmit={handleAddOrder} />}
        </>
    );
}


function LoginScreen({ onLogin, error }) {
    return (
        <div className="bg-slate-900 flex flex-col items-center justify-center min-h-screen text-center p-4">
            <h1 className="text-4xl font-bold text-white mb-2">Dashboard de Compras</h1>
            <p className="text-lg text-slate-400 mb-8">Faça login para aceder à sua planilha.</p>
            <button onClick={onLogin} className="flex items-center justify-center gap-3 py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-105">
                <GoogleIcon /> Login com Google
            </button>
            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
        </div>
    );
}

function AddOrderForm({ onCancel, onSubmit }) {
    const [header, setHeader] = useState({ solicitante: '', comprador: '', fornecedor: '' });
    const [products, setProducts] = useState([{ nome: '', quantidade: 1, preco: '' }]);

    const handleHeaderChange = (e) => setHeader(prev => ({ ...prev, [e.target.name]: e.target.value }));
    
    const handleProductChange = (index, e) => {
        const newProducts = [...products];
        newProducts[index][e.target.name] = e.target.value;
        setProducts(newProducts);
    };
    
    const addProduct = () => setProducts([...products, { nome: '', quantidade: 1, preco: '' }]);
    
    const removeProduct = (index) => setProducts(products.filter((_, i) => i !== index));

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ ...header, products });
    };

    const inputStyle = "w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-blue-500 focus:border-blue-500";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl border border-slate-700">
                <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-white">Adicionar Pedido de Compra</h3>
                    <button type="button" onClick={onCancel} className="text-slate-400 hover:text-slate-300">&times;</button>
                </div>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div><label className="block text-sm font-medium text-slate-400 mb-1">Solicitante*</label><input type="text" name="solicitante" value={header.solicitante} onChange={handleHeaderChange} required className={inputStyle} /></div>
                        <div><label className="block text-sm font-medium text-slate-400 mb-1">Comprador</label><input type="text" name="comprador" value={header.comprador} onChange={handleHeaderChange} className={inputStyle} /></div>
                        <div><label className="block text-sm font-medium text-slate-400 mb-1">Fornecedor</label><input type="text" name="fornecedor" value={header.fornecedor} onChange={handleHeaderChange} className={inputStyle} /></div>
                    </div>
                    <h4 className="text-lg font-semibold text-white pt-4 border-t border-slate-700 mt-4">Produtos</h4>
                    {products.map((product, index) => (
                        <div key={index} className="grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-5"><label className="block text-xs font-medium text-slate-400">Nome*</label><input type="text" name="nome" value={product.nome} onChange={(e) => handleProductChange(index, e)} required className={inputStyle} /></div>
                            <div className="col-span-2"><label className="block text-xs font-medium text-slate-400">Qtd*</label><input type="number" name="quantidade" value={product.quantidade} onChange={(e) => handleProductChange(index, e)} required className={inputStyle} /></div>
                            <div className="col-span-3"><label className="block text-xs font-medium text-slate-400">Preço*</label><input type="number" step="0.01" name="preco" value={product.preco} onChange={(e) => handleProductChange(index, e)} required className={inputStyle} /></div>
                            <div className="col-span-2 flex items-end">
                                <button type="button" onClick={() => removeProduct(index)} className="text-red-500 hover:text-red-700 p-2">Remover</button>
                            </div>
                        </div>
                    ))}
                    <button type="button" onClick={addProduct} className="text-sm text-blue-400 font-semibold hover:underline mt-2">Adicionar outro produto</button>
                </div>
                <div className="p-4 bg-slate-900/50 border-t border-slate-700 flex justify-end gap-3 rounded-b-xl">
                    <button type="button" onClick={onCancel} className="px-4 py-2 bg-slate-700 text-slate-200 font-semibold rounded-lg hover:bg-slate-600 transition-colors">Cancelar</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">Salvar Pedido</button>
                </div>
            </form>
        </div>
    );
}