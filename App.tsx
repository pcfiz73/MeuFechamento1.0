import React, { useState, useCallback, useEffect } from 'react';
import type { FinanceData, Banco, Objetivo, Metas, ModalState, Page, Receita, Despesa, NewReceitaData, NewDespesaData, NewBancoData, NewObjetivoData } from './types';
import { FinanceContext } from './context/FinanceContext';
import { supabase } from './utils';
import { DESPESA_CATEGORIAS } from './constants';

import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import AddPage from './pages/AddPage';
import ReportsPage from './pages/ReportsPage';
import GoalsPage from './pages/GoalsPage';

import BancoModal from './components/modals/BancoModal';
import ObjetivoModal from './components/modals/ObjetivoModal';
import TransferenciaModal from './components/modals/TransferenciaModal';
import MetaModal from './components/modals/MetaModal';
import ReceitaModal from './components/modals/ReceitaModal';
import DespesaModal from './components/modals/DespesaModal';

const App = () => {
    const [financeData, setFinanceData] = useState<FinanceData>({
        receitas: [],
        despesas: [],
        metas: { id: 1, diaria: 0, semanal: 0, mensal: 0 },
        objetivos: [],
        bancos: [],
    });
    const [loading, setLoading] = useState(true);
    const [modalState, setModalState] = useState<ModalState>({ type: null });
    const [activePage, setActivePage] = useState<Page>('dashboard');
    const [pageContext, setPageContext] = useState<any>(null);
    
    const fetchData = useCallback(async () => {
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
    }, []);
    
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // =================================================================
    // DATA MANIPULATION FUNCTIONS (CRUD)
    // =================================================================

    // Receitas
    const addReceita = async (receita: NewReceitaData) => {
        const banco = financeData.bancos.find(b => b.id === receita.banco_id);
        if (!banco) throw new Error("Banco não encontrado");
        
        const novoSaldo = banco.saldo + receita.valor;
        await supabase.from('bancos').update({ saldo: novoSaldo }).eq('id', receita.banco_id);

        const { data, error } = await supabase.from('receitas').insert({ ...receita, categoria: 'delivery' }).select().single();
        if (error) {
            await supabase.from('bancos').update({ saldo: banco.saldo }).eq('id', receita.banco_id); // Rollback
            throw error;
        }
        await fetchData(); // Refresh data from source
    };
    
    const updateReceita = async (updatedReceita: Receita) => {
        const originalReceita = financeData.receitas.find(r => r.id === updatedReceita.id);
        if (!originalReceita) throw new Error("Receita original não encontrada");
    
        const oldBanco = financeData.bancos.find(b => b.id === originalReceita.banco_id);
        const newBanco = financeData.bancos.find(b => b.id === updatedReceita.banco_id);
    
        // This should ideally be a single database transaction
        if (originalReceita.banco_id === updatedReceita.banco_id) {
            if (oldBanco) {
                const valorDelta = updatedReceita.valor - originalReceita.valor;
                await supabase.from('bancos').update({ saldo: oldBanco.saldo + valorDelta }).eq('id', oldBanco.id);
            }
        } else {
            if (oldBanco) {
                await supabase.from('bancos').update({ saldo: oldBanco.saldo - originalReceita.valor }).eq('id', oldBanco.id);
            }
            if (newBanco) {
                await supabase.from('bancos').update({ saldo: newBanco.saldo + updatedReceita.valor }).eq('id', newBanco.id);
            }
        }
        
        await supabase.from('receitas').update(updatedReceita).eq('id', updatedReceita.id);
        
        await fetchData(); // Refresh data to ensure consistency
    };

    const deleteReceita = async (id: number) => {
        const receitaToDelete = financeData.receitas.find(r => r.id === id);
        if (!receitaToDelete) throw new Error("Receita não encontrada");

        // First, update the bank balance
        const banco = financeData.bancos.find(b => b.id === receitaToDelete.banco_id);
        if (banco) {
            await supabase.from('bancos').update({ saldo: banco.saldo - receitaToDelete.valor }).eq('id', banco.id);
        }

        // Then, delete the transaction
        await supabase.from('receitas').delete().eq('id', id);
        
        // Finally, refresh all data to ensure UI consistency
        await fetchData();
    };

    // Despesas
    const addDespesa = async (despesa: NewDespesaData) => {
        const banco = financeData.bancos.find(b => b.id === despesa.banco_id);
        if (!banco || banco.saldo < despesa.valor) throw new Error("Saldo insuficiente");

        const novoSaldo = banco.saldo - despesa.valor;
        await supabase.from('bancos').update({ saldo: novoSaldo }).eq('id', despesa.banco_id);

        const { error } = await supabase.from('despesas').insert({ ...despesa, descricao: DESPESA_CATEGORIAS.find(c => c.value === despesa.categoria)?.label || 'Outros' }).select().single();
        if (error) {
            await supabase.from('bancos').update({ saldo: banco.saldo }).eq('id', despesa.banco_id); // Rollback
            throw error;
        }
        await fetchData(); // Refresh data
    };
    
    const updateDespesa = async (updatedDespesa: Despesa) => {
        const originalDespesa = financeData.despesas.find(d => d.id === updatedDespesa.id);
        if (!originalDespesa) throw new Error("Despesa original não encontrada");

        const oldBanco = financeData.bancos.find(b => b.id === originalDespesa.banco_id);
        const newBanco = financeData.bancos.find(b => b.id === updatedDespesa.banco_id);

        // This should ideally be a single database transaction
        if (updatedDespesa.banco_id === originalDespesa.banco_id) {
            if (oldBanco) {
                const valorDelta = originalDespesa.valor - updatedDespesa.valor; // Inverse of receita
                await supabase.from('bancos').update({ saldo: oldBanco.saldo + valorDelta }).eq('id', oldBanco.id);
            }
        } else {
            if (oldBanco) {
                await supabase.from('bancos').update({ saldo: oldBanco.saldo + originalDespesa.valor }).eq('id', oldBanco.id);
            }
            if (newBanco) {
                await supabase.from('bancos').update({ saldo: newBanco.saldo - updatedDespesa.valor }).eq('id', newBanco.id);
            }
        }
        
        await supabase.from('despesas').update(updatedDespesa).eq('id', updatedDespesa.id);
        
        await fetchData(); // Refresh data
    };
    
    const deleteDespesa = async (id: number) => {
        const despesaToDelete = financeData.despesas.find(d => d.id === id);
        if (!despesaToDelete) throw new Error("Despesa não encontrada");

        // First, update the bank balance
        const banco = financeData.bancos.find(b => b.id === despesaToDelete.banco_id);
        if (banco) {
            await supabase.from('bancos').update({ saldo: banco.saldo + despesaToDelete.valor }).eq('id', banco.id);
        }

        // Then, delete the transaction
        await supabase.from('despesas').delete().eq('id', id);
        
        // Finally, refresh all data to ensure UI consistency
        await fetchData();
    };

    // Bancos
    const addBanco = async (banco: NewBancoData) => {
        await supabase.from('bancos').insert(banco);
        await fetchData();
    };

    const updateBanco = async (banco: Banco) => {
        await supabase.from('bancos').update(banco).eq('id', banco.id);
        await fetchData();
    };

    const deleteBanco = async (id: number) => {
        const hasTransactions = financeData.receitas.some(r => r.banco_id === id) || financeData.despesas.some(d => d.banco_id === id);
        if (hasTransactions) throw new Error('Não é possível excluir um banco com transações associadas.');
        await supabase.from('bancos').delete().eq('id', id);
        await fetchData();
    };
    
    // Objetivos
    const addObjetivo = async (objetivo: NewObjetivoData) => {
        await supabase.from('objetivos').insert(objetivo);
        await fetchData();
    };

    const updateObjetivo = async (objetivo: Objetivo) => {
        await supabase.from('objetivos').update(objetivo).eq('id', objetivo.id);
        await fetchData();
    };
    
    const deleteObjetivo = async (id: number) => {
        await supabase.from('objetivos').delete().eq('id', id);
        await fetchData();
    };

    // Metas
    const updateMetas = async (metas: Metas) => {
        await supabase.from('metas').update(metas).eq('id', metas.id);
        await fetchData();
    };

    // Outras Ações
    const transferirSaldo = async (origemId: number, destinoId: number, valor: number) => {
        const bancoOrigem = financeData.bancos.find(b => b.id === origemId);
        const bancoDestino = financeData.bancos.find(b => b.id === destinoId);

        if (!bancoOrigem || !bancoDestino || bancoOrigem.saldo < valor) throw new Error("Transferência inválida");
        
        await supabase.from('bancos').update({ saldo: bancoOrigem.saldo - valor }).eq('id', origemId);
        await supabase.from('bancos').update({ saldo: bancoDestino.saldo + valor }).eq('id', destinoId);
        
        await fetchData();
    };
    
    const addSaldoBanco = async (bancoId: number, valor: number) => {
        const banco = financeData.bancos.find(b => b.id === bancoId);
        if (!banco) throw new Error("Banco não encontrado");
        await supabase.from('bancos').update({ saldo: banco.saldo + valor }).eq('id', bancoId);
        await fetchData();
    };


    // =================================================================
    // NAVIGATION & MODALS
    // =================================================================
    const openModal = (type: ModalState['type'], data?: any) => setModalState({ type, data });
    const closeModal = () => setModalState({ type: null });

    const navigate = (page: Page, context: any = null) => {
        setPageContext(context);
        setActivePage(page);
        window.scrollTo(0, 0);
    };
    
    const contextValue = {
        financeData, loading, modalState, openModal, closeModal,
        activePage, pageContext, navigate,
        addReceita, updateReceita, deleteReceita,
        addDespesa, updateDespesa, deleteDespesa,
        addBanco, updateBanco, deleteBanco,
        addObjetivo, updateObjetivo, deleteObjetivo,
        updateMetas, transferirSaldo, addSaldoBanco
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
            
            <ReceitaModal
                isOpen={modalState.type === 'receita'}
                onClose={closeModal}
                receita={modalState.data as Receita | undefined}
                bancos={financeData.bancos}
            />
            <DespesaModal
                isOpen={modalState.type === 'despesa'}
                onClose={closeModal}
                despesa={modalState.data as Despesa | undefined}
                bancos={financeData.bancos}
            />
            <BancoModal
                isOpen={modalState.type === 'banco'}
                onClose={closeModal}
                banco={modalState.data as Banco | undefined}
            />
            <ObjetivoModal
                isOpen={modalState.type === 'objetivo'}
                onClose={closeModal}
                objetivo={modalState.data as Objetivo | undefined}
            />
            <TransferenciaModal
                isOpen={modalState.type === 'transferencia'}
                onClose={closeModal}
                bancos={financeData.bancos}
                origemId={modalState.data?.origemId}
            />
            <MetaModal
                isOpen={modalState.type === 'meta'}
                onClose={closeModal}
                metas={financeData.metas}
            />
        </FinanceContext.Provider>
    );
};

export default App;