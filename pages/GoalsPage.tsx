import React, { useContext, useState } from 'react';
import { FinanceContext } from '../context/FinanceContext';
import Card from '../components/Card';
import { formatCurrency, formatDate } from '../utils';
import type { Objetivo, NewObjetivoData } from '../types';
import { Plus, Edit, Trash2 } from 'lucide-react';

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
                    <button onClick={() => onAddValueManual(objetivo.id)} className="hover:text-green-500 transition-colors">
                        <Plus size={18} />
                    </button>
                    <button onClick={onEdit} className="hover:text-blue-500 transition-colors">
                        <Edit size={16} />
                    </button>
                    <button onClick={onDelete} className="hover:text-red-500 transition-colors">
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
    const { financeData, addObjetivo, updateObjetivo, deleteObjetivo, openModal } = useContext(FinanceContext);
    const [isCreating, setIsCreating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newGoal, setNewGoal] = useState({
        titulo: '',
        meta_valor: '',
        valor_atual: '0',
        data_limite: ''
    });

    const handleNewGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewGoal(prev => ({...prev, [e.target.name]: e.target.value}));
    };

    const handleCreateGoal = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const meta_valor = parseFloat(newGoal.meta_valor);
        const valor_atual = parseFloat(newGoal.valor_atual);

        if (isNaN(meta_valor) || isNaN(valor_atual) || !newGoal.titulo || !newGoal.data_limite) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            setIsSubmitting(false);
            return;
        }

        try {
            const newObjetivo: NewObjetivoData = {
                titulo: newGoal.titulo,
                meta_valor,
                valor_atual,
                data_limite: newGoal.data_limite
            };
            await addObjetivo(newObjetivo);
            setNewGoal({ titulo: '', meta_valor: '', valor_atual: '0', data_limite: '' });
            setIsCreating(false);
        } catch(error) {
            console.error(error);
            alert('Falha ao criar meta.');
        } finally {
            setIsSubmitting(false);
        }
    };

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
            const valor = parseFloat(valorStr);
            if (!isNaN(valor) && valor > 0) {
                handleAddValue(id, valor);
            }
        }
    };

    return (
        <div className="animate-slide-up space-y-6">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg">
                <h1 className="text-3xl font-bold">Minhas Metas</h1>
                <p className="text-amber-100 mt-1 mb-4">Defina e acompanhe seus objetivos</p>
                <button 
                  onClick={() => setIsCreating(prev => !prev)} 
                  className="w-full py-3 px-4 rounded-lg font-semibold bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center gap-2"
                >
                    <Plus size={18} /> {isCreating ? 'Cancelar' : 'Nova Meta'}
                </button>
            </div>
            
            {isCreating && (
                <Card className="animate-slide-up">
                    <form onSubmit={handleCreateGoal} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Nome da Meta *</label>
                            <input type="text" name="titulo" value={newGoal.titulo} onChange={handleNewGoalChange} placeholder="Ex: Trocar a moto" className="w-full p-2 border border-slate-300 rounded-lg" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Valor Alvo (R$) *</label>
                                <input type="number" name="meta_valor" value={newGoal.meta_valor} onChange={handleNewGoalChange} step="0.01" min="0" placeholder="0.00" className="w-full p-2 border border-slate-300 rounded-lg" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Valor Atual (R$)</label>
                                <input type="number" name="valor_atual" value={newGoal.valor_atual} onChange={handleNewGoalChange} step="0.01" min="0" placeholder="0" className="w-full p-2 border border-slate-300 rounded-lg" required />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Prazo *</label>
                            <input type="date" name="data_limite" value={newGoal.data_limite} onChange={handleNewGoalChange} className="w-full p-2 border border-slate-300 rounded-lg" required />
                        </div>
                        <div className="flex justify-end gap-4 pt-2">
                            <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 rounded-lg font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors">Cancelar</button>
                            <button type="submit" className="px-4 py-2 rounded-lg font-semibold bg-amber-500 text-white hover:bg-amber-600 transition-colors" disabled={isSubmitting}>
                               {isSubmitting ? 'Criando...' : 'Criar Meta'}
                            </button>
                        </div>
                    </form>
                </Card>
            )}

            <Card>
                 <h2 className="text-lg font-bold text-slate-800 mb-4">🎯 Metas Ativas</h2>
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
                        <p className="text-center text-slate-500 py-8">Nenhum objetivo cadastrado.</p>
                    )}
                 </div>
            </Card>
        </div>
    );
};

export default GoalsPage;