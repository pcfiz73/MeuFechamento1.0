import React, { useState, useEffect, useContext } from 'react';
import Modal from '../Modal';
import Button from '../Button';
import type { Objetivo } from '../../types';
import { FinanceContext } from '../../context/FinanceContext';

interface ObjetivoModalProps {
    isOpen: boolean;
    onClose: () => void;
    objetivo?: Objetivo;
}

const ObjetivoModal: React.FC<ObjetivoModalProps> = ({ isOpen, onClose, objetivo }) => {
    const { addObjetivo, updateObjetivo } = useContext(FinanceContext);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        titulo: '',
        meta_valor: '',
        valor_atual: '0',
        data_limite: ''
    });

    useEffect(() => {
        if (objetivo) {
            setFormData({
                titulo: objetivo.titulo || '',
                meta_valor: objetivo.meta_valor?.toString() || '',
                valor_atual: objetivo.valor_atual?.toString() || '0',
                data_limite: objetivo.data_limite || ''
            });
        } else {
            setFormData({ titulo: '', meta_valor: '', valor_atual: '0', data_limite: '' });
        }
    }, [objetivo, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({...prev, [e.target.name]: e.target.value}));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const meta_valor = parseFloat(formData.meta_valor);
        const valor_atual = parseFloat(formData.valor_atual);
        if (isNaN(meta_valor) || isNaN(valor_atual)) {
            alert("Valores inválidos.");
            setIsSubmitting(false);
            return;
        }
        
        try {
            if (objetivo) {
                await updateObjetivo({ ...objetivo, ...formData, meta_valor, valor_atual });
            } else {
                await addObjetivo({ ...formData, meta_valor, valor_atual });
            }
            onClose();
        } catch (error) {
            console.error(error);
            alert("Falha ao salvar objetivo.");
        } finally {
            setIsSubmitting(false);
        }
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
                    <input type="number" name="meta_valor" value={formData.meta_valor} onChange={handleChange} step="0.01" min="0" className="w-full p-2 border border-slate-300 rounded-lg" required />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Valor Atual (R$)</label>
                    <input type="number" name="valor_atual" value={formData.valor_atual} onChange={handleChange} step="0.01" min="0" className="w-full p-2 border border-slate-300 rounded-lg" required />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Data Limite</label>
                    <input type="date" name="data_limite" value={formData.data_limite} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg" required />
                </div>
                 <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-slate-200">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button type="submit" variant="primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Salvando...' : 'Salvar'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default ObjetivoModal;