

import React, { useState, useCallback, useEffect } from 'react';
import type { FinanceData, Banco, Objetivo, Metas, ModalState, Page, Receita, Despesa } from './types';
import { FinanceContext } from './context/FinanceContext';
import { supabase } from './utils';

import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import AddPage from './pages/AddPage';
import ReportsPage from './pages/ReportsPage';
import GoalsPage from './pages/GoalsPage';

import BancoModal from './components/modals/BancoModal';
import ObjetivoModal from './components/modals/ObjetivoModal';
import TransferenciaModal from './components/modals/TransferenciaModal';
import MetaModal from './components/modals/MetaModal';

const App = () => {
    const [financeData, setFinanceData] = useState<FinanceData>({
        receitas: [],
        despesas: [],
        // FIX: Add id to initial metas state to match the Metas type.
        metas: { id: 1, diaria: 0, semanal: 0, mensal: 0 },
        objetivos: [],
        bancos: [],
    });
    const [loading, setLoading] = useState(true);
    const [modalState, setModalState] = useState<ModalState>({ type: null });
    const [activePage, setActivePage] = useState<Page>('dashboard');
    const [pageContext, setPageContext] = useState<any>(null);
    
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [receitasRes, despesasRes, metasRes, objetivosRes, bancosRes] = await Promise.all([
                    supabase.from('receitas').select('*'),
                    supabase.from('despesas').select('*'),
                    supabase.from('metas').select('*').limit(1).single(),
                    supabase.from('objetivos').select('*'),
                    supabase.from('bancos').select('*')
                ]);

                if (receitasRes.error) throw receitasRes.error;
                if (despesasRes.error) throw despesasRes.error;
                if (metasRes.error) throw metasRes.error;
                if (objetivosRes.error) throw objetivosRes.error;
                if (bancosRes.error) throw bancosRes.error;

                setFinanceData({
                    receitas: receitasRes.data || [],
                    despesas: despesasRes.data || [],
                    metas: metasRes.data || { id: 1, diaria: 120, semanal: 840, mensal: 3600 },
                    objetivos: objetivosRes.data || [],
                    bancos: bancosRes.data || [],
                });
            } catch (error) {
                console.error("Erro ao buscar dados do Supabase:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // FIX: Define updateFinanceData to manage state changes from child components.
    const updateFinanceData = (updater: (prev: FinanceData) => FinanceData) => {
        setFinanceData(updater);
    };

    const openModal = (type: ModalState['type'], data?: any) => setModalState({ type, data });
    const closeModal = () => setModalState({ type: null });

    const navigate = (page: Page, context: any = null) => {
        setPageContext(context);
        setActivePage(page);
        window.scrollTo(0, 0);
    };
    
     const contextValue = {
        financeData,
        loading,
        modalState,
        openModal,
        closeModal,
        activePage,
        pageContext,
        navigate,
        // FIX: Provide updateFinanceData through context.
        updateFinanceData,
    };

    const renderPage = () => {
        switch (activePage) {
            case 'dashboard': return <DashboardPage />;
            case 'add': return <AddPage />;
            case 'reports': return <ReportsPage />;
            case 'goals': return <GoalsPage />;
            default: return <DashboardPage />;
        }
    };
    
    if (loading) {
        return (
            <div className="fixed inset-0 bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-600 font-semibold">Carregando dados...</p>
                </div>
            </div>
        );
    }

    return (
        <FinanceContext.Provider value={contextValue}>
            <Layout>{renderPage()}</Layout>
            
            <BancoModal
                isOpen={modalState.type === 'banco'}
                onClose={closeModal}
                banco={modalState.data as Banco | undefined}
                // FIX: Pass updateFinanceData prop to resolve component requirement.
                updateFinanceData={updateFinanceData}
            />
            <ObjetivoModal
                isOpen={modalState.type === 'objetivo'}
                onClose={closeModal}
                objetivo={modalState.data as Objetivo | undefined}
                // FIX: Pass updateFinanceData prop to resolve component requirement.
                updateFinanceData={updateFinanceData}
            />
            <TransferenciaModal
                isOpen={modalState.type === 'transferencia'}
                onClose={closeModal}
                bancos={financeData.bancos}
                origemId={modalState.data?.origemId}
                // FIX: Pass updateFinanceData prop to resolve component requirement.
                updateFinanceData={updateFinanceData}
            />
            <MetaModal
                isOpen={modalState.type === 'meta'}
                onClose={closeModal}
                metas={financeData.metas}
                // FIX: Pass updateFinanceData prop to resolve component requirement.
                updateFinanceData={updateFinanceData}
            />
        </FinanceContext.Provider>
    );
};

export default App;