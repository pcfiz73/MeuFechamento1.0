
export interface Receita {
  id: number;
  descricao: string;
  valor: number;
  categoria: string;
  data: string;
  observacoes: string;
  bancoId: number;
}

export interface Despesa {
  id: number;
  descricao: string;
  valor: number;
  categoria: string;
  data: string;
  observacoes: string;
  bancoId: number;
}

export interface Metas {
  diaria: number;
  semanal: number;
  mensal: number;
}

export interface Objetivo {
  id: number;
  titulo: string;
  metaValor: number;
  valorAtual: number;
  dataLimite: string;
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