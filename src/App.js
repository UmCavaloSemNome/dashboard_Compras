import React, { useState, useEffect } from 'react';

// --- Ícones (SVG) ---
const PlusCircleIcon = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>);
const XIcon = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);
const PencilIcon = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>);
const TrashIcon = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><polyline points="10 11 10 17"></polyline><polyline points="14 11 14 17"></polyline></svg>);
const GoogleIcon = () => (<svg viewBox="0 0 48 48" width="24px" height="24px"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C44.438,36.338,48,31,48,24C48,22.659,47.862,21.35,47.611,20.083z"></path></svg>);

// --- Componente Principal: App ---
export default function App() {
    const [gapi, setGapi] = useState(null);
    const [google, setGoogle] = useState(null);
    const [tokenClient, setTokenClient] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    
    const [compras, setCompras] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Modais e Dados
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentPurchase, setCurrentPurchase] = useState(null);
    
    // Configurações da Planilha
    const [config, setConfig] = useState({ clientId: '', spreadsheetId: '', sheetName: 'Junho/2025' });

    // Carrega o Google Sign-In (GSI)
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

    // Inicializa o cliente de token do Google
    useEffect(() => {
        if (gapi && google && config.clientId) {
            try {
                const client = google.accounts.oauth2.initTokenClient({
                    client_id: config.clientId,
                    scope: 'https://www.googleapis.com/auth/spreadsheets',
                    callback: async (tokenResponse) => {
                        if (tokenResponse && tokenResponse.access_token) {
                            gapi.client.setToken(tokenResponse);
                            await gapi.client.load('sheets', 'v4');
                            setIsLoggedIn(true);
                            setIsConfigModalOpen(false);
                            fetchSheetData();
                        }
                    },
                });
                setTokenClient(client);
            } catch (err) {
                console.error("Erro ao inicializar cliente Google:", err);
                setError("Falha ao inicializar a autenticação do Google. Verifique o Client ID.")
            }
        }
    }, [gapi, google, config.clientId]);

    const handleLogin = () => tokenClient ? tokenClient.requestAccessToken() : setError("Cliente de autenticação não está pronto.");
    const handleConfigSave = (newConfig) => setConfig(newConfig);

    const fetchSheetData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const range = `${config.sheetName}!A:L`;
            const response = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: config.spreadsheetId,
                range: range,
            });
            
            const rows = response.result.values || [];
            if (rows.length > 0) {
                const header = rows[0].map(h => h.toLowerCase().trim());
                const idColIndex = header.indexOf('id_unico');
                
                if (idColIndex === -1) {
                     throw new Error('A coluna "ID_UNICO" não foi encontrada na sua planilha. Por favor, adicione-a (ex: na coluna L) e tente novamente.');
                }
                
                const data = rows.slice(1).map((row, index) => ({
                    rowIndex: index + 2,
                    id: row[idColIndex],
                    nome: row[0] || '',
                    preco: parseFloat((row[3] || '0').toString().replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.')) || 0,
                    fornecedor: row[5] || '',
                    status: row[10] || 'Orçamento',
                })).filter(c => c.id && c.nome); // Garante que apenas linhas com ID e Nome sejam processadas
                
                setCompras(data);
                if (data.length === 0) {
                    setError("Conectado com sucesso, mas nenhuma linha com dados válidos (com ID e Nome) foi encontrada na planilha.");
                }

            } else {
                 setError("Conectado com sucesso, mas a planilha ou a aba parecem estar vazias.");
            }
        } catch (err) {
            setError(`Erro ao carregar dados: ${err.message || 'Verifique as configurações e permissões.'}`);
            console.error(err);
        }
        setIsLoading(false);
    };

    const handleAdd = async (newPurchase) => {
        setIsLoading(true);
        const newId = `compra-${Date.now()}`;
        const newRow = [newPurchase.nome, '', '', newPurchase.preco, '', newPurchase.fornecedor, '', '', '', '', newPurchase.status, newId];
        try {
            await gapi.client.sheets.spreadsheets.values.append({
                spreadsheetId: config.spreadsheetId, range: `${config.sheetName}!A:L`,
                valueInputOption: 'USER_ENTERED', resource: { values: [newRow] }
            });
            await fetchSheetData();
            setIsAddModalOpen(false);
        } catch(err) { setError("Falha ao adicionar a nova compra."); console.error(err); }
        setIsLoading(false);
    }

    const handleEdit = async (id, updatedPurchase) => {
        const item = compras.find(c => c.id === id);
        if(!item) return;
        setIsLoading(true);
        const updatedRow = [updatedPurchase.nome, '', '', updatedPurchase.preco, '', updatedPurchase.fornecedor, '', '', '', '', updatedPurchase.status, id];
        try {
            const range = `${config.sheetName}!A${item.rowIndex}:L${item.rowIndex}`;
            await gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: config.spreadsheetId, range: range,
                valueInputOption: 'USER_ENTERED', resource: { values: [updatedRow] },
            });
            await fetchSheetData();
            setIsEditModalOpen(false);
        } catch(err) { setError("Falha ao editar a compra."); console.error(err); }
        setIsLoading(false);
    }

     const handleDelete = async (id) => {
        const item = compras.find(c => c.id === id);
        if(!item) return;
        setIsLoading(true);
        try {
            const sheetInfo = await gapi.client.sheets.spreadsheets.get({ spreadsheetId: config.spreadsheetId });
            const sheet = sheetInfo.result.sheets.find(s => s.properties.title === config.sheetName);
            if (!sheet) throw new Error("Aba da planilha não encontrada.");
            const sheetId = sheet.properties.sheetId;

            await gapi.client.sheets.spreadsheets.batchUpdate({
                spreadsheetId: config.spreadsheetId,
                resource: { requests: [{ deleteDimension: { range: { sheetId: sheetId,
                                                                     dimension: 'ROWS', 
                                                                     startIndex: item.rowIndex - 1, 
                                                                     endIndex: item.rowIndex } } }] }
            });
            await fetchSheetData();
            setIsDeleteModalOpen(false);
        } catch(err) { setError("Falha ao deletar a compra."); console.error(err); }
        setIsLoading(false);
    };
    
    return (
        <div className="bg-gray-50 min-h-screen font-sans text-gray-800">
            {isConfigModalOpen && <ConfigModal onSave={handleConfigSave} onLogin={handleLogin} config={config} />}
            
            {!isConfigModalOpen && isLoggedIn && (
                 <div className="container mx-auto p-4 md:p-8">
                    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Dashboard de Compras</h1>
                        <button onClick={() => setIsAddModalOpen(true)} className="mt-4 sm:mt-0 flex items-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700">
                            <PlusCircleIcon className="h-5 w-5" /> Adicionar Compra
                        </button>
                    </header>

                    {error && <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded-md" role="alert"><p className="font-bold">Aviso:</p><p>{error}</p></div>}
                    
                    {isLoading ? <p className="text-center p-8">Sincronizando com a planilha...</p> : (
                        <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50"><tr><th className="p-4 font-semibold text-sm">Produto</th><th className="p-4">Fornecedor</th><th className="p-4">Preço</th><th className="p-4">Status</th><th className="p-4 text-center">Ações</th></tr></thead>
                                <tbody>
                                    {compras.length > 0 ? (
                                        compras.map(compra => (
                                            <tr key={compra.id || compra.rowIndex} className="border-b last:border-0 hover:bg-gray-50">
                                                <td className="p-4 font-medium">{compra.nome}</td>
                                                <td className="p-4">{compra.fornecedor}</td>
                                                <td className="p-4">{(compra.preco || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                                <td className="p-4">{compra.status}</td>
                                                <td className="p-4 text-center"><div className="flex justify-center gap-2">
                                                    <button onClick={() => { setCurrentPurchase(compra); setIsEditModalOpen(true); }} className="text-blue-600 hover:text-blue-800" title="Editar"><PencilIcon className="h-5 w-5" /></button>
                                                    <button onClick={() => { setCurrentPurchase(compra); setIsDeleteModalOpen(true); }} className="text-red-600 hover:text-red-800" title="Excluir"><TrashIcon className="h-5 w-5" /></button>
                                                </div></td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="5" className="text-center p-8 text-gray-500">Nenhum dado para exibir.</td></tr>
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

function ConfigModal({ onSave, onLogin, config }) {
    const [localConfig, setLocalConfig] = useState(config);
    const handleChange = (e) => setLocalConfig(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleSave = () => onSave(localConfig);
    
    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
                <div className="p-6"><h3 className="text-2xl font-bold text-center">Conectar com Google Sheets</h3></div>
                <div className="p-6 space-y-4">
                     <div className="text-sm p-3 bg-blue-50 border rounded-lg">
                        <p className="font-semibold">Instruções:</p>
                        <ol className="list-decimal list-inside mt-2 space-y-1">
                            <li>Crie um "ID do cliente OAuth 2.0" no <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud Console</a>.</li>
                            <li>Em "Origens JavaScript autorizadas", adicione o endereço do seu site Vercel.</li>
                            <li><strong>Importante:</strong> Adicione uma coluna `ID_UNICO` na sua planilha (ex: na coluna L).</li>
                        </ol>
                    </div>
                    <div><label className="block text-sm font-medium">Client ID do Google*</label><input type="text" name="clientId" value={localConfig.clientId} onChange={handleChange} onBlur={handleSave} className="w-full px-3 py-2 border rounded-lg"/></div>
                    <div><label className="block text-sm font-medium">ID da Planilha Google*</label><input type="text" name="spreadsheetId" value={localConfig.spreadsheetId} onChange={handleChange} onBlur={handleSave} className="w-full px-3 py-2 border rounded-lg"/></div>
                    <div><label className="block text-sm font-medium">Nome da Aba (ex: Junho/2025)*</label><input type="text" name="sheetName" value={localConfig.sheetName} onChange={handleChange} onBlur={handleSave} className="w-full px-3 py-2 border rounded-lg"/></div>
                </div>
                 <div className="p-6">
                    <button onClick={onLogin} disabled={!localConfig.clientId || !localConfig.spreadsheetId} className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg disabled:bg-gray-400">
                        <GoogleIcon /> Conectar e Sincronizar
                    </button>
                </div>
            </div>
        </div>
    );
}

function AddEditForm({ isEditMode=false, purchase, onCancel, onSubmit }) {
     const [formState, setFormState] = useState({ nome: '', fornecedor: '', preco: '', status: 'Orçamento' });
    
    useEffect(() => {
        if (isEditMode && purchase) setFormState(purchase);
    }, [isEditMode, purchase]);

    const handleChange = (e) => setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditMode) onSubmit(purchase.id, formState);
        else onSubmit(formState);
    };
    
    return (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
             <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
                 <div className="p-6 border-b flex justify-between items-center"><h3 className="text-xl font-semibold">{isEditMode ? 'Editar' : 'Adicionar'} Compra</h3><button type="button" onClick={onCancel}><XIcon className="h-6 w-6" /></button></div>
                 <div className="p-6 space-y-4">
                    <div><label className="block text-sm font-medium">Nome*</label><input type="text" name="nome" value={formState.nome} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg"/></div>
                    <div><label className="block text-sm font-medium">Fornecedor</label><input type="text" name="fornecedor" value={formState.fornecedor} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg"/></div>
                    <div><label className="block text-sm font-medium">Preço*</label><input type="number" step="0.01" name="preco" value={formState.preco} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg"/></div>
                    <div><label className="block text-sm font-medium">Status</label><select name="status" value={formState.status} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg bg-white"><option>Orçamento</option><option>Pendente</option><option>Comprado</option></select></div>
                 </div>
                <div className="p-4 bg-gray-50 flex justify-end gap-3 rounded-b-xl"><button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded-lg">Cancelar</button><button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg">Salvar na Planilha</button></div>
             </form>
         </div>
    );
}

function DeleteConfirmationModal({ onConfirm, onCancel, purchaseName }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
                <div className="p-6 text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100"><TrashIcon className="h-6 w-6 text-red-600" /></div>
                    <h3 className="text-lg font-medium text-gray-900 mt-4">Excluir Registro</h3>
                    <div className="mt-2 px-7 py-3"><p className="text-sm text-gray-500">Tem certeza que deseja excluir <span className="font-bold">"{purchaseName}"</span>? Esta ação pode não funcionar corretamente em todas as situações.</p></div>
                </div>
                <div className="p-4 bg-gray-50 flex justify-center gap-3 rounded-b-xl"><button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded-lg w-full">Cancelar</button><button type="button" onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg w-full">Excluir</button></div>
            </div>
        </div>
    );
}
