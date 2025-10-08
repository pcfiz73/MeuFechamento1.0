import React, { useState, useEffect, useContext } from 'react';
import Modal from '../Modal';
import Button from '../Button';
import type { Despesa, Banco, NewDespesaData } from '../../types';
import { DESPESA_CATEGORIAS } from '../../constants';
import { FinanceContext } from '../../context/FinanceContext';

interface DespesaModalProps {
    isOpen: boolean;
    onClose: () => void;
    despesa?: Despesa;
    bancos: Banco[];
}

const getInitialState = (bancos: Banco[]) => ({
    valor: '',
    categoria: 'combustivel',
    banco_id: bancos.length > 0 ? String(bancos[0].id) : '',
    data: new Date().toISOString().split('T')[0],
    observacoes: ''
});

const DespesaModal: React.FC<DespesaModalProps> = ({ isOpen, onClose, despesa, bancos }) => {
    const { addDespesa, updateDespesa } = useContext(FinanceContext);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState(getInitialState(bancos));

    useEffect(() => {
        if (isOpen) {
            if (despesa) {
                setFormData({
                    valor: despesa.valor?.toString() || '',
                    categoria: despesa.categoria,
                    banco_id: despesa.banco_id?.toString() || '',
                    data: despesa.data,
                    observacoes: despesa.observacoes
                });
            } else {
                setFormData(getInitialState(bancos));
            }
        }
    }, [despesa, isOpen, bancos]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const valor = parseFloat(formData.valor);
        const banco_id = parseInt(formData.banco_id);
    
        if (isNaN(valor) || isNaN(banco_id) || valor <= 0) {
            alert('Valores inválidos.');
            setIsSubmitting(false);
            return;
        }
        
        try {
            if (despesa) { // Editing
                const updatedDespesa: Despesa = {
                    ...despesa,
                    valor,
                    categoria: formData.categoria,
                    descricao: DESPESA_CATEGORIAS.find(c => c.value === formData.categoria)?.label || 'Outros',
                    banco_id,
                    data: formData.data,
                    observacoes: formData.observacoes,
                };
                await updateDespesa(updatedDespesa);
            } else { // Adding new
                const newDespesa: NewDespesaData = {
                    valor,
                    categoria: formData.categoria,
                    banco_id,
                    data: formData.data,
                    observacoes: formData.observacoes
                };
                await addDespesa(newDespesa);
            }
            onClose();
        } catch(error: any) {
            console.error(error);
            alert(error.message || "Falha ao salvar despesa.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={despesa ? 'Editar Despesa' : 'Adicionar Nova Despesa'}>
            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <div className="form-group">
                        <label className="block text-sm font-medium text-slate-600 mb-1">Valor (R$)</label>
                        <input type="number" name="valor" value={formData.valor} onChange={handleChange} step="0.01" min="0" className="w-full p-2 border border-slate-300 rounded-lg" required />
                    </div>
                    <div className="form-group">
                        <label className="block text-sm font-medium text-slate-600 mb-1">Categoria</label>
                        <select name="categoria" value={formData.categoria} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg" required>
                            {DESPESA_CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="block text-sm font-medium text-slate-600 mb-1">Banco de Origem</label>
                        <select name="banco_id" value={formData.banco_id} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg" required>
                            {bancos.map(b => <option key={b.id} value={b.id}>{b.nome}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="block text-sm font-medium text-slate-600 mb-1">Data</label>
                        <input type="date" name="data" value={formData.data} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg" required />
                    </div>
                     <div className="form-group">
                        <label className="block text-sm font-medium text-slate-600 mb-1">Observações</label>
                        <textarea name="observacoes" value={formData.observacoes} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg h-24"></textarea>
                    </div>
                </div>
                <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-slate-200">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button type="submit" variant="danger" disabled={isSubmitting}>
                        {isSubmitting ? 'Salvando...' : 'Salvar'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default DespesaModal;