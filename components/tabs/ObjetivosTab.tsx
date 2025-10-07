import React from 'react';
import type { FinanceData } from '../../types';
import Card from '../Card';
import Button from '../Button';
import { formatCurrency, formatDate } from '../../utils';

interface ObjetivosTabProps {
    financeData: FinanceData;
    updateFinanceData: (updater: (prev: FinanceData) => FinanceData) => void;
    onOpenModal: (data?: any) => void;
}

const GoalCard: React.FC<{
    objetivo: FinanceData['objetivos'][0],
    onEdit: () => void,
    onDelete: () => void,
    onAddValue: (id: number, value: number) => void,
    onAddValueManual: (id: number) => void,
}> = ({ objetivo, onEdit, onDelete, onAddValue, onAddValueManual }) => {
    const percent = objetivo.metaValor > 0 ? Math.round((objetivo.valorAtual / objetivo.metaValor) * 100) : 0;
    const restante = objetivo.metaValor - objetivo.valorAtual;
    
    return (
        <Card>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-bold text-slate-800">{objetivo.titulo}</h3>
                    <p className="text-sm text-slate-400">Meta: {formatCurrency(objetivo.metaValor)} até {formatDate(objetivo.dataLimite)}</p>
                </div>
                 <div className={`px-3 py-1 text-sm font-bold rounded-full ${percent >= 100 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                    {percent}%
                </div>
            </div>
             <div className="w-full bg-slate-200 rounded-full h-2.5 mb-2">
                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${Math.min(percent, 100)}%` }}></div>
            </div>
            <div className="flex justify-between text-sm text-slate-500 mb-4">
                <span>Atual: <span className="font-bold text-slate-700">{formatCurrency(objetivo.valorAtual)}</span></span>
                <span>Restante: <span className="font-bold text-slate-700">{formatCurrency(restante)}</span></span>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
                <button onClick={() => onAddValue(objetivo.id, 10)} className="flex-1 py-2 px-3 text-sm bg-slate-100 hover:bg-blue-500 hover:text-white rounded-lg transition font-semibold">+ R$10</button>
                <button onClick={() => onAddValue(objetivo.id, 50)} className="flex-1 py-2 px-3 text-sm bg-slate-100 hover:bg-blue-500 hover:text-white rounded-lg transition font-semibold">+ R$50</button>
                <button onClick={() => onAddValueManual(objetivo.id)} className="flex-1 py-2 px-3 text-sm bg-slate-100 hover:bg-blue-500 hover:text-white rounded-lg transition font-semibold">Manual</button>
                 <div className="flex gap-1">
                     <button onClick={onEdit} className="text-slate-400 hover:text-blue-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition"><i className="fas fa-edit"></i></button>
                     <button onClick={onDelete} className="text-slate-400 hover:text-red-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition"><i className="fas fa-trash-alt"></i></button>
                 </div>
            </div>
        </Card>
    )
}

const ObjetivosTab: React.FC<ObjetivosTabProps> = ({ financeData, updateFinanceData, onOpenModal }) => {
    
    const handleDelete = (id: number) => {
        if (!window.confirm('Tem certeza que deseja excluir este objetivo?')) {
            return;
        }
        updateFinanceData(prev => ({
            ...prev,
            objetivos: prev.objetivos.filter(o => o.id !== id)
        }));
    };

    const handleAddValue = (id: number, valor: number) => {
        updateFinanceData(prev => ({
            ...prev,
            objetivos: prev.objetivos.map(o => o.id === id ? { ...o, valorAtual: Math.min(o.metaValor, o.valorAtual + valor) } : o)
        }));
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
        <div className="animate-fade-in space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Objetivos de Poupança</h2>
                    <p className="text-slate-500">Gerencie suas metas financeiras.</p>
                </div>
                <Button onClick={() => onOpenModal()}>
                    <i className="fas fa-plus mr-2"></i> Adicionar Objetivo
                </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {financeData.objetivos.map(obj => (
                    <GoalCard 
                        key={obj.id} 
                        objetivo={obj}
                        onEdit={() => onOpenModal(obj)}
                        onDelete={() => handleDelete(obj.id)}
                        onAddValue={handleAddValue}
                        onAddValueManual={handleAddValueManual}
                    />
                ))}
            </div>
            {financeData.objetivos.length === 0 && (
                <Card className="text-center py-12">
                    <p className="text-slate-500">Nenhum objetivo cadastrado.</p>
                </Card>
            )}
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

export default ObjetivosTab;