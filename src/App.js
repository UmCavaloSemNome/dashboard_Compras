import { useState, useEffect } from 'react';

// --- Ícones (SVG) ---
const PlusCircleIcon = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>);
const XIcon = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);
const PencilIcon = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>);
const TrashIcon = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><polyline points="10 11 10 17"></polyline><polyline points="14 11 14 17"></polyline></svg>);
const GoogleIcon = () => (<svg viewBox="0 0 48 48" width="24px" height="24px"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C44.438,36.338,48,31,48,24C48,22.659,47.862,21.35,47.611,20.083z"></path></svg>);
const SunIcon = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>);
const MoonIcon = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>);

// --- INSTRUÇÕES IMPORTANTES ---
const SPREADSHEET_CONFIG = {
    clientId: '375849344447-5qvtr7kho4umqb731272nt6mh8rrp9h7.apps.googleusercontent.com',
    spreadsheetId: '15s9u9s-5UOeCA-__P1170512Y3TIIypxdKWUdSIJLzo',
    sheetName: 'compras'
};

// --- Componente Principal: App ---
export default function App() {
    const [gapi, setGapi] = useState(null);
    const [google, setGoogle] = useState(null);
    const [tokenClient, setTokenClient] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [compras, setCompras] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [theme, setTheme] = useState('light');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentPurchase, setCurrentPurchase] = useState(null);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
    }, []);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

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
        if (gapi && google && SPREADSHEET_CONFIG.clientId) {
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
                        }
                    },
                });
                setTokenClient(client);
            } catch (err) {
                console.error("Erro ao inicializar cliente Google:", err);
                setError("Falha ao inicializar o Google. Verifique o Client ID.");
            }
        }
    }, [gapi, google]);

    const handleLogin = () => {
        if (SPREADSHEET_CONFIG.clientId === 'SEU_CLIENT_ID_VAI_AQUI') {
            setError("Por favor, adicione o seu Client ID no código do ficheiro App.js.");
            return;
        }
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
                if (idColIndex === -1) throw new Error('A coluna "ID_UNICO" não foi encontrada.');
                const data = rows.slice(1).map((row, index) => ({
                    rowIndex: index + 2,
                    id: row[idColIndex],
                    fullRow: row,
                    nome: row[0] || '',
                    preco: parseFloat((row[3] || '0').toString().replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.')) || 0,
                    fornecedor: row[5] || '',
                    status: row[10] || 'Orçamento',
                })).filter(c => c.id && c.nome);
                setCompras(data);
                if (data.length === 0) setError("Planilha conectada! Nenhuma linha com dados válidos foi encontrada.");
            } else {
                setError("Planilha conectada! A aba selecionada parece estar vazia.");
            }
        } catch (err) {
            const errorMessage = err.result?.error?.message || err.message || 'Um erro desconhecido ocorreu.';
            setError(`Erro ao carregar dados: ${errorMessage}`);
        }
        setIsLoading(false);
    };

    const handleAdd = async (newPurchase) => {
        setIsLoading(true);
        const newId = `compra-${Date.now()}`;
        const newRow = Array(12).fill('');
        newRow[0] = newPurchase.nome; newRow[3] = newPurchase.preco; newRow[5] = newPurchase.fornecedor; newRow[10] = newPurchase.status; newRow[11] = newId;
        try {
            await gapi.client.sheets.spreadsheets.values.append({
                spreadsheetId: SPREADSHEET_CONFIG.spreadsheetId,
                range: `${SPREADSHEET_CONFIG.sheetName}!A:L`,
                valueInputOption: 'USER_ENTERED',
                resource: { values: [newRow] }
            });
            await fetchSheetData();
            setIsAddModalOpen(false);
        } catch (err) {
            setError("Falha ao adicionar a nova compra.");
        }
        setIsLoading(false);
    };

    const handleEdit = async (id, updatedPurchase) => {
        const item = compras.find(c => c.id === id);
        if (!item) return;
        setIsLoading(true);
        const updatedRow = [...item.fullRow];
        while (updatedRow.length < 12) { updatedRow.push(''); }
        updatedRow[0] = updatedPurchase.nome;
        updatedRow[3] = updatedPurchase.preco;
        updatedRow[5] = updatedPurchase.fornecedor;
        updatedRow[10] = updatedPurchase.status;
        updatedRow[11] = id;
        try {
            const range = `${SPREADSHEET_CONFIG.sheetName}!A${item.rowIndex}:L${item.rowIndex}`;
            await gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_CONFIG.spreadsheetId,
                range: range,
                valueInputOption: 'USER_ENTERED',
                resource: { values: [updatedRow] },
            });
            await fetchSheetData();
            setIsEditModalOpen(false);
        } catch (err) {
            setError("Falha ao editar a compra.");
        }
        setIsLoading(false);
    };

    const handleDelete = async (id) => {
        const item = compras.find(c => c.id === id);
        if (!item) return;
        setIsLoading(true);
        try {
            const sheetInfo = await gapi.client.sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_CONFIG.spreadsheetId });
            const sheet = sheetInfo.result.sheets.find(s => s.properties.title === SPREADSHEET_CONFIG.sheetName);
            if (!sheet) throw new Error("Aba da planilha não encontrada.");
            const sheetId = sheet.properties.sheetId;

            await gapi.client.sheets.spreadsheets.batchUpdate({
                spreadsheetId: SPREADSHEET_CONFIG.spreadsheetId,
                resource: {
                    requests: [{
                        deleteDimension: {
                            range: {
                                sheetId: sheetId,
                                dimension: 'ROWS',
                                startIndex: item.rowIndex - 1,
                                endIndex: item.rowIndex
                            }
                        }
                    }]
                }
            });
            await fetchSheetData();
            setIsDeleteModalOpen(false);
        } catch (err) {
            setError("Falha ao deletar a compra.");
        }
        setIsLoading(false);
    };

    return (
        <div className="bg-slate-100 dark:bg-slate-900 min-h-screen font-sans text-slate-800 dark:text-slate-200 transition-colors duration-300">
            {!isLoggedIn ? (
                <LoginScreen onLogin={handleLogin} error={error} />
            ) : (
                <div className="container mx-auto p-4 md:p-6 lg:p-8">
                    <header className="flex justify-between items-center mb-8">
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Dashboard de Compras</h1>
                        <div className="flex items-center gap-4">
                            <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-300">
                                <PlusCircleIcon className="h-5 w-5" />
                                <span className="hidden sm:inline">Adicionar Compra</span>
                            </button>
                            <button onClick={toggleTheme} className="p-2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors duration-300">
                                {theme === 'light' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
                            </button>
                        </div>
                    </header>
                    {error && <div className="bg-yellow-100 dark:bg-yellow-900/20 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-300 p-4 mb-6 rounded-md" role="alert"><p className="font-bold">Aviso:</p><p>{error}</p></div>}
                    {isLoading ? <p className="text-center p-8 text-slate-500 dark:text-slate-400">Sincronizando com a planilha...</p> : (
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
                                                <td className="p-4"><div className="flex justify-center gap-3">
                                                    <button onClick={() => { setCurrentPurchase(compra); setIsEditModalOpen(true); }} className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 transition-colors" title="Editar"><PencilIcon className="h-5 w-5" /></button>
                                                    <button onClick={() => { setCurrentPurchase(compra); setIsDeleteModalOpen(true); }} className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors" title="Excluir"><TrashIcon className="h-5 w-5" /></button>
                                                </div></td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="5" className="text-center p-8 text-slate-500 dark:text-slate-400">Nenhum dado para exibir.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
            {isAddModalOpen && <AddEditForm onCancel={() => setIsAddModalOpen(false)} onSubmit={handleAdd} />}
            {isEditModalOpen && currentPurchase && <AddEditForm isEditMode purchase={currentPurchase} onCancel={() => setIsEditModalOpen(false)} onSubmit={(id, data) => handleEdit(id, data)} />}
            {isDeleteModalOpen && currentPurchase && <DeleteConfirmationModal onConfirm={() => handleDelete(currentPurchase.id)} onCancel={() => setIsDeleteModalOpen(false)} purchaseName={currentPurchase.nome} />}
        </div>
    );
}

function LoginScreen({ onLogin, error }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Dashboard de Compras</h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">Faça login para aceder à sua planilha.</p>
            <button onClick={onLogin} className="flex items-center justify-center gap-3 py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-105">
                <GoogleIcon /> Login com Google
            </button>
            {error && <p className="text-red-500 dark:text-red-400 text-sm mt-4">{error}</p>}
        </div>
    );
}

function AddEditForm({ isEditMode = false, purchase, onCancel, onSubmit }) {
    const [formState, setFormState] = useState({ nome: '', fornecedor: '', preco: '', status: 'Orçamento' });
    useEffect(() => {
        if (isEditMode && purchase) {
            setFormState({ nome: purchase.nome, fornecedor: purchase.fornecedor, preco: purchase.preco, status: purchase.status, });
        }
    }, [isEditMode, purchase]);
    const handleChange = (e) => setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleSubmit = (e) => { e.preventDefault(); isEditMode ? onSubmit(purchase.id, formState) : onSubmit(formState); };
    return (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-700">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center"><h3 className="text-xl font-semibold text-slate-900 dark:text-white">{isEditMode ? 'Editar' : 'Adicionar'} Compra</h3><button type="button" onClick={onCancel} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"><XIcon className="h-6 w-6" /></button></div>
                <div className="p-6 space-y-4">
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome*</label><input type="text" name="nome" value={formState.nome} onChange={handleChange} required className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-blue-500 focus:border-blue-500" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fornecedor</label><input type="text" name="fornecedor" value={formState.fornecedor} onChange={handleChange} className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-blue-500 focus:border-blue-500" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Preço*</label><input type="number" step="0.01" name="preco" value={formState.preco} onChange={handleChange} required className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-blue-500 focus:border-blue-500" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label><select name="status" value={formState.status} onChange={handleChange} className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-blue-500 focus:border-blue-500"><option>Orçamento</option><option>Pendente</option><option>Comprado</option></select></div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3 rounded-b-xl">
                    <button type="button" onClick={onCancel} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">Cancelar</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">Salvar na Planilha</button>
                </div>
            </form>
        </div>
    );
}

function DeleteConfirmationModal({ onConfirm, onCancel, purchaseName }) {
    return (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-sm border border-slate-200 dark:border-slate-700">
                <div className="p-6 text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20"><TrashIcon className="h-6 w-6 text-red-600 dark:text-red-400" /></div>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mt-4">Excluir Registro</h3>
                    <div className="mt-2 px-7 py-3"><p className="text-sm text-slate-500 dark:text-slate-400">Tem certeza que deseja excluir <span className="font-bold">"{purchaseName}"</span>?</p></div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-center gap-3 rounded-b-xl">
                    <button type="button" onClick={onCancel} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 w-full transition-colors">Cancelar</button>
                    <button type="button" onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 w-full transition-colors">Excluir</button>
                </div>
            </div>
        </div>
    );
}
