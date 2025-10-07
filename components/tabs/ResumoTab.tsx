
import React, { useState, useMemo } from 'react';
import Card from '../Card';
import { formatCurrency, formatDate, filterDataByPeriod } from '../../utils';
import type { FinanceData, Period, Receita, Despesa } from '../../types';

interface ResumoTabProps {
    financeData: FinanceData;
    onOpenModal: (type: 'meta') => void;
}

const StatCard: React.FC<{ icon: string; title: string; value: string; color: string }> = ({ icon, title, value, color }) => (
    <Card className="flex items-center gap-4">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl ${color}`}>
            <i className={`fas ${icon}`}></i>
        </div>
        <div>
            <h3 className="text-slate-500 font-medium">{title}</h3>
            <div className="text-2xl font-bold text-slate-800">{value}</div>
        </div>
    </Card>
);

const TransactionItem: React.FC<{ transaction: (Receita & { type: 'receita' }) | (Despesa & { type: 'despesa' }) }> = ({ transaction }) => {
    const isIncome = transaction.type === 'receita';
    return (
        <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-b-0">
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${isIncome ? 'bg-green-500' : 'bg-red-500'}`}>
                    <i className={`fas ${isIncome ? 'fa-plus' : 'fa-minus'}`}></i>
                </div>
                <div>
                    <div className="font-medium text-slate-700">{transaction.descricao}</div>
                    <div className="text-sm text-slate-400">{formatDate(transaction.data)}</div>
                </div>
            </div>
            <div className={`font-bold text-lg ${isIncome ? 'text-green-500' : 'text-red-500'}`}>
                {isIncome ? '+' : '-'}{formatCurrency(transaction.valor)}
            </div>
        </div>
    );
};

const ResumoTab: React.FC<ResumoTabProps> = ({ financeData, onOpenModal }) => {
    const [period, setPeriod] = useState<Period>('hoje');

    const filteredData = useMemo(() => {
        const receitas = filterDataByPeriod(financeData.receitas, period);
        const despesas = filterDataByPeriod(financeData.despesas, period);
        return { receitas, despesas };
    }, [financeData, period]);

    const totalReceitas = useMemo(() => filteredData.receitas.reduce((sum, item) => sum + item.valor, 0), [filteredData.receitas]);
    const totalDespesas = useMemo(() => filteredData.despesas.reduce((sum, item) => sum + item.valor, 0), [filteredData.despesas]);
    const saldo = totalReceitas - totalDespesas;

    const metaAtual = useMemo(() => {
        if (period === 'hoje') return financeData.metas.diaria;
        if (period === 'semana') return financeData.metas.semanal;
        return financeData.metas.mensal;
    }, [period, financeData.metas]);
    
    const metaPercentual = metaAtual > 0 ? Math.round((totalReceitas / metaAtual) * 100) : 0;

    const progressStatus = useMemo(() => {
        if (metaPercentual >= 100) return { text: 'Meta atingida!', color: 'text-green-500' };
        if (metaPercentual >= 75) return { text: 'Quase lá!', color: 'text-amber-500' };
        return { text: 'Precisa melhorar', color: 'text-red-500' };
    }, [metaPercentual]);

    const recentTransactions = useMemo(() => {
        const all = [
            ...filteredData.receitas.map(r => ({ ...r, type: 'receita' as const })),
            ...filteredData.despesas.map(d => ({ ...d, type: 'despesa' as const }))
        ];
        return all.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()).slice(0, 5);
    }, [filteredData]);

    return (
        <div className="animate-fade-in space-y-6">
            <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200 flex space-x-2">
                {(['hoje', 'semana', 'mes'] as Period[]).map((p) => (
                    <button
                        key={p}
                        onClick={() => setPeriod(p)}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-colors duration-300 ${
                            period === p ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:bg-slate-100'
                        }`}
                    >
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon="fa-arrow-up" title="Receitas" value={formatCurrency(totalReceitas)} color="bg-gradient-to-br from-green-500 to-green-600" />
                <StatCard icon="fa-arrow-down" title="Despesas" value={formatCurrency(totalDespesas)} color="bg-gradient-to-br from-red-500 to-red-600" />
                <StatCard icon="fa-wallet" title="Saldo" value={formatCurrency(saldo)} color="bg-gradient-to-br from-blue-500 to-blue-700" />
                <StatCard icon="fa-bullseye" title="Meta Receita" value={`${metaPercentual}%`} color="bg-gradient-to-br from-amber-500 to-amber-600" />
            </div>

            <Card>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-bold text-slate-800">Progresso da Meta de Receita</h3>
                    <span className={`font-semibold ${progressStatus.color}`}>{progressStatus.text}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3 mb-2">
                    <div className="bg-green-500 h-3 rounded-full transition-all duration-500" style={{ width: `${Math.min(metaPercentual, 100)}%` }}></div>
                </div>
                <div className="flex justify-between text-sm text-slate-500">
                    <span>Atual: {formatCurrency(totalReceitas)}</span>
                    <button onClick={() => onOpenModal('meta')} className="hover:text-blue-600 font-medium">
                        Meta: {formatCurrency(metaAtual)}
                    </button>
                </div>
            </Card>

            <Card>
                <h3 className="text-lg font-bold text-slate-800 mb-4">Transações Recentes</h3>
                {recentTransactions.length > 0 ? (
                    <div>
                        {recentTransactions.map(t => <TransactionItem key={`${t.type}-${t.id}`} transaction={t} />)}
                    </div>
                ) : (
                    <p className="text-center text-slate-500 py-8">Nenhuma transação neste período.</p>
                )}
            </Card>

            {/* Fix: Removed `jsx` prop from style tag as it's not a valid attribute in standard React with TypeScript. */}
            <style>{`
            @keyframes fade-in {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in {
                animation: fade-in 0.3s ease-out forwards;
            }
            `}</style>
        </div>
    );
};

export default ResumoTab;