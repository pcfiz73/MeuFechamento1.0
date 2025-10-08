import React, { useContext } from 'react';
import type { FinanceData, Receita, Despesa, NewReceitaData, NewDespesaData } from '../../types';
import Card from '../Card';
import Button from '../Button';
import { formatCurrency, formatDate } from '../../utils';
import { FinanceContext } from '../../context/FinanceContext';

interface TransacoesTabProps {
    type: 'receita' | 'despesa';
    onOpenModal: (data?: any) => void;
}

const QuickAddCard: React.FC<{
    type: 'receita' | 'despesa';
    items: { label: string; value: number }[];
    onAdd: (label: string, value: number) => void;
}> = ({ type, items, onAdd }) => {
    const color = type === 'receita' ? 'text-green-500' : 'text-red-500';

    return (
        <Card>
            <h3 className="text-lg font-bold text-slate-800">Adicionar Rapidamente</h3>
            <div className="grid grid-cols-2 gap-4 mt-4">
                {items.map(item => (
                    <button
                        key={item.label}
                        onClick={() => onAdd(item.label, item.value)}
                        className="p-4 bg-slate-50 border-2 border-slate-200 rounded-lg text-center hover:border-blue-500 hover:bg-slate-100 transition-all transform hover:-translate-y-0.5"
                    >
                        <div className="font-semibold text-slate-700">{item.label}</div>
                        <div className={`${color} font-bold`}>{formatCurrency(item.value)}</div>
                    </button>
                ))}
            </div>
        </Card>
    );
};


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
                    <div className="font-medium text-slate-700 truncate">{transaction.descricao}</div>
                    <div className="text-sm text-slate-400">{formatDate(transaction.data)}</div>
                    <div className="text-xs text-blue-500 font-semibold"><i className="fas fa-university mr-1"></i> {bancoNome}</div>
                </div>
            </div>
            <div className="flex items-center gap-4 ml-4">
                <div className={`font-bold text-lg ${isIncome ? 'text-green-500' : 'text-red-500'}`}>{formatCurrency(transaction.valor)}</div>
                 <div className="flex gap-2">
                     <button onClick={onEdit} className="text-slate-400 hover:text-blue-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition"><i className="fas fa-edit"></i></button>
                     <button onClick={onDelete} className="text-slate-400 hover:text-red-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition"><i className="fas fa-trash-alt"></i></button>
                 </div>
            </div>
        </div>
    );
};

const TransacoesTab: React.FC<TransacoesTabProps> = ({ type, onOpenModal }) => {
    const { financeData, addReceita, addDespesa, deleteReceita, deleteDespesa } = useContext(FinanceContext);
    const isReceita = type === 'receita';
    const title = isReceita ? 'Receitas' : 'Despesas';
    const data = isReceita ? financeData.receitas : financeData.despesas;
    const sortedData = [...data].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

    const quickAddItems = isReceita ? 
        [{ label: 'iFood', value: 40 }, { label: 'Uber Eats', value: 35 }, { label: 'Rappi', value: 30 }, { label: 'James', value: 28 }] :
        [{ label: 'Combustível', value: 25 }, { label: 'Almoço', value: 15 }, { label: 'Manutenção', value: 50 }, { label: 'Outros', value: 20 }];

    const handleQuickAdd = async (descricao: string, valor: number) => {
        if (financeData.bancos.length === 0) {
            alert('Você precisa cadastrar um banco antes de adicionar uma transação.');
            return;
        }
        const primeiroBancoId = financeData.bancos[0].id;

        const commonData = {
            valor,
            data: new Date().toISOString().split('T')[0],
            observacoes: 'Adicionado rapidamente',
            banco_id: primeiroBancoId
        };
        
        try {
            if (isReceita) {
                const newReceita: NewReceitaData = { ...commonData, descricao };
                await addReceita(newReceita);
            } else {
                const newDespesa: NewDespesaData = { ...commonData, categoria: descricao.toLowerCase() };
                await addDespesa(newDespesa);
            }
             alert(`${title.slice(0,-1)} adicionada com sucesso!`);
        } catch (error: any) {
            console.error("Erro no Quick Add:", error);
            alert(error.message || `Falha ao adicionar ${type}.`);
        }
    };
    
    const handleDelete = async (id: number) => {
        if (!window.confirm(`Tem certeza que deseja excluir esta ${type}?`)) {
            return;
        }
        
        try {
            if(isReceita) {
                await deleteReceita(id);
            } else {
                await deleteDespesa(id);
            }
        } catch (error) {
            console.error("Erro ao deletar:", error);
            alert(`Falha ao excluir ${type}.`);
        }
    };

    return (
        <div className="animate-fade-in space-y-6">
            <h2 className="text-3xl font-bold text-slate-800">{title}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <Card>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Nova {isReceita ? 'Receita' : 'Despesa'}</h3>
                        <p className="text-slate-500 mb-4">Clique no botão abaixo para adicionar uma nova {isReceita ? 'receita' : 'despesa'}.</p>
                        <Button variant={isReceita ? 'success' : 'danger'} onClick={() => onOpenModal()}>
                            <i className="fas fa-plus mr-2"></i> Adicionar
                        </Button>
                    </Card>
                    <QuickAddCard type={type} items={quickAddItems} onAdd={handleQuickAdd} />
                </div>
                <Card>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">{title} Registradas</h3>
                    <div className="max-h-[60vh] overflow-y-auto pr-2">
                        {sortedData.length > 0 ? sortedData.map(item => {
                            const banco = financeData.bancos.find(b => b.id === item.banco_id);
                            return (
                                <TransactionItem 
                                    key={item.id} 
                                    transaction={item} 
                                    type={type} 
                                    bancoNome={banco?.nome || 'N/A'}
                                    onEdit={() => onOpenModal(item)}
                                    onDelete={() => handleDelete(item.id)}
                                />
                            )
                        }) : <p className="text-center text-slate-500 py-8">Nenhuma {type} registrada.</p>}
                    </div>
                </Card>
            </div>
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

export default TransacoesTab;