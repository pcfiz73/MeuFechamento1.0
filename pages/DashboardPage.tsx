import React, { useState, useMemo, useContext } from 'react';
import { FinanceContext } from '../context/FinanceContext';
import { formatCurrency, filterDataByPeriod, formatDate } from '../utils';
import type { Period, Receita, Despesa, Objetivo } from '../types';
import { Plus, Minus, Target, BarChart3, ChevronRight } from 'lucide-react';

const DashboardPage: React.FC = () => {
    const { financeData, navigate } = useContext(FinanceContext);
    const [period, setPeriod] = useState<Period>('hoje');

    const filteredData = useMemo(() => {
        // FIX: Explicitly type the filtered data to resolve property access errors.
        const receitas: Receita[] = filterDataByPeriod(financeData.receitas, period);
        const despesas: Despesa[] = filterDataByPeriod(financeData.despesas, period);
        return { receitas, despesas };
    }, [financeData, period]);

    const totalReceitas = useMemo(() => filteredData.receitas.reduce((sum, item) => sum + item.valor, 0), [filteredData.receitas]);
    const totalDespesas = useMemo(() => filteredData.despesas.reduce((sum, item) => sum + item.valor, 0), [filteredData.despesas]);
    const lucroLiquido = totalReceitas - totalDespesas;

    const recentTransactions = useMemo(() => {
        const all = [
            ...financeData.receitas.map(r => ({ ...r, type: 'receita' as const })),
            ...financeData.despesas.map(d => ({ ...d, type: 'despesa' as const }))
        ];
        // FIX: Add 'T00:00:00' to ensure consistent date parsing for sorting, preventing timezone-related issues that caused new transactions not to appear.
        // Also increased slice from 3 to 5 for better visibility.
        return all.sort((a, b) => new Date(b.data + 'T00:00:00').getTime() - new Date(a.data + 'T00:00:00').getTime()).slice(0, 5);
    }, [financeData]);

    const QuickActionButton: React.FC<{
        icon: React.ReactNode;
        label: string;
        color: string;
        onClick: () => void;
    }> = ({ icon, label, color, onClick }) => (
        <div className="flex flex-col items-center gap-2">
            <button
                onClick={onClick}
                className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-md transition-transform transform hover:-translate-y-1 ${color}`}
            >
                {icon}
            </button>
            <span className="text-sm font-medium text-slate-600 text-center">{label}</span>
        </div>
    );
    
    const GoalItem: React.FC<{ objetivo: Objetivo }> = ({ objetivo }) => {
        const percent = objetivo.meta_valor > 0 ? Math.min(Math.round((objetivo.valor_atual / objetivo.meta_valor) * 100), 100) : 0;
        return (
            <div>
                <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-slate-700 text-sm">{objetivo.titulo}</span>
                    <span className="font-bold text-blue-600 text-sm">{percent}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${percent}%` }}></div>
                </div>
                 <div className="text-xs text-slate-400 mt-1">
                    {formatCurrency(objetivo.valor_atual)} de {formatCurrency(objetivo.meta_valor)}
                </div>
            </div>
        );
    };

     const TransactionItem: React.FC<{ transaction: (Receita & { type: 'receita' }) | (Despesa & { type: 'despesa' }) }> = ({ transaction }) => {
        const isIncome = transaction.type === 'receita';
        return (
            <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${isIncome ? 'bg-green-100' : 'bg-red-100'}`}>
                       {isIncome ? <i className="fas fa-arrow-up text-green-500"></i> : <i className="fas fa-arrow-down text-red-500"></i>}
                    </div>
                    <div>
                        <div className="font-medium text-slate-800">
                            {transaction.descricao}
                            {transaction.parcelamento && (
                                <span className="ml-2 text-xs font-semibold text-blue-500 bg-blue-100 px-2 py-0.5 rounded-full">
                                    {transaction.parcelamento}
                                </span>
                            )}
                        </div>
                        <div className="text-sm text-slate-400">{formatDate(transaction.data)}</div>
                    </div>
                </div>
                <div className={`font-bold text-lg ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                    {isIncome ? '+' : '-'}{formatCurrency(transaction.valor)}
                </div>
            </div>
        );
    };


    return (
        <div className="animate-slide-up bg-slate-50">
            {/* Header */}
            <div className="bg-blue-600 text-white p-6 rounded-b-3xl shadow-lg -mx-4 -mt-4 mb-6">
                <h1 className="text-2xl font-bold text-center">Olá, Entregador! 👋</h1>
                <p className="text-blue-200 text-center">Veja como está seu dia</p>
                <div className="mt-4 bg-blue-700/50 p-1 rounded-xl flex items-center max-w-sm mx-auto">
                     {(['hoje', 'semana', 'mes'] as Period[]).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`flex-1 py-2 px-2 text-sm font-semibold rounded-lg transition-colors duration-300 ${
                                period === p ? 'bg-white text-blue-600 shadow' : 'text-blue-100'
                            }`}
                        >
                            {p === 'hoje' ? 'Hoje' : p === 'semana' ? 'Semana' : 'Este Mês'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-3 mb-2">
                             <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                <i className="fas fa-arrow-up text-green-500"></i>
                            </div>
                            <span className="text-slate-500 font-medium">Ganhos</span>
                        </div>
                        <p className="text-2xl font-bold text-slate-800">{formatCurrency(totalReceitas)}</p>
                        <p className="text-xs text-slate-400">{filteredData.receitas.length} entregas</p>
                    </div>
                     <div className="bg-white p-4 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                                <i className="fas fa-arrow-down text-red-500"></i>
                            </div>
                            <span className="text-slate-500 font-medium">Gastos</span>
                        </div>
                        <p className="text-2xl font-bold text-slate-800">{formatCurrency(totalDespesas)}</p>
                        <p className="text-xs text-slate-400">{filteredData.despesas.length} registros</p>
                    </div>
                </div>

                {/* Net Profit Card */}
                <div className="bg-green-100/60 p-4 rounded-xl border border-green-200 flex items-center justify-between">
                    <div>
                        <span className="text-green-800 font-medium">Lucro Líquido</span>
                        <p className={`text-2xl font-bold ${lucroLiquido >= 0 ? 'text-green-700' : 'text-red-600'}`}>{formatCurrency(lucroLiquido)}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white text-2xl">
                        <i className="fas fa-dollar-sign"></i>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white p-6 rounded-xl border border-slate-200">
                     <h2 className="text-lg font-bold text-slate-800 mb-4">Ações Rápidas</h2>
                     <div className="grid grid-cols-2 gap-y-6 justify-items-center">
                        <QuickActionButton icon={<Plus size={28} />} label="Nova Entrega" color="bg-green-500" onClick={() => navigate('add', { type: 'receita' })} />
                        <QuickActionButton icon={<Minus size={28} />} label="Novo Gasto" color="bg-red-500" onClick={() => navigate('add', { type: 'despesa' })} />
                        <QuickActionButton icon={<Target size={28} />} label="Minhas Metas" color="bg-amber-500" onClick={() => navigate('goals')} />
                        <QuickActionButton icon={<BarChart3 size={28} />} label="Relatórios" color="bg-purple-500" onClick={() => navigate('reports')} />
                     </div>
                </div>

                 {/* Active Goals */}
                 <div className="bg-white p-6 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-slate-800">Metas Ativas</h2>
                        <button onClick={() => navigate('goals')} className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800">
                            Ver todas <ChevronRight size={16} />
                        </button>
                    </div>
                    <div className="space-y-4">
                         {financeData.objetivos.length > 0 ? (
                            financeData.objetivos.slice(0, 2).map(obj => <GoalItem key={obj.id} objetivo={obj} />)
                         ) : (
                             <p className="text-center text-slate-500 py-4">Nenhuma meta ativa.</p>
                         )}
                    </div>
                </div>

                 {/* Recent Activity */}
                 <div className="bg-white p-6 rounded-xl border border-slate-200">
                    <h2 className="text-lg font-bold text-slate-800 mb-2">Atividade Recente</h2>
                     <div className="divide-y divide-slate-100">
                        {recentTransactions.length > 0 ? (
                            recentTransactions.map(t => <TransactionItem key={`${t.type}-${t.id}`} transaction={t} />)
                        ) : (
                            <p className="text-center text-slate-500 py-8">Nenhuma atividade recente.</p>
                        )}
                    </div>
                 </div>

            </div>
        </div>
    );
};

export default DashboardPage;