

// FIX: Export TABS constant to resolve import error in components/Sidebar.tsx
export const TABS = [
    { id: 'resumo', name: 'Resumo', icon: 'fa-chart-pie' },
    { id: 'receitas', name: 'Receitas', icon: 'fa-plus-circle' },
    { id: 'despesas', name: 'Despesas', icon: 'fa-minus-circle' },
    { id: 'bancos', name: 'Bancos', icon: 'fa-university' },
    { id: 'objetivos', name: 'Objetivos', icon: 'fa-bullseye' },
    { id: 'relatorios', name: 'Relatórios', icon: 'fa-chart-bar' }
] as const;

export const RECEITA_PLATAFORMAS = ['iFood', 'Rappi', 'Uber Eats', '99Food', 'James', 'Freelance', 'Outros'];
export const DESPESA_CATEGORIAS = [
    { value: 'combustivel', label: 'Combustível' },
    { value: 'alimentacao', label: 'Alimentação' },
    { value: 'manutencao', label: 'Manutenção' },
    { value: 'aluguel', label: 'Aluguel' },
    { value: 'pensao', label: 'Pensão Alimentícia' },
    { value: 'taxas', label: 'Taxas' },
    { value: 'outros', label: 'Outros' }
];