import { useState, useEffect } from 'react';
import PurchaseTable from './components/PurchaseTable';
import PurchaseForm from './components/PurchaseForm';
import DeleteModal from './components/DeleteModal';

// --- Ícones (SVG) ---
const PlusCircleIcon = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>);
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
                    {isLoading ? (
                        <p className="text-center p-8 text-slate-500 dark:text-slate-400">Sincronizando com a planilha...</p>
                    ) : (
                        <PurchaseTable
                            purchases={compras}
                            onEdit={(p) => { setCurrentPurchase(p); setIsEditModalOpen(true); }}
                            onDelete={(p) => { setCurrentPurchase(p); setIsDeleteModalOpen(true); }}
                        />
                    )}
                </div>
            )}
            {isAddModalOpen && (
                <PurchaseForm onCancel={() => setIsAddModalOpen(false)} onSubmit={handleAdd} />
            )}
            {isEditModalOpen && currentPurchase && (
                <PurchaseForm
                    isEditMode
                    purchase={currentPurchase}
                    onCancel={() => setIsEditModalOpen(false)}
                    onSubmit={(id, data) => handleEdit(id, data)}
                />
            )}
            {isDeleteModalOpen && currentPurchase && (
                <DeleteModal
                    onConfirm={() => handleDelete(currentPurchase.id)}
                    onCancel={() => setIsDeleteModalOpen(false)}
                    purchaseName={currentPurchase.nome}
                />
            )}
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

