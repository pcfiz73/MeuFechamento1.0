import React, { useState, useEffect, useContext } from 'react';
import { FinanceContext } from '../context/FinanceContext';
import Button from '../components/Button';
import Card from '../components/Card';
import type { Receita, Despesa } from '../types';
import { RECEITA_PLATAFORMAS, DESPESA_CATEGORIAS } from '../constants';

const AddPage: React.FC = () => {
    const { financeData, updateFinanceData, pageContext, navigate } = useContext(FinanceContext);
    const { type, id } = pageContext || {};

    const [activeTab, setActiveTab] = useState<'receita' | 'despesa'>(type === 'despesa' ? 'despesa' : 'receita');
    const isEditing = Boolean(id);
    const [isSaved, setIsSaved] = useState(false);

    const getInitialReceitaState = () => ({
        valor: '', plataforma: 'iFood', bancoId: financeData.bancos.length > 0 ? String(financeData.bancos[0].id) : '',
        data: new Date().toISOString().split('T')[0], observacoes: ''
    });

    const getInitialDespesaState = () => ({
        valor: '', categoria: 'combustivel', bancoId: financeData.bancos.length > 0 ? String(financeData.bancos[0].id) : '',
        data: new Date().toISOString().split('T')[0], observacoes: ''
    });

    const [receitaForm, setReceitaForm] = useState(getInitialReceitaState());
    const [despesaForm, setDespesaForm] = useState(getInitialDespesaState());
    
    useEffect(() => {
        // Reset save state when context changes (e.g., new navigation to this page)
        setIsSaved(false);

        if (isEditing && id) {
            const transacaoId = parseInt(id, 10);
            if (type === 'receita') {
                const receita = financeData.receitas.find(r => r.id === transacaoId);
                if (receita) {
                    setActiveTab('receita');
                    setReceitaForm({
                        valor: receita.valor.toString(), plataforma: receita.descricao, bancoId: receita.bancoId.toString(),
                        data: receita.data, observacoes: receita.observacoes
                    });
                }
            } else if (type === 'despesa') {
                const despesa = financeData.despesas.find(d => d.id === transacaoId);
                if (despesa) {
                    setActiveTab('despesa');
                    setDespesaForm({
                        valor: despesa.valor.toString(), categoria: despesa.categoria, bancoId: despesa.bancoId.toString(),
                        data: despesa.data, observacoes: despesa.observacoes
                    });
                }
            }
        } else {
            // Reset forms for new entry
            setReceitaForm(getInitialReceitaState());
            setDespesaForm(getInitialDespesaState());
        }
    }, [id, type, isEditing, financeData.bancos, financeData.receitas, financeData.despesas]);


    const handleReceitaSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const valor = parseFloat(receitaForm.valor);
        const bancoId = parseInt(receitaForm.bancoId);
        if (isNaN(valor) || isNaN(bancoId)) return alert('Valores inválidos.');

        updateFinanceData(prev => {
            if (isEditing && id) {
                const oldReceita = prev.receitas.find(r => r.id === parseInt(id, 10));
                if (!oldReceita) return prev;

                const novasReceitas = prev.receitas.map(r => r.id === parseInt(id, 10) ? { ...r, valor, descricao: receitaForm.plataforma, bancoId, data: receitaForm.data, observacoes: receitaForm.observacoes } : r);
                const novosBancos = prev.bancos.map(b => {
                    let newSaldo = b.saldo;
                    if (b.id === oldReceita.bancoId) newSaldo -= oldReceita.valor;
                    if (b.id === bancoId) newSaldo += valor;
                    return { ...b, saldo: newSaldo };
                });
                return { ...prev, receitas: novasReceitas, bancos: novosBancos };
            } else {
                const newReceita: Receita = { id: Date.now(), valor, descricao: receitaForm.plataforma, categoria: 'delivery', bancoId, data: receitaForm.data, observacoes: receitaForm.observacoes };
                return { ...prev, receitas: [...prev.receitas, newReceita], bancos: prev.bancos.map(b => b.id === bancoId ? { ...b, saldo: b.saldo + valor } : b) };
            }
        });
        setIsSaved(true);
    };

    const handleDespesaSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const valor = parseFloat(despesaForm.valor);
        const bancoId = parseInt(despesaForm.bancoId);
        if (isNaN(valor) || isNaN(bancoId)) return alert('Valores inválidos.');

        updateFinanceData(prev => {
            const banco = prev.bancos.find(b => b.id === bancoId);
            if (isEditing && id) {
                 const oldDespesa = prev.despesas.find(d => d.id === parseInt(id, 10));
                 if (!oldDespesa || !banco) return prev;
                 
                 const saldoAjustado = (banco.id === oldDespesa.bancoId) ? (banco.saldo + oldDespesa.valor) : banco.saldo;
                 if (saldoAjustado < valor) {
                     alert(`Saldo insuficiente no banco ${banco?.nome}.`);
                     return prev;
                 }
                 const novasDespesas = prev.despesas.map(d => d.id === parseInt(id, 10) ? { ...d, valor, categoria: despesaForm.categoria, descricao: DESPESA_CATEGORIAS.find(c => c.value === despesaForm.categoria)?.label || 'Outros', bancoId, data: despesaForm.data, observacoes: despesaForm.observacoes } : d);
                 const novosBancos = prev.bancos.map(b => {
                    let newSaldo = b.saldo;
                    if (b.id === oldDespesa.bancoId) newSaldo += oldDespesa.valor;
                    if (b.id === bancoId) newSaldo -= valor;
                    return { ...b, saldo: newSaldo };
                });
                 return { ...prev, despesas: novasDespesas, bancos: novosBancos };
            } else {
                if (!banco || banco.saldo < valor) {
                    alert(`Saldo insuficiente no banco ${banco?.nome}.`);
                    return prev;
                }
                const newDespesa: Despesa = { id: Date.now(), valor, categoria: despesaForm.categoria, descricao: DESPESA_CATEGORIAS.find(c => c.value === despesaForm.categoria)?.label || 'Outros', bancoId, data: despesaForm.data, observacoes: despesaForm.observacoes };
                return { ...prev, despesas: [...prev.despesas, newDespesa], bancos: prev.bancos.map(b => b.id === bancoId ? { ...b, saldo: b.saldo - valor } : b) };
            }
        });
        setIsSaved(true);
    };
    
    const handleAddAnother = () => {
        setIsSaved(false);
        setReceitaForm(getInitialReceitaState());
        setDespesaForm(getInitialDespesaState());
        navigate('add'); 
    };

    if (isSaved) {
        return (
            <div className="animate-slide-up h-full flex items-center justify-center">
                <Card className="text-center p-8 max-w-md w-full">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-check text-3xl text-green-500"></i>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Transação Salva!</h2>
                    <p className="text-slate-500 mb-6">O que você gostaria de fazer agora?</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button variant="secondary" className="w-full" onClick={handleAddAnother}>
                            Adicionar Outra
                        </Button>
                        <Button variant="primary" className="w-full" onClick={() => navigate('reports')}>
                            Ver Histórico
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="animate-slide-up space-y-6">
            <h1 className="text-3xl font-bold text-slate-800">{isEditing ? 'Editar' : 'Adicionar'} Transação</h1>
            <Card>
                <div className="flex border-b border-slate-200 mb-6">
                    <button disabled={isEditing} onClick={() => setActiveTab('receita')} className={`flex-1 py-3 font-semibold text-center ${activeTab === 'receita' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}>Receita</button>
                    <button disabled={isEditing} onClick={() => setActiveTab('despesa')} className={`flex-1 py-3 font-semibold text-center ${activeTab === 'despesa' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}>Despesa</button>
                </div>

                {activeTab === 'receita' && (
                    <form onSubmit={handleReceitaSubmit} className="space-y-4">
                        <div className="form-group">
                            <label className="block text-sm font-medium text-slate-600 mb-1">Valor (R$)</label>
                            <input type="number" value={receitaForm.valor} onChange={e => setReceitaForm(f => ({...f, valor: e.target.value}))} step="0.01" min="0" className="w-full p-2 border border-slate-300 rounded-lg" required />
                        </div>
                        <div className="form-group">
                            <label className="block text-sm font-medium text-slate-600 mb-1">Plataforma</label>
                            <select value={receitaForm.plataforma} onChange={e => setReceitaForm(f => ({...f, plataforma: e.target.value}))} className="w-full p-2 border border-slate-300 rounded-lg" required>
                                {RECEITA_PLATAFORMAS.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="block text-sm font-medium text-slate-600 mb-1">Banco de Destino</label>
                            <select value={receitaForm.bancoId} onChange={e => setReceitaForm(f => ({...f, bancoId: e.target.value}))} className="w-full p-2 border border-slate-300 rounded-lg" required>
                                {financeData.bancos.map(b => <option key={b.id} value={b.id}>{b.nome}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="block text-sm font-medium text-slate-600 mb-1">Data</label>
                            <input type="date" value={receitaForm.data} onChange={e => setReceitaForm(f => ({...f, data: e.target.value}))} className="w-full p-2 border border-slate-300 rounded-lg" required />
                        </div>
                         <div className="form-group">
                            <label className="block text-sm font-medium text-slate-600 mb-1">Observações</label>
                            <textarea value={receitaForm.observacoes} onChange={e => setReceitaForm(f => ({...f, observacoes: e.target.value}))} className="w-full p-2 border border-slate-300 rounded-lg h-24"></textarea>
                        </div>
                        <div className="flex justify-end pt-4">
                            <Button type="submit" variant="success">{isEditing ? 'Salvar Alterações' : 'Adicionar Receita'}</Button>
                        </div>
                    </form>
                )}

                {activeTab === 'despesa' && (
                    <form onSubmit={handleDespesaSubmit} className="space-y-4">
                        <div className="form-group">
                            <label className="block text-sm font-medium text-slate-600 mb-1">Valor (R$)</label>
                            <input type="number" value={despesaForm.valor} onChange={e => setDespesaForm(f => ({...f, valor: e.target.value}))} step="0.01" min="0" className="w-full p-2 border border-slate-300 rounded-lg" required />
                        </div>
                        <div className="form-group">
                            <label className="block text-sm font-medium text-slate-600 mb-1">Categoria</label>
                            <select value={despesaForm.categoria} onChange={e => setDespesaForm(f => ({...f, categoria: e.target.value}))} className="w-full p-2 border border-slate-300 rounded-lg" required>
                                {DESPESA_CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="block text-sm font-medium text-slate-600 mb-1">Banco de Origem</label>
                            <select value={despesaForm.bancoId} onChange={e => setDespesaForm(f => ({...f, bancoId: e.target.value}))} className="w-full p-2 border border-slate-300 rounded-lg" required>
                                {financeData.bancos.map(b => <option key={b.id} value={b.id}>{b.nome}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="block text-sm font-medium text-slate-600 mb-1">Data</label>
                            <input type="date" value={despesaForm.data} onChange={e => setDespesaForm(f => ({...f, data: e.target.value}))} className="w-full p-2 border border-slate-300 rounded-lg" required />
                        </div>
                         <div className="form-group">
                            <label className="block text-sm font-medium text-slate-600 mb-1">Observações</label>
                            <textarea value={despesaForm.observacoes} onChange={e => setDespesaForm(f => ({...f, observacoes: e.target.value}))} className="w-full p-2 border border-slate-300 rounded-lg h-24"></textarea>
                        </div>
                         <div className="flex justify-end pt-4">
                            <Button type="submit" variant="danger">{isEditing ? 'Salvar Alterações' : 'Adicionar Despesa'}</Button>
                        </div>
                    </form>
                )}
            </Card>
        </div>
    );
};

export default AddPage;