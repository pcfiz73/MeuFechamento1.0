// src/utils.ts
// IMPORTANTE: Este arquivo agora inclui as funções de utilidade
// e a inicialização do cliente Supabase.

import type { Receita, Despesa, Period } from './types';

// CORREÇÃO: Importa o pacote inteiro como 'supabasejs' para evitar o SyntaxError do ambiente
// Isso resolve o problema 'doesn't provide an export named: createClient' em alguns ambientes.
import * as supabasejs from '@supabase/supabase-js'; 

// ==========================================================
// 1. INICIALIZAÇÃO DO SUPABASE
// ==========================================================

// Lê as variáveis de ambiente com o prefixo VITE_ (o nome dado para o Vercel)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Checagem para evitar erros em caso de variáveis ausentes
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Erro de Configuração Supabase: As variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não foram carregadas. Verifique a configuração do Vercel.");
}

// Inicializa o cliente, chamando a função createClient do objeto importado
export const supabase = supabasejs.createClient(supabaseUrl, supabaseAnonKey);


// ==========================================================
// 2. FUNÇÕES DE UTILIDADE EXISTENTES (MANTIDAS)
// ==========================================================

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

export function formatDate(dateString: string): string {
  // Add T00:00:00 to ensure the date is parsed in the local timezone, not UTC
  return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR');
}

export function filterDataByPeriod<T extends { data: string }>(data: T[], period: Period): T[] {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    switch (period) {
        case 'hoje':
            return data.filter(item => new Date(item.data + 'T00:00:00').getTime() === now.getTime());
        case 'semana': {
            const firstDayOfWeek = new Date(now);
            firstDayOfWeek.setDate(now.getDate() - now.getDay());
            firstDayOfWeek.setHours(0,0,0,0);
            
            const lastDayOfWeek = new Date(firstDayOfWeek);
            lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
            lastDayOfWeek.setHours(23,59,59,999);

            return data.filter(item => {
                const itemDate = new Date(item.data + 'T00:00:00');
                return itemDate >= firstDayOfWeek && itemDate <= lastDayOfWeek;
            });
        }
        case 'mes':
            return data.filter(item => {
                const itemDate = new Date(item.data + 'T00:00:00');
                return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
            });
        default:
            return data;
    }
}