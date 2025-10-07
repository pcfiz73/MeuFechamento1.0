import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import Button from '../Button';
import type { FinanceData, Receita, Banco } from '../../types';
import { RECEITA_PLATAFORMAS } from '../../constants';

interface ReceitaModalProps {
    isOpen: boolean;
    onClose: () => void;
    receita?: Receita;
    bancos: Banco[];
    updateFinanceData: (updater: (prev: FinanceData) => FinanceData) => void;
}

const getInitialState = (bancos: Banco[]) => ({
    valor: '',
    plataforma: 'iFood',
    bancoId: bancos.length > 0 ? String(bancos[0].id) : '',
    data: new Date().toISOString().split('T')[0],
    observacoes: ''
});


const ReceitaModal: React.FC<ReceitaModalProps> = ({ isOpen, onClose, receita, bancos, updateFinanceData }) => {
    const [formData, setFormData] = useState(getInitialState(bancos));

    useEffect(() => {
        if (isOpen) {
            if (receita) {
                setFormData({
                    valor: receita.valor?.toString() || '',
                    plataforma: receita.descricao,
                    bancoId: receita.bancoId?.toString() || '',
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const valor = parseFloat(formData.valor);
        const bancoId = parseInt(formData.bancoId);
    
        if (isNaN(valor) || isNaN(bancoId)) {
            alert('Valores inválidos.');
            return;
        }
    
        updateFinanceData(prev => {
            if (receita) { // Editing
                const oldReceita = prev.receitas.find(r => r.id === receita.id);
                if (!oldReceita) return prev;
    
                const novasReceitas = prev.receitas.map(r =>
                    r.id === receita.id ? {
                        ...r,
                        valor,
                        descricao: formData.plataforma,
                        bancoId,
                        data: formData.data,
                        observacoes: formData.observacoes,
                    } : r
                );
    
                const novosBancos = prev.bancos.map(b => {
                    let newSaldo = b.saldo;
                    // Revert old value from old bank
                    if (b.id === oldReceita.bancoId) {
                        newSaldo -= oldReceita.valor;
                    }
                    // Apply new value to new bank
                    if (b.id === bancoId) {
                        newSaldo += valor;
                    }
                    return { ...b, saldo: newSaldo };
                });
                
                return { ...prev, receitas: novasReceitas, bancos: novosBancos };
    
            } else { // Adding new
                const newReceita: Receita = {
                    id: Date.now(),
                    valor,
                    descricao: formData.plataforma,
                    categoria: 'delivery',
                    bancoId,
                    data: formData.data,
                    observacoes: formData.observacoes
                };
                const novasReceitas = [...prev.receitas, newReceita];
                const novosBancos = prev.bancos.map(b =>
                    b.id === bancoId ? { ...b, saldo: b.saldo + valor } : b
                );
                
                return { ...prev, receitas: novasReceitas, bancos: novosBancos };
            }
        });
    
        onClose();
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
                        <select name="bancoId" value={formData.bancoId} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg" required>
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
                    <Button type="submit" variant="success">Salvar</Button>
                </div>
            </form>
        </Modal>
    );
};

export default ReceitaModal;