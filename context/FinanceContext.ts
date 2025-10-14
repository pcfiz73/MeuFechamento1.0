import { createContext } from 'react';
import type { FinanceData, ModalState, Page, Receita, Despesa, Banco, Objetivo, Metas, NewReceitaData, NewDespesaData, NewBancoData, NewObjetivoData } from '../types';

export interface FinanceContextType {
    financeData: FinanceData;
    loading: boolean;
    modalState: ModalState;
    openModal: (type: ModalState['type'], data?: any) => void;
    closeModal: () => void;
    activePage: Page;
    pageContext: any;
    navigate: (page: Page, context?: any) => void;
    
    // Funções de manipulação de dados
    addReceita: (receita: NewReceitaData) => Promise<void>;
    updateReceita: (receita: Receita) => Promise<void>;
    deleteReceita: (id: number) => Promise<void>;
    
    addDespesa: (despesa: NewDespesaData) => Promise<void>;
    updateDespesa: (despesa: Despesa) => Promise<void>;
    deleteDespesa: (id: number) => Promise<void>;

    addBanco: (banco: NewBancoData) => Promise<void>;
    updateBanco: (banco: Banco) => Promise<void>;
    deleteBanco: (id: number) => Promise<void>;

    addObjetivo: (objetivo: NewObjetivoData) => Promise<void>;
    updateObjetivo: (objetivo: Objetivo) => Promise<void>;
    deleteObjetivo: (id: number) => Promise<void>;
    
    updateMetas: (metas: Metas) => Promise<void>;

    transferirSaldo: (origemId: number, destinoId: number, valor: number) => Promise<void>;
    addSaldoBanco: (bancoId: number, valor: number) => Promise<void>;
}

export const FinanceContext = createContext<FinanceContextType>(null!);