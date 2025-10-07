import type { FinanceData } from './types';

export const initialFinanceData: FinanceData = {
    receitas: [
        { id: 1, descricao: 'iFood', valor: 45.50, categoria: 'delivery', data: new Date(Date.now() - 0 * 86400000).toISOString().split('T')[0], observacoes: '', bancoId: 1 },
        { id: 2, descricao: 'Uber Eats', valor: 38.20, categoria: 'delivery', data: new Date(Date.now() - 0 * 86400000).toISOString().split('T')[0], observacoes: '', bancoId: 1 },
        { id: 3, descricao: 'Rappi', valor: 32.00, categoria: 'delivery', data: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0], observacoes: '', bancoId: 2 },
        { id: 4, descricao: 'Freelance', valor: 150.00, categoria: 'freelance', data: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0], observacoes: '', bancoId: 2 },
        { id: 5, descricao: 'iFood', valor: 28.50, categoria: 'delivery', data: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0], observacoes: '', bancoId: 3 }
    ],
    despesas: [
        { id: 1, descricao: 'Combustível', valor: 25.00, categoria: 'combustivel', data: new Date(Date.now() - 0 * 86400000).toISOString().split('T')[0], observacoes: '', bancoId: 1 },
        { id: 2, descricao: 'Almoço', valor: 15.00, categoria: 'alimentacao', data: new Date(Date.now() - 0 * 86400000).toISOString().split('T')[0], observacoes: '', bancoId: 1 },
        { id: 3, descricao: 'Manutenção', valor: 80.00, categoria: 'manutencao', data: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0], observacoes: '', bancoId: 2 }
    ],
    metas: {
        diaria: 120.00,
        semanal: 840.00,
        mensal: 3600.00
    },
    objetivos: [
        { id: 1, titulo: 'Moto Nova', metaValor: 15000, valorAtual: 1200, dataLimite: '2025-12-31' },
        { id: 2, titulo: 'Capacete', metaValor: 300, valorAtual: 280, dataLimite: '2024-10-31' },
    ],
    bancos: [
        { id: 1, nome: 'Nubank', conta: '1234-5', saldo: 1500.00 },
        { id: 2, nome: 'Itaú', conta: '6789-0', saldo: 3200.00 },
        { id: 3, nome: 'Bradesco', conta: '2468-1', saldo: 800.00 }
    ]
};
