import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import Button from '../Button';
import type { FinanceData, Despesa, Banco } from '../../types';
import { DESPESA_CATEGORIAS } from '../../constants';

interface DespesaModalProps {
    isOpen: boolean;
    onClose: () => void;
    despesa?: Despesa;
    bancos: Banco[];
    updateFinanceData: (updater: (prev: FinanceData) => FinanceData) => void;
}

const getInitialState = (bancos: Banco[]) => ({
    valor: '',
    categoria: 'combustivel',
    bancoId: bancos.length > 0 ? String(bancos[0].id) : '',
    data: new Date().toISOString().split('T')[0],
    observacoes: ''
});

const DespesaModal: React.FC<DespesaModalProps> = ({ isOpen, onClose, despesa, bancos, updateFinanceData }) => {
    const [formData, setFormData] = useState(getInitialState(bancos));

    useEffect(() => {
        if (isOpen) {
            if (despesa) {
                setFormData({
                    valor: despesa.valor?.toString() || '',
                    categoria: despesa.categoria,
                    bancoId: despesa.bancoId?.toString() || '',
                    data: despesa.data,
                    observacoes: despesa.observacoes
                });
            } else {
                setFormData(getInitialState(bancos));
            }
        }
    }, [despesa, isOpen, bancos]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const valor = parseFloat(formData.valor);
        const bancoId = parseInt(formData.bancoId);
    
        if (isNaN(valor) || isNaN(bancoId)) {
            alert('Valores inválidos.');
            return;
        }
        
        updateFinanceData(prev => {
            if (despesa) { // Editing
                const oldDespesa = prev.despesas.find(d => d.id === despesa.id);
                if (!oldDespesa) return prev;
    
                const bancoParaDebitar = prev.bancos.find(b => b.id === bancoId);
                // Temporarily add back old amount if bank is the same, to check if new transaction is possible
                const saldoAjustado = (bancoParaDebitar?.id === oldDespesa.bancoId) 
                    ? (bancoParaDebitar.saldo + oldDespesa.valor)
                    : bancoParaDebitar?.saldo;
    
                if (saldoAjustado === undefined || saldoAjustado < valor) {
                    alert(`Saldo insuficiente no banco ${bancoParaDebitar?.nome}.`);
                    return prev;
                }
    
                const novasDespesas = prev.despesas.map(d =>
                    d.id === despesa.id ? {
                        ...d,
                        valor,
                        categoria: formData.categoria,
                        descricao: DESPESA_CATEGORIAS.find(c => c.value === formData.categoria)?.label || 'Outros',
                        bancoId,
                        data: formData.data,
                        observacoes: formData.observacoes,
                    } : d
                );
    
                const novosBancos = prev.bancos.map(b => {
                    let newSaldo = b.saldo;
                    // Revert old value from old bank
                    if (b.id === oldDespesa.bancoId) {
                        newSaldo += oldDespesa.valor;
                    }
                    // Apply new value to new bank
                    if (b.id === bancoId) {
                        newSaldo -= valor;
                    }
                    return { ...b, saldo: newSaldo };
                });
                
                return { ...prev, despesas: novasDespesas, bancos: novosBancos };
    
            } else { // Adding new
                const bancoSelecionado = prev.bancos.find(b => b.id === bancoId);
                if (!bancoSelecionado || bancoSelecionado.saldo < valor) {
                    alert(`Saldo insuficiente no banco ${bancoSelecionado?.nome}.`);
                    return prev;
                }
    
                const newDespesa: Despesa = {
                    id: Date.now(),
                    valor,
                    categoria: formData.categoria,
                    descricao: DESPESA_CATEGORIAS.find(c => c.value === formData.categoria)?.label || 'Outros',
                    bancoId,
                    data: formData.data,
                    observacoes: formData.observacoes
                };
                const novasDespesas = [...prev.despesas, newDespesa];
                const novosBancos = prev.bancos.map(b =>
                    b.id === bancoId ? { ...b, saldo: b.saldo - valor } : b
                );
                
                return { ...prev, despesas: novasDespesas, bancos: novosBancos };
            }
        });
    
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={despesa ? 'Editar Despesa' : 'Adicionar Nova Despesa'}>
            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <div className="form-group">
                        <label className="block text-sm font-medium text-slate-600 mb-1">Valor (R$)</label>
                        <input type="number" name="valor" value={formData.valor} onChange={e => setFormData({...formData, valor: e.target.value})} step="0.01" min="0" className="w-full p-2 border border-slate-300 rounded-lg" required />
                    </div>
                    <div className="form-group">
                        <label className="block text-sm font-medium text-slate-600 mb-1">Categoria</label>
                        <select name="categoria" value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg" required>
                            {DESPESA_CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="block text-sm font-medium text-slate-600 mb-1">Banco de Origem</label>
                        <select name="bancoId" value={formData.bancoId} onChange={e => setFormData({...formData, bancoId: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg" required>
                            {bancos.map(b => <option key={b.id} value={b.id}>{b.nome}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="block text-sm font-medium text-slate-600 mb-1">Data</label>
                        <input type="date" name="data" value={formData.data} onChange={e => setFormData({...formData, data: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg" required />
                    </div>
                     <div className="form-group">
                        <label className="block text-sm font-medium text-slate-600 mb-1">Observações</label>
                        <textarea name="observacoes" value={formData.observacoes} onChange={e => setFormData({...formData, observacoes: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg h-24"></textarea>
                    </div>
                </div>
                <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-slate-200">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button type="submit" variant="danger">Salvar</Button>
                </div>
            </form>
        </Modal>
    );
};

export default DespesaModal;