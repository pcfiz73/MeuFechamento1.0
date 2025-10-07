
import React, { useState, useCallback } from 'react';
import type { FinanceData, Banco, Objetivo, Metas, ModalState, Page } from './types';
import { FinanceContext } from './context/FinanceContext';
import { initialFinanceData } from './data';

import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import AddPage from './pages/AddPage';
import ReportsPage from './pages/ReportsPage';
import GoalsPage from './pages/GoalsPage';

import BancoModal from './components/modals/BancoModal';
import ObjetivoModal from './components/modals/ObjetivoModal';
import TransferenciaModal from './components/modals/TransferenciaModal';
import MetaModal from './components/modals/MetaModal';

// FIX: Removed React.FC type from the component definition. This is a modern best practice and can help avoid subtle type inference issues.
const App = () => {
    const [financeData, setFinanceData] = useState<FinanceData>(initialFinanceData);
    const [modalState, setModalState] = useState<ModalState>({ type: null });
    const [activePage, setActivePage] = useState<Page>('dashboard');
    const [pageContext, setPageContext] = useState<any>(null);

    const updateFinanceData = useCallback((updater: (prev: FinanceData) => FinanceData) => {
        setFinanceData(updater);
    }, []);

    const openModal = (type: ModalState['type'], data?: any) => setModalState({ type, data });
    const closeModal = () => setModalState({ type: null });

    const navigate = (page: Page, context: any = null) => {
        setPageContext(context);
        setActivePage(page);
        window.scrollTo(0, 0); // Scroll to top on page change
    };
    
    const contextValue = {
        financeData,
        updateFinanceData,
        modalState,
        openModal,
        closeModal,
        activePage,
        pageContext,
        navigate,
    };

    const renderPage = () => {
        switch (activePage) {
            case 'dashboard':
                return <DashboardPage />;
            case 'add':
                return <AddPage />;
            case 'reports':
                return <ReportsPage />;
            case 'goals':
                return <GoalsPage />;
            default:
                return <DashboardPage />;
        }
    };

    return (
        <FinanceContext.Provider value={contextValue}>
            {/* FIX: Moved modal components outside of Layout. Modals should be at the top level to ensure correct stacking context. */}
            <Layout>{renderPage()}</Layout>
            
            <BancoModal
                isOpen={modalState.type === 'banco'}
                onClose={closeModal}
                banco={modalState.data as Banco | undefined}
                updateFinanceData={updateFinanceData}
            />
            <ObjetivoModal
                isOpen={modalState.type === 'objetivo'}
                onClose={closeModal}
                objetivo={modalState.data as Objetivo | undefined}
                updateFinanceData={updateFinanceData}
            />
            <TransferenciaModal
                isOpen={modalState.type === 'transferencia'}
                onClose={closeModal}
                bancos={financeData.bancos}
                origemId={modalState.data?.origemId}
                updateFinanceData={updateFinanceData}
            />
            <MetaModal
                isOpen={modalState.type === 'meta'}
                onClose={closeModal}
                metas={financeData.metas}
                updateFinanceData={updateFinanceData}
            />
        </FinanceContext.Provider>
    );
};

export default App;