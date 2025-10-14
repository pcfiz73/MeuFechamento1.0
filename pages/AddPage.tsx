import React, { useState, useEffect, useContext } from 'react';
import { FinanceContext } from '../context/FinanceContext';
import Button from '../components/Button';
import Card from '../components/Card';
import type { Receita, Despesa, NewReceitaData, NewDespesaData, NewBancoData } from '../types';
import { RECEITA_PLATAFORMAS, DESPESA_CATEGORIAS } from '../constants';
import { formatCurrency } from '../utils';

const AddPage: React.FC = () => {
    const { financeData, addReceita, updateReceita, addDespesa, updateDespesa, addBanco, deleteBanco, pageContext, navigate, openModal } = useContext(FinanceContext);
    const { type, id } = pageContext || {};

    const [activeTab, setActiveTab] = useState<'receita' | 'despesa' | 'banco'>(type === 'despesa' ? 'despesa' : 'receita');
    const isEditing = Boolean(id);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [lastSubmittedTab, setLastSubmittedTab] = useState<'receita' | 'despesa' | 'banco' | null>(null);

    const getInitialReceitaState = () => ({
        valor: '', plataforma: 'iFood', banco_id: financeData.bancos.length > 0 ? String(financeData.bancos[0].id) : '',
        data: new Date().toISOString().split('T')[0], observacoes: '',
        tipoPagamento: 'unica', parcelaAtual: '', totalParcelas: ''
    });

    const getInitialDespesaState = () => ({
        valor: '', categoria: 'combustivel', banco_id: financeData.bancos.length > 0 ? String(financeData.bancos[0].id) : '',
        data: new Date().toISOString().split('T')[0], observacoes: '',
        tipoPagamento: 'unica', parcelaAtual: '', totalParcelas: ''
    });

    const getInitialBancoState = () => ({
        nome: '', saldo: ''
    });

    const [receitaForm, setReceitaForm] = useState(getInitialReceitaState());
    const [despesaForm, setDespesaForm] = useState(getInitialDespesaState());
    const [bancoForm, setBancoForm] = useState(getInitialBancoState());
    
    useEffect(() => {
        setIsSaved(false);
        const transacaoId = id ? parseInt(id, 10) : undefined;
        if (isEditing && transacaoId) {
            if (type === 'receita') {
                const receita = financeData.receitas.find(r => r.id === transacaoId);
                if (receita) {
                    let valorForm = receita.valor.toString();
                    const [parcelaAtual, totalParcelas] = receita.parcelamento?.split('/') || ['', ''];
                     if (receita.parcelamento && totalParcelas) {
                        const totalParcelasNum = parseInt(totalParcelas, 10);
                        if (!isNaN(totalParcelasNum) && totalParcelasNum > 0) {
                            valorForm = (receita.valor * totalParcelasNum).toFixed(2);
                        }
                    }
                    setActiveTab('receita');
                    setReceitaForm({
                        valor: valorForm,
                        plataforma: receita.descricao, banco_id: receita.banco_id.toString(),
                        data: receita.data, observacoes: receita.observacoes,
                        tipoPagamento: receita.parcelamento ? 'parcelado' : 'unica',
                        parcelaAtual, totalParcelas
                    });
                }
            } else if (type === 'despesa') {
                const despesa = financeData.despesas.find(d => d.id === transacaoId);
                if (despesa) {
                    let valorForm = despesa.valor.toString();
                    const [parcelaAtual, totalParcelas] = despesa.parcelamento?.split('/') || ['', ''];
                    if (despesa.parcelamento && totalParcelas) {
                        const totalParcelasNum = parseInt(totalParcelas, 10);
                        if (!isNaN(totalParcelasNum) && totalParcelasNum > 0) {
                             valorForm = (despesa.valor * totalParcelasNum).toFixed(2);
                        }
                    }
                    setActiveTab('despesa');
                    setDespesaForm({
                        valor: valorForm,
                        categoria: despesa.categoria, banco_id: despesa.banco_id.toString(),
                        data: despesa.data, observacoes: despesa.observacoes,
                        tipoPagamento: despesa.parcelamento ? 'parcelado' : 'unica',
                        parcelaAtual, totalParcelas
                    });
                }
            }
        } else {
            setReceitaForm(getInitialReceitaState());
            setDespesaForm(getInitialDespesaState());
            setBancoForm(getInitialBancoState());
            setActiveTab(type === 'despesa' ? 'despesa' : 'receita');
        }
    }, [id, type, isEditing, financeData]);


    const handleReceitaSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        let valor = parseFloat(receitaForm.valor);
        const banco_id = parseInt(receitaForm.banco_id);
        if (isNaN(valor) || isNaN(banco_id) || valor <= 0) {
            alert('Valores inválidos.');
            setIsSubmitting(false);
            return;
        }
        
        const parcelamento = receitaForm.tipoPagamento === 'parcelado' && receitaForm.parcelaAtual && receitaForm.totalParcelas
            ? `${receitaForm.parcelaAtual}/${receitaForm.totalParcelas}`
            : undefined;

        if (parcelamento) {
            const totalParcelasNum = parseInt(receitaForm.totalParcelas, 10);
            if (!isNaN(totalParcelasNum) && totalParcelasNum > 0) {
                valor = valor / totalParcelasNum;
            } else {
                 alert('Número total de parcelas inválido.');
                 setIsSubmitting(false);
                 return;
            }
        }


        try {
            if (isEditing && id) {
                const updatedReceita: Receita = { 
                    id: parseInt(id, 10),
                    valor, 
                    descricao: receitaForm.plataforma, 
                    categoria: 'delivery', 
                    banco_id, 
                    data: receitaForm.data, 
                    observacoes: receitaForm.observacoes,
                    parcelamento
                };
                await updateReceita(updatedReceita);
            } else {
                const newReceita: NewReceitaData = { 
                    valor, 
                    descricao: receitaForm.plataforma, 
                    banco_id, 
                    data: receitaForm.data, 
                    observacoes: receitaForm.observacoes,
                    parcelamento
                };
                await addReceita(newReceita);
            }
            setLastSubmittedTab('receita');
            setIsSaved(true);
        } catch(error) {
            console.error(error);
            alert("Erro ao salvar receita.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDespesaSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        let valor = parseFloat(despesaForm.valor);
        const banco_id = parseInt(despesaForm.banco_id);
        if (isNaN(valor) || isNaN(banco_id) || valor <= 0) {
            alert('Valores inválidos.');
            setIsSubmitting(false);
            return;
        }
        
        const parcelamento = despesaForm.tipoPagamento === 'parcelado' && despesaForm.parcelaAtual && despesaForm.totalParcelas
            ? `${despesaForm.parcelaAtual}/${despesaForm.totalParcelas}`
            : undefined;

        if (parcelamento) {
            const totalParcelasNum = parseInt(despesaForm.totalParcelas, 10);
            if (!isNaN(totalParcelasNum) && totalParcelasNum > 0) {
                valor = valor / totalParcelasNum;
            } else {
                 alert('Número total de parcelas inválido.');
                 setIsSubmitting(false);
                 return;
            }
        }

        try {
            if (isEditing && id) {
                 const updatedDespesa: Despesa = {
                    id: parseInt(id, 10),
                    valor,
                    categoria: despesaForm.categoria,
                    descricao: DESPESA_CATEGORIAS.find(c => c.value === despesaForm.categoria)?.label || 'Outros',
                    banco_id,
                    data: despesaForm.data,
                    observacoes: despesaForm.observacoes,
                    parcelamento
                 };
                 await updateDespesa(updatedDespesa);
            } else {
                const newDespesa: NewDespesaData = { 
                    valor,
                    categoria: despesaForm.categoria,
                    banco_id,
                    data: despesaForm.data,
                    observacoes: despesaForm.observacoes,
                    parcelamento
                };
                await addDespesa(newDespesa);
            }
            setLastSubmittedTab('despesa');
            setIsSaved(true);
        } catch(error: any) {
            console.error(error);
            alert(error.message || "Erro ao salvar despesa.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBancoSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const saldo = parseFloat(bancoForm.saldo);
        if (!bancoForm.nome.trim() || isNaN(saldo)) {
            alert('Nome ou saldo inválido.');
            setIsSubmitting(false);
            return;
        }

        try {
            const newBanco: NewBancoData = {
                nome: bancoForm.nome,
                saldo,
                conta: '' // 'conta' is not in the form, pass empty string
            };
            await addBanco(newBanco);
            setLastSubmittedTab('banco');
            setIsSaved(true);
        } catch (error) {
            console.error(error);
            alert("Erro ao cadastrar banco.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteBanco = async (id: number) => {
        if (!window.confirm('Tem certeza que deseja excluir este banco? Contas com transações associadas não podem ser excluídas.')) {
            return;
        }
        try {
            await deleteBanco(id);
        } catch (error: any) {
            console.error("Erro ao deletar banco:", error);
            alert(error.message || 'Falha ao excluir banco.');
        }
    };
    
    const handleAddAnother = () => {
        setIsSaved(false);
        setReceitaForm(getInitialReceitaState());
        setDespesaForm(getInitialDespesaState());
        setBancoForm(getInitialBancoState());
        navigate('add'); 
    };

    if (isSaved) {
        return (
            <div className="animate-slide-up h-full flex items-center justify-center">
                <Card className="text-center p-8 max-w-md w-full">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-check text-3xl text-green-500"></i>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">
                        {lastSubmittedTab === 'banco' ? 'Banco Salvo!' : 'Transação Salva!'}
                    </h2>
                    <p className="text-slate-500 mb-6">O que você gostaria de fazer agora?</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button variant="secondary" className="w-full" onClick={handleAddAnother}>
                            Adicionar Outro
                        </Button>
                        <Button 
                            variant="primary" 
                            className="w-full" 
                            onClick={() => navigate(lastSubmittedTab === 'banco' ? 'dashboard' : 'reports')}
                        >
                            {lastSubmittedTab === 'banco' ? 'Ver Dashboard' : 'Ver Histórico'}
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="animate-slide-up space-y-6">
            <h1 className="text-3xl font-bold text-slate-800 text-center">{isEditing ? 'Editar Transação' : 'Adicionar'}</h1>
            <Card>
                <div className="flex border-b border-slate-200 mb-6">
                    <button
                        disabled={isEditing}
                        onClick={() => setActiveTab('receita')}
                        className={`flex-1 py-3 font-semibold text-center flex items-center justify-center gap-2 transition-colors ${
                            activeTab === 'receita' ? 'text-green-600 border-b-2 border-green-600' : 'text-slate-500 hover:text-green-500'
                        }`}
                    >
                        <i className="fas fa-plus-circle"></i>
                        <span>Receita</span>
                    </button>
                    <button
                        disabled={isEditing}
                        onClick={() => setActiveTab('despesa')}
                        className={`flex-1 py-3 font-semibold text-center flex items-center justify-center gap-2 transition-colors ${
                            activeTab === 'despesa' ? 'text-red-600 border-b-2 border-red-600' : 'text-slate-500 hover:text-red-500'
                        }`}
                    >
                        <i className="fas fa-minus-circle"></i>
                        <span>Despesa</span>
                    </button>
                    <button
                        disabled={isEditing}
                        onClick={() => setActiveTab('banco')}
                        className={`flex-1 py-3 font-semibold text-center flex items-center justify-center gap-2 transition-colors ${
                            activeTab === 'banco' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-blue-500'
                        }`}
                    >
                        <i className="fas fa-university"></i>
                        <span>Banco</span>
                    </button>
                </div>

                {activeTab === 'receita' && (
                    <form onSubmit={handleReceitaSubmit} className="space-y-4">
                        <div className="form-group">
                            <label className="block text-sm font-medium text-slate-600 mb-1">
                                {receitaForm.tipoPagamento === 'parcelado' ? 'Valor Total (R$)' : 'Valor (R$)'}
                            </label>
                            <input type="number" value={receitaForm.valor} onChange={e => setReceitaForm(f => ({...f, valor: e.target.value}))} step="0.01" min="0" className="w-full p-2 border border-slate-300 rounded-lg" required />
                        </div>
                        <div className="form-group">
                            <label className="block text-sm font-medium text-slate-600 mb-1">Tipo de Pagamento</label>
                            <select value={receitaForm.tipoPagamento} onChange={e => setReceitaForm(f => ({...f, tipoPagamento: e.target.value}))} className="w-full p-2 border border-slate-300 rounded-lg">
                                <option value="unica">Parcela Única</option>
                                <option value="parcelado">Parcelado</option>
                            </select>
                        </div>
                        {receitaForm.tipoPagamento === 'parcelado' && (
                            <div className="space-y-4 animate-slide-up">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="form-group">
                                        <label className="block text-sm font-medium text-slate-600 mb-1">Parcela Atual</label>
                                        <input type="number" value={receitaForm.parcelaAtual} onChange={e => setReceitaForm(f => ({...f, parcelaAtual: e.target.value}))} min="1" className="w-full p-2 border border-slate-300 rounded-lg" placeholder="Ex: 1" required />
                                    </div>
                                    <div className="form-group">
                                        <label className="block text-sm font-medium text-slate-600 mb-1">Total de Parcelas</label>
                                        <input type="number" value={receitaForm.totalParcelas} onChange={e => setReceitaForm(f => ({...f, totalParcelas: e.target.value}))} min="1" className="w-full p-2 border border-slate-300 rounded-lg" placeholder="Ex: 3" required />
                                    </div>
                                </div>
                                 {parseFloat(receitaForm.valor) > 0 && parseInt(receitaForm.totalParcelas) > 0 && (
                                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
                                        <span className="text-sm font-medium text-slate-600">Valor de cada parcela: </span>
                                        <span className="font-bold text-blue-600">
                                            {formatCurrency(parseFloat(receitaForm.valor) / parseInt(receitaForm.totalParcelas))}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="form-group">
                            <label className="block text-sm font-medium text-slate-600 mb-1">Plataforma</label>
                            <select value={receitaForm.plataforma} onChange={e => setReceitaForm(f => ({...f, plataforma: e.target.value}))} className="w-full p-2 border border-slate-300 rounded-lg" required>
                                {RECEITA_PLATAFORMAS.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="block text-sm font-medium text-slate-600 mb-1">Banco de Destino</label>
                            <select value={receitaForm.banco_id} onChange={e => setReceitaForm(f => ({...f, banco_id: e.target.value}))} className="w-full p-2 border border-slate-300 rounded-lg" required>
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
                            <Button type="submit" variant="success" disabled={isSubmitting}>
                                {isSubmitting ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Adicionar Receita')}
                            </Button>
                        </div>
                    </form>
                )}

                {activeTab === 'despesa' && (
                    <form onSubmit={handleDespesaSubmit} className="space-y-4">
                        <div className="form-group">
                            <label className="block text-sm font-medium text-slate-600 mb-1">
                                 {despesaForm.tipoPagamento === 'parcelado' ? 'Valor Total (R$)' : 'Valor (R$)'}
                            </label>
                            <input type="number" value={despesaForm.valor} onChange={e => setDespesaForm(f => ({...f, valor: e.target.value}))} step="0.01" min="0" className="w-full p-2 border border-slate-300 rounded-lg" required />
                        </div>
                         <div className="form-group">
                            <label className="block text-sm font-medium text-slate-600 mb-1">Tipo de Pagamento</label>
                            <select value={despesaForm.tipoPagamento} onChange={e => setDespesaForm(f => ({...f, tipoPagamento: e.target.value}))} className="w-full p-2 border border-slate-300 rounded-lg">
                                <option value="unica">Parcela Única</option>
                                <option value="parcelado">Parcelado</option>
                            </select>
                        </div>
                        {despesaForm.tipoPagamento === 'parcelado' && (
                            <div className="space-y-4 animate-slide-up">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="form-group">
                                        <label className="block text-sm font-medium text-slate-600 mb-1">Parcela Atual</label>
                                        <input type="number" value={despesaForm.parcelaAtual} onChange={e => setDespesaForm(f => ({...f, parcelaAtual: e.target.value}))} min="1" className="w-full p-2 border border-slate-300 rounded-lg" placeholder="Ex: 1" required />
                                    </div>
                                    <div className="form-group">
                                        <label className="block text-sm font-medium text-slate-600 mb-1">Total de Parcelas</label>
                                        <input type="number" value={despesaForm.totalParcelas} onChange={e => setDespesaForm(f => ({...f, totalParcelas: e.target.value}))} min="1" className="w-full p-2 border border-slate-300 rounded-lg" placeholder="Ex: 3" required />
                                    </div>
                                </div>
                                {parseFloat(despesaForm.valor) > 0 && parseInt(despesaForm.totalParcelas) > 0 && (
                                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
                                        <span className="text-sm font-medium text-slate-600">Valor de cada parcela: </span>
                                        <span className="font-bold text-blue-600">
                                            {formatCurrency(parseFloat(despesaForm.valor) / parseInt(despesaForm.totalParcelas))}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="form-group">
                            <label className="block text-sm font-medium text-slate-600 mb-1">Categoria</label>
                            <select value={despesaForm.categoria} onChange={e => setDespesaForm(f => ({...f, categoria: e.target.value}))} className="w-full p-2 border border-slate-300 rounded-lg" required>
                                {DESPESA_CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="block text-sm font-medium text-slate-600 mb-1">Banco de Origem</label>
                            <select value={despesaForm.banco_id} onChange={e => setDespesaForm(f => ({...f, banco_id: e.target.value}))} className="w-full p-2 border border-slate-300 rounded-lg" required>
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
                            <Button type="submit" variant="danger" disabled={isSubmitting}>
                                {isSubmitting ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Adicionar Despesa')}
                            </Button>
                        </div>
                    </form>
                )}

                {activeTab === 'banco' && (
                    <div className="space-y-6">
                        <form onSubmit={handleBancoSubmit} className="space-y-4">
                            <div className="form-group">
                                <label className="block text-sm font-medium text-slate-600 mb-1">Nome do Banco</label>
                                <input type="text" value={bancoForm.nome} onChange={e => setBancoForm(f => ({...f, nome: e.target.value}))} className="w-full p-2 border border-slate-300 rounded-lg" required placeholder="Ex: Caixa"/>
                            </div>
                            <div className="form-group">
                                <label className="block text-sm font-medium text-slate-600 mb-1">Saldo Inicial (R$)</label>
                                <input type="number" value={bancoForm.saldo} onChange={e => setBancoForm(f => ({...f, saldo: e.target.value}))} step="0.01" min="0" className="w-full p-2 border border-slate-300 rounded-lg" required placeholder="Ex: 100.50"/>
                            </div>
                            <div className="flex justify-end pt-4 gap-4">
                                <Button type="button" variant="secondary" onClick={() => openModal('transferencia')}>
                                    Transferir Saldo
                                </Button>
                                <Button type="submit" variant="primary" disabled={isSubmitting}>
                                    {isSubmitting ? 'Cadastrando...' : 'Cadastrar Banco'}
                                </Button>
                            </div>
                        </form>
                        
                        <div className="pt-6 border-t border-slate-200">
                            <h3 className="text-lg font-bold text-slate-800 mb-4">Minhas Contas</h3>
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                {financeData.bancos.length > 0 ? (
                                    financeData.bancos.map(banco => (
                                        <div key={banco.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
                                            <span className="font-medium text-slate-700">{banco.nome}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-green-600">{formatCurrency(banco.saldo)}</span>
                                                <div className="flex items-center">
                                                    <button
                                                        onClick={() => openModal('banco', banco)}
                                                        className="text-slate-400 hover:text-blue-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition"
                                                        aria-label={`Editar conta ${banco.nome}`}
                                                    >
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteBanco(banco.id)}
                                                        className="text-slate-400 hover:text-red-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition"
                                                        aria-label={`Excluir conta ${banco.nome}`}
                                                    >
                                                        <i className="fas fa-trash-alt"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-slate-500 py-4">Nenhum banco cadastrado.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default AddPage;