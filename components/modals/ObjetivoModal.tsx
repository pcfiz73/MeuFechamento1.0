import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import Button from '../Button';
import type { FinanceData, Objetivo } from '../../types';

interface ObjetivoModalProps {
    isOpen: boolean;
    onClose: () => void;
    objetivo?: Objetivo;
    updateFinanceData: (updater: (prev: FinanceData) => FinanceData) => void;
}

const ObjetivoModal: React.FC<ObjetivoModalProps> = ({ isOpen, onClose, objetivo, updateFinanceData }) => {
    const [formData, setFormData] = useState({
        titulo: '',
        metaValor: '',
        valorAtual: '0',
        dataLimite: ''
    });

    useEffect(() => {
        if (objetivo) {
            setFormData({
                titulo: objetivo.titulo || '',
                metaValor: objetivo.metaValor?.toString() || '',
                valorAtual: objetivo.valorAtual?.toString() || '0',
                dataLimite: objetivo.dataLimite || ''
            });
        } else {
            setFormData({ titulo: '', metaValor: '', valorAtual: '0', dataLimite: '' });
        }
    }, [objetivo, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({...prev, [e.target.name]: e.target.value}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const metaValor = parseFloat(formData.metaValor);
        const valorAtual = parseFloat(formData.valorAtual);
        if (isNaN(metaValor) || isNaN(valorAtual)) return;
        
        updateFinanceData(prev => {
            if (objetivo) {
                return {
                    ...prev,
                    objetivos: prev.objetivos.map(o => o.id === objetivo.id ? { ...o, ...formData, metaValor, valorAtual } : o)
                }
            } else {
                const newObjetivo: Objetivo = {
                    id: Date.now(),
                    ...formData,
                    metaValor,
                    valorAtual,
                };
                return { ...prev, objetivos: [...prev.objetivos, newObjetivo] };
            }
        });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={objetivo ? 'Editar Objetivo' : 'Adicionar Novo Objetivo'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Título</label>
                    <input type="text" name="titulo" value={formData.titulo} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg" required />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Valor da Meta (R$)</label>
                    <input type="number" name="metaValor" value={formData.metaValor} onChange={handleChange} step="0.01" min="0" className="w-full p-2 border border-slate-300 rounded-lg" required />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Valor Atual (R$)</label>
                    <input type="number" name="valorAtual" value={formData.valorAtual} onChange={handleChange} step="0.01" min="0" className="w-full p-2 border border-slate-300 rounded-lg" required />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Data Limite</label>
                    <input type="date" name="dataLimite" value={formData.dataLimite} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg" required />
                </div>
                 <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-slate-200">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button type="submit" variant="primary">Salvar</Button>
                </div>
            </form>
        </Modal>
    );
};

export default ObjetivoModal;