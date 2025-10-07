import { createContext } from 'react';
import type { FinanceData, ModalState, Page } from '../types';

export interface FinanceContextType {
    financeData: FinanceData;
    updateFinanceData: (updater: (prev: FinanceData) => FinanceData) => void;
    modalState: ModalState;
    openModal: (type: ModalState['type'], data?: any) => void;
    closeModal: () => void;
    activePage: Page;
    pageContext: any;
    navigate: (page: Page, context?: any) => void;
}

// FIX: Replaced the complex default object with null! to prevent potential TypeScript inference issues in consuming components.
// This is a common pattern for contexts that are guaranteed to be provided higher up in the component tree.
export const FinanceContext = createContext<FinanceContextType>(null!);
