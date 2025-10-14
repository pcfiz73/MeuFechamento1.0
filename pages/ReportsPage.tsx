import React, { useContext, useState, useMemo } from 'react';
import RelatoriosTab from '../components/tabs/RelatoriosTab';
import Card from '../components/Card';
import { FinanceContext } from '../context/FinanceContext';
import type { Receita, Despesa } from '../types';
import { formatCurrency, formatDate } from '../utils';

const TransactionItem: React.FC<{ 
    transaction: Receita | Despesa, 
    type: 'receita' | 'despesa', 
    bancoNome: string,
    onEdit: () => void,
    onDelete: () => void,
}> = ({ transaction, type, bancoNome, onEdit, onDelete }) => {
    const isIncome = type === 'receita';

    return (
         <div className="flex items-center justify-between py-4 border-b border-slate-100 last:border-b-0">
            <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-white ${isIncome ? 'bg-green-500' : 'bg-red-500'}`}>
                    <i className={`fas ${isIncome ? 'fa-plus' : 'fa-minus'}`}></i>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-700 truncate">
                        {transaction.descricao}
                        {transaction.parcelamento && (
                            <span className="ml-2 text-xs font-semibold text-blue-500 bg-blue-100 px-2 py-0.5 rounded-full align-middle">
                                {transaction.parcelamento}
                            </span>
                        )}
                    </div>
                    <div className="text-sm text-slate-400">{formatDate(transaction.data)}</div>
                    <div className="text-xs text-blue-500 font-semibold"><i className="fas fa-university mr-1"></i> {bancoNome}</div>
                </div>
            </div>
            <div className="flex items-center gap-4 ml-4">
                <div className={`font-bold text-lg ${isIncome ? 'text-green-500' : 'text-red-500'}`}>{formatCurrency(transaction.valor)}</div>
                 <div className="flex gap-2">
                    <button onClick={onEdit} className="text-slate-400 hover:text-blue-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition">
                        <i className="fas fa-edit"></i>
                    </button>
                    <button onClick={onDelete} className="text-slate-400 hover:text-red-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition">
                        <i className="fas fa-trash-alt"></i>
                    </button>
                 </div>
            </div>
        </div>
    );
};


const FutureTransactionItem: React.FC<{
    transaction: (Receita | Despesa) & { type: 'receita' | 'despesa' };
}> = ({ transaction }) => {
    const isIncome = transaction.type === 'receita';

    return (
         <div className="flex items-center justify-between py-4 border-b border-slate-100 last:border-b-0 opacity-80">
            <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-white ${isIncome ? 'bg-green-400' : 'bg-red-400'}`}>
                    <i className="fas fa-calendar-alt"></i>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-600 truncate">
                        {transaction.descricao}
                        <span className="ml-2 text-xs font-semibold text-blue-500 bg-blue-100 px-2 py-0.5 rounded-full align-middle">
                            {transaction.parcelamento}
                        </span>
                    </div>
                    <div className="text-sm text-slate-500 font-bold">{formatDate(transaction.data)}</div>
                </div>
            </div>
            <div className={`font-bold text-lg ${isIncome ? 'text-green-500' : 'text-red-500'}`}>
                {formatCurrency(transaction.valor)}
            </div>
        </div>
    );
};

const ReportsPage: React.FC = () => {
    const { financeData, deleteReceita, deleteDespesa, navigate } = useContext(FinanceContext);
    const [historyTab, setHistoryTab] = useState<'receitas' | 'despesas'>('receitas');
    const [futureTab, setFutureTab] = useState<'receitas' | 'despesas'>('despesas');


    const sortedReceitas = [...financeData.receitas].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
    const sortedDespesas = [...financeData.despesas].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
    
    const futureTransactions = useMemo(() => {
        const projections: ((Receita & { type: 'receita' }) | (Despesa & { type: 'despesa' }))[] = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const processTransactions = (transactions: (Receita[] | Despesa[]), type: 'receita' | 'despesa') => {
            transactions.forEach(t => {
                if (t.parcelamento) {
                    const [current, total] = t.parcelamento.split('/').map(Number);
                    if (!isNaN(current) && !isNaN(total) && current < total) {
                        const originalDate = new Date(t.data + 'T00:00:00');
                        for (let i = current + 1; i <= total; i++) {
                            const futureDate = new Date(originalDate);
                            futureDate.setMonth(originalDate.getMonth() + (i - current));

                            if (futureDate > today) {
                                // FIX: Used `as unknown` to cast the projected transaction object. This resolves a TypeScript error where a string `id` was assigned to a type expecting a number. The `FutureTransactionItem` component consuming this object can handle a string `id` as a key without issues.
                                projections.push({
                                    ...t,
                                    id: `${t.id}-proj-${i}`,
                                    data: futureDate.toISOString().split('T')[0],
                                    parcelamento: `${i}/${total}`,
                                    type: type
                                } as unknown as (Receita & { type: 'receita' }) | (Despesa & { type: 'despesa' }));
                            }
                        }
                    }
                }
            });
        };

        processTransactions(financeData.receitas, 'receita');
        processTransactions(financeData.despesas, 'despesa');

        return projections.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
    }, [financeData]);

    const futureReceitas = futureTransactions.filter(t => t.type === 'receita');
    const futureDespesas = futureTransactions.filter(t => t.type === 'despesa');


    const handleDelete = async (id: number, type: 'receita' | 'despesa') => {
        if (!window.confirm(`Tem certeza que deseja excluir esta ${type}?`)) return;
        
        try {
            if (type === 'receita') {
                await deleteReceita(id);
            } else {
                await deleteDespesa(id);
            }
        } catch (error) {
            console.error(error);
            alert(`Falha ao excluir ${type}.`);
        }
    };

    const handleEdit = (type: 'receita' | 'despesa', id: number) => {
        navigate('add', { type, id });
    };

    return (
        <div className="space-y-6 animate-slide-up">
            <RelatoriosTab financeData={financeData} />

            <Card>
                <h3 className="text-xl font-bold text-slate-800 mb-4">Lançamentos Futuros</h3>
                <div className="flex border-b border-slate-200 mb-4">
                    <button onClick={() => setFutureTab('receitas')} className={`flex-1 py-3 font-semibold text-center ${futureTab === 'receitas' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}>Receitas</button>
                    <button onClick={() => setFutureTab('despesas')} className={`flex-1 py-3 font-semibold text-center ${futureTab === 'despesas' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}>Despesas</button>
                </div>
                 <div className="max-h-[40vh] overflow-y-auto pr-2">
                    {futureTab === 'receitas' && (
                        futureReceitas.length > 0 ? futureReceitas.map(item => (
                            <FutureTransactionItem 
                                key={item.id} 
                                transaction={item}
                            />
                        )) : <p className="text-center text-slate-500 py-8">Nenhuma receita futura.</p>
                    )}
                    {futureTab === 'despesas' && (
                        futureDespesas.length > 0 ? futureDespesas.map(item => (
                            <FutureTransactionItem 
                                key={item.id} 
                                transaction={item}
                            />
                        )) : <p className="text-center text-slate-500 py-8">Nenhuma despesa futura.</p>
                    )}
                 </div>
            </Card>

            <Card>
                <h3 className="text-xl font-bold text-slate-800 mb-4">Histórico de Transações</h3>
                <div className="flex border-b border-slate-200 mb-4">
                    <button onClick={() => setHistoryTab('receitas')} className={`flex-1 py-3 font-semibold text-center ${historyTab === 'receitas' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}>Receitas</button>
                    <button onClick={() => setHistoryTab('despesas')} className={`flex-1 py-3 font-semibold text-center ${historyTab === 'despesas' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}>Despesas</button>
                </div>
                <div className="max-h-[60vh] overflow-y-auto pr-2">
                    {historyTab === 'receitas' && (
                        sortedReceitas.length > 0 ? sortedReceitas.map(item => (
                            <TransactionItem 
                                key={item.id} 
                                transaction={item} 
                                type="receita"
                                bancoNome={financeData.bancos.find(b => b.id === item.banco_id)?.nome || 'N/A'}
                                onEdit={() => handleEdit('receita', item.id)}
                                onDelete={() => handleDelete(item.id, 'receita')}
                            />
                        )) : <p className="text-center text-slate-500 py-8">Nenhuma receita registrada.</p>
                    )}
                    {historyTab === 'despesas' && (
                        sortedDespesas.length > 0 ? sortedDespesas.map(item => (
                            <TransactionItem 
                                key={item.id} 
                                transaction={item} 
                                type="despesa"
                                bancoNome={financeData.bancos.find(b => b.id === item.banco_id)?.nome || 'N/A'}
                                onEdit={() => handleEdit('despesa', item.id)}
                                onDelete={() => handleDelete(item.id, 'despesa')}
                            />
                        )) : <p className="text-center text-slate-500 py-8">Nenhuma despesa registrada.</p>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default ReportsPage;