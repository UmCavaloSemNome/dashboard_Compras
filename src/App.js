import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { SunIcon, MoonIcon, GoogleIcon } from './icons';

import Overview from "./pages/Overview";
import Workflow from "./pages/Workflow";
import Suppliers from "./pages/Suppliers";

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
                <>
                    <nav className="bg-white dark:bg-slate-800 shadow">
                        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                            <div className="flex gap-4">
                                <Link className="text-sm font-medium" to="/overview">Visão Geral Analítica</Link>
                                <Link className="text-sm font-medium" to="/workflow">Fluxo de Trabalho Operacional</Link>
                                <Link className="text-sm font-medium" to="/suppliers">Hub de Fornecedores</Link>
                            </div>
                            <button onClick={toggleTheme} className="p-2 rounded-full bg-slate-200 dark:bg-slate-700">{theme === "light" ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}</button>
                        </div>
                    </nav>
                    <div className="container mx-auto p-4 md:p-6 lg:p-8">
                        <Routes>
                            <Route path="/overview" element={<Overview compras={compras} />} />
                            <Route path="/workflow" element={<Workflow compras={compras} onAdd={handleAdd} onEdit={handleEdit} onDelete={handleDelete} isLoading={isLoading} error={error} theme={theme} toggleTheme={toggleTheme} />} />
                            <Route path="/suppliers" element={<Suppliers compras={compras} />} />
                            <Route path="*" element={<Navigate to="/overview" replace />} />
                        </Routes>
                    </div>
                </>
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

