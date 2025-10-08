

import { createContext } from 'react';
import type { FinanceData, ModalState, Page } from '../types';

export interface FinanceContextType {
    financeData: FinanceData;
    loading: boolean;
    modalState: ModalState;
    openModal: (type: ModalState['type'], data?: any) => void;
    closeModal: () => void;
    activePage: Page;
    pageContext: any;
    navigate: (page: Page, context?: any) => void;
    // FIX: Add updateFinanceData to the context type to make it available to consumers.
    updateFinanceData: (updater: (prev: FinanceData) => FinanceData) => void;
}

export const FinanceContext = createContext<FinanceContextType>(null!);