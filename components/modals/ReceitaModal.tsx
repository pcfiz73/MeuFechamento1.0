import React, { useState, useEffect, useContext } from 'react';
import Modal from '../Modal';
import Button from '../Button';
import type { Receita, Banco, NewReceitaData } from '../../types';
import { RECEITA_PLATAFORMAS } from '../../constants';
import { FinanceContext } from '../../context/FinanceContext';

interface ReceitaModalProps {
    isOpen: boolean;
    onClose: () => void;
    receita?: Receita;
    bancos: Banco[];
}

const getInitialState = (bancos: Banco[]) => ({
    valor: '',
    plataforma: 'iFood',
    banco_id: bancos.length > 0 ? String(bancos[0].id) : '',
    data: new Date().toISOString().split('T')[0],
    observacoes: ''
});


const ReceitaModal: React.FC<ReceitaModalProps> = ({ isOpen, onClose, receita, bancos }) => {
    const { addReceita, updateReceita } = useContext(FinanceContext);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState(getInitialState(bancos));

    useEffect(() => {
        if (isOpen) {
            if (receita) {
                setFormData({
                    valor: receita.valor?.toString() || '',
                    plataforma: receita.descricao,
                    banco_id: receita.banco_id?.toString() || '',
                    data: receita.data,
                    observacoes: receita.observacoes
                });
            } else {
                setFormData(getInitialState(bancos));
            }
        }
    }, [receita, isOpen, bancos]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
            if (receita) { // Editing
                const updatedReceita: Receita = {
                    ...receita,
                    valor,
                    descricao: formData.plataforma,
                    banco_id,
                    data: formData.data,
                    observacoes: formData.observacoes,
                };
                await updateReceita(updatedReceita);
            } else { // Adding new
                const newReceita: NewReceitaData = {
                    valor,
                    descricao: formData.plataforma,
                    banco_id,
                    data: formData.data,
                    observacoes: formData.observacoes
                };
                await addReceita(newReceita);
            }
            onClose();
        } catch (error) {
            console.error(error);
            alert("Falha ao salvar receita.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={receita ? 'Editar Receita' : 'Adicionar Nova Receita'}>
            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <div className="form-group">
                        <label className="block text-sm font-medium text-slate-600 mb-1">Valor (R$)</label>
                        <input type="number" name="valor" value={formData.valor} onChange={handleChange} step="0.01" min="0" className="w-full p-2 border border-slate-300 rounded-lg" required />
                    </div>
                    <div className="form-group">
                        <label className="block text-sm font-medium text-slate-600 mb-1">Plataforma</label>
                        <select name="plataforma" value={formData.plataforma} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg" required>
                            {RECEITA_PLATAFORMAS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="block text-sm font-medium text-slate-600 mb-1">Banco de Destino</label>
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
                    <Button type="submit" variant="success" disabled={isSubmitting}>
                        {isSubmitting ? 'Salvando...' : 'Salvar'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default ReceitaModal;