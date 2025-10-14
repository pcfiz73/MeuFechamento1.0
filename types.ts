export interface Receita {
  id: number;
  descricao: string;
  valor: number;
  categoria: string;
  data: string;
  observacoes: string;
  banco_id: number;
  parcelamento?: string;
}

export interface Despesa {
  id: number;
  descricao: string;
  valor: number;
  categoria: string;
  data: string;
  observacoes: string;
  banco_id: number;
  parcelamento?: string;
}

export interface Metas {
  id: number;
  diaria: number;
  semanal: number;
  mensal: number;
}

export interface Objetivo {
  id: number;
  titulo: string;
  meta_valor: number;
  valor_atual: number;
  data_limite: string;
}

export interface Banco {
  id: number;
  nome: string;
  conta: string;
  saldo: number;
}

export interface FinanceData {
  receitas: Receita[];
  despesas: Despesa[];
  metas: Metas;
  objetivos: Objetivo[];
  bancos: Banco[];
}

export type Period = 'hoje' | 'semana' | 'mes';

export type Tab = 'resumo' | 'receitas' | 'despesas' | 'bancos' | 'objetivos' | 'relatorios';

export type Page = 'dashboard' | 'add' | 'reports' | 'goals';

export interface ModalState {
  type: 'receita' | 'despesa' | 'banco' | 'objetivo' | 'transferencia' | 'meta' | null;
  data?: any;
}

// Tipos para criação de novos registros, sem o 'id'
export type NewReceitaData = Omit<Receita, 'id' | 'categoria'> & { categoria?: string };
export type NewDespesaData = Omit<Despesa, 'id' | 'descricao'>;
export type NewBancoData = Omit<Banco, 'id'>;
export type NewObjetivoData = Omit<Objetivo, 'id'>;