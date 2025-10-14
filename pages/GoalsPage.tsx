import React, { useContext, useMemo } from 'react';
import { FinanceContext } from '../context/FinanceContext';
import Card from '../components/Card';
import Button from '../components/Button';
import { formatCurrency, formatDate, filterDataByPeriod } from '../utils';
import type { Objetivo } from '../types';
import { Plus, Edit, Trash2, Target, Edit3 } from 'lucide-react';

// Sub-componente para exibir o progresso de uma meta de ganho
const IncomeGoalProgress: React.FC<{
    label: string;
    current: number;
    goal: number;
    percent: number;
}> = ({ label, current, goal, percent }) => {
    const progress = Math.min(percent, 100);
    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-slate-700 text-sm">{label}</span>
                <span className={`font-bold text-sm ${progress >= 100 ? 'text-green-500' : 'text-slate-600'}`}>{percent}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5">
                <div className={`h-2.5 rounded-full transition-all duration-500 ${progress >= 100 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${progress}%` }}></div>
            </div>
             <div className="text-xs text-slate-500 mt-1 text-right">
                {formatCurrency(current)} de {formatCurrency(goal)}
            </div>
        </div>
    );
};


const GoalCard: React.FC<{
    objetivo: Objetivo,
    onEdit: () => void,
    onDelete: () => void,
    onAddValueManual: (id: number) => void,
}> = ({ objetivo, onEdit, onDelete, onAddValueManual }) => {
    const percent = objetivo.meta_valor > 0 ? Math.min(Math.round((objetivo.valor_atual / objetivo.meta_valor) * 100), 100) : 0;
    
    return (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-800">{objetivo.titulo}</h3>
                <div className="flex items-center gap-3 text-slate-400">
                    <button onClick={() => onAddValueManual(objetivo.id)} className="hover:text-green-500 transition-colors" aria-label="Adicionar valor">
                        <Plus size={18} />
                    </button>
                    <button onClick={onEdit} className="hover:text-blue-500 transition-colors" aria-label="Editar">
                        <Edit size={16} />
                    </button>
                    <button onClick={onDelete} className="hover:text-red-500 transition-colors" aria-label="Excluir">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            <p className="text-xs text-slate-400 mb-3">Prazo: {formatDate(objetivo.data_limite)}</p>
            
            <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${percent}%` }}></div>
            </div>

            <div className="flex justify-between items-center mt-1">
                <p className="text-sm text-slate-500">{formatCurrency(objetivo.valor_atual)} de {formatCurrency(objetivo.meta_valor)}</p>
                <p className="text-sm font-bold text-slate-600">{percent}%</p>
            </div>
        </div>
    );
};


const GoalsPage: React.FC = () => {
    const { financeData, updateObjetivo, deleteObjetivo, openModal } = useContext(FinanceContext);

    const incomeProgress = useMemo(() => {
        const dailyIncome = filterDataByPeriod(financeData.receitas, 'hoje').reduce((sum, r) => sum + r.valor, 0);
        const weeklyIncome = filterDataByPeriod(financeData.receitas, 'semana').reduce((sum, r) => sum + r.valor, 0);
        const monthlyIncome = filterDataByPeriod(financeData.receitas, 'mes').reduce((sum, r) => sum + r.valor, 0);

        return {
            daily: {
                current: dailyIncome,
                goal: financeData.metas.diaria,
                percent: financeData.metas.diaria > 0 ? Math.round((dailyIncome / financeData.metas.diaria) * 100) : 0,
            },
            weekly: {
                current: weeklyIncome,
                goal: financeData.metas.semanal,
                percent: financeData.metas.semanal > 0 ? Math.round((weeklyIncome / financeData.metas.semanal) * 100) : 0,
            },
            monthly: {
                current: monthlyIncome,
                goal: financeData.metas.mensal,
                percent: financeData.metas.mensal > 0 ? Math.round((monthlyIncome / financeData.metas.mensal) * 100) : 0,
            }
        };
    }, [financeData.receitas, financeData.metas]);


    const handleGoalDelete = async (id: number) => {
        if (!window.confirm('Tem certeza que deseja excluir este objetivo?')) {
            return;
        }
        try {
            await deleteObjetivo(id);
        } catch (error) {
            console.error(error);
            alert('Falha ao excluir objetivo.');
        }
    };

    const handleAddValue = async (id: number, valor: number) => {
        const objetivo = financeData.objetivos.find(o => o.id === id);
        if (!objetivo) return;
        
        const novoValor = Math.min(objetivo.meta_valor, objetivo.valor_atual + valor);
        try {
            await updateObjetivo({ ...objetivo, valor_atual: novoValor });
        } catch (error) {
            console.error(error);
            alert('Falha ao adicionar valor.');
        }
    };

    const handleAddValueManual = (id: number) => {
        const objetivo = financeData.objetivos.find(o => o.id === id);
        if (!objetivo) return;

        const valorStr = prompt(`Adicionar valor ao objetivo '${objetivo.titulo}':`);
        if (valorStr) {
            const valor = parseFloat(valorStr.replace(',', '.'));
            if (!isNaN(valor) && valor > 0) {
                handleAddValue(id, valor);
            } else {
                alert('Valor inválido.');
            }
        }
    };

    return (
        <div className="animate-slide-up space-y-6">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-lg">
                <h1 className="text-3xl font-bold">Minhas Metas</h1>
                <p className="text-blue-200 mt-1">Acompanhe seus ganhos e objetivos de poupança.</p>
            </div>
            
            <Card>
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-slate-800">📊 Metas de Ganhos</h2>
                    <Button variant="secondary" onClick={() => openModal('meta')}>
                        <Edit3 size={16} /> Editar Metas
                    </Button>
                 </div>
                 <div className="space-y-4">
                    <IncomeGoalProgress label="Meta Diária" {...incomeProgress.daily} />
                    <IncomeGoalProgress label="Meta Semanal" {...incomeProgress.weekly} />
                    <IncomeGoalProgress label="Meta Mensal" {...incomeProgress.monthly} />
                 </div>
            </Card>

            <Card>
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-slate-800">💰 Objetivos de Poupança</h2>
                    <Button variant="primary" onClick={() => openModal('objetivo')}>
                        <Plus size={16} /> Novo Objetivo
                    </Button>
                 </div>
                 <div className="space-y-4">
                    {financeData.objetivos.length > 0 ? (
                        financeData.objetivos.map(obj => (
                            <GoalCard 
                                key={obj.id} 
                                objetivo={obj}
                                onEdit={() => openModal('objetivo', obj)}
                                onDelete={() => handleGoalDelete(obj.id)}
                                onAddValueManual={handleAddValueManual}
                            />
                        ))
                    ) : (
                        <div className="text-center py-8">
                            <Target size={48} className="mx-auto text-slate-300" />
                            <p className="mt-4 text-slate-500">Nenhum objetivo cadastrado.</p>
                            <p className="text-sm text-slate-400">Crie seu primeiro objetivo para começar a poupar!</p>
                        </div>
                    )}
                 </div>
            </Card>
        </div>
    );
};

export default GoalsPage;
