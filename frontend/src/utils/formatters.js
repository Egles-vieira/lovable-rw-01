// src/utils/formatters.js

/**
 * Formata CNPJ: 00.000.000/0000-00
 */
export function formatCNPJ(value) {
  if (!value) return '';
  
  const cnpj = value.replace(/\D/g, '');
  
  if (cnpj.length <= 14) {
    return cnpj
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
  
  return cnpj.slice(0, 14)
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

/**
 * Formata CPF: 000.000.000-00
 */
export function formatCPF(value) {
  if (!value) return '';
  
  const cpf = value.replace(/\D/g, '');
  
  if (cpf.length <= 11) {
    return cpf
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
  
  return cpf.slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

/**
 * Formata Telefone: (00) 00000-0000 ou (00) 0000-0000
 */
export function formatPhone(value) {
  if (!value) return '';
  
  const phone = value.replace(/\D/g, '');
  
  if (phone.length <= 10) {
    return phone
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
  
  return phone
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 15);
}

/**
 * Formata CEP: 00000-000
 */
export function formatCEP(value) {
  if (!value) return '';
  
  const cep = value.replace(/\D/g, '');
  
  return cep
    .replace(/^(\d{5})(\d)/, '$1-$2')
    .slice(0, 9);
}

/**
 * Formata data para formato brasileiro: DD/MM/YYYY
 */
export function formatDate(value) {
  if (!value) return '';
  
  const date = new Date(value);
  
  if (isNaN(date.getTime())) return value;
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
}

/**
 * Formata data e hora: DD/MM/YYYY HH:MM
 */
export function formatDateTime(value) {
  if (!value) return '';
  
  const date = new Date(value);
  
  if (isNaN(date.getTime())) return value;
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * Formata moeda brasileira: R$ 1.234,56
 */
export function formatCurrency(value) {
  if (value === null || value === undefined) return 'R$ 0,00';
  
  const number = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(number)) return 'R$ 0,00';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(number);
}

/**
 * Formata número com separadores: 1.234.567
 */
export function formatNumber(value) {
  if (value === null || value === undefined) return '0';
  
  const number = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(number)) return '0';
  
  return new Intl.NumberFormat('pt-BR').format(number);
}

/**
 * Formata porcentagem: 12,34%
 */
export function formatPercentage(value, decimals = 2) {
  if (value === null || value === undefined) return '0%';
  
  const number = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(number)) return '0%';
  
  return `${number.toFixed(decimals).replace('.', ',')}%`;
}

/**
 * Formata peso: 1.234,56 kg
 */
export function formatWeight(value, unit = 'kg') {
  if (value === null || value === undefined) return `0 ${unit}`;
  
  const number = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(number)) return `0 ${unit}`;
  
  return `${new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(number)} ${unit}`;
}

/**
 * Remove formatação de CNPJ/CPF
 */
export function removeMask(value) {
  if (!value) return '';
  return value.replace(/\D/g, '');
}

/**
 * Trunca texto com reticências
 */
export function truncate(text, length = 50) {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

/**
 * Primeira letra maiúscula
 */
export function capitalize(text) {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Título (primeira letra de cada palavra maiúscula)
 */
export function titleCase(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Formata status para exibição
 */
export function formatStatus(status) {
  const statusMap = {
    'ativo': 'Ativo',
    'inativo': 'Inativo',
    'pendente': 'Pendente',
    'concluido': 'Concluído',
    'cancelado': 'Cancelado',
    'em_andamento': 'Em Andamento',
    'aguardando': 'Aguardando',
  };
  
  return statusMap[status] || capitalize(status);
}

/**
 * Formata tempo relativo (há X minutos, há X horas, etc)
 */
export function formatRelativeTime(date) {
  if (!date) return '';
  
  const now = new Date();
  const past = new Date(date);
  const diffInMs = now - past;
  const diffInMinutes = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMs / 3600000);
  const diffInDays = Math.floor(diffInMs / 86400000);
  
  if (diffInMinutes < 1) return 'Agora';
  if (diffInMinutes < 60) return `Há ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
  if (diffInHours < 24) return `Há ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
  if (diffInDays < 7) return `Há ${diffInDays} dia${diffInDays > 1 ? 's' : ''}`;
  if (diffInDays < 30) return `Há ${Math.floor(diffInDays / 7)} semana${Math.floor(diffInDays / 7) > 1 ? 's' : ''}`;
  
  return formatDate(date);
}

/**
 * Valida CNPJ
 */
export function isValidCNPJ(cnpj) {
  cnpj = cnpj.replace(/\D/g, '');
  
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1+$/.test(cnpj)) return false;
  
  let sum = 0;
  let factor = 5;
  
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnpj.charAt(i)) * factor;
    factor = factor === 2 ? 9 : factor - 1;
  }
  
  let digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (parseInt(cnpj.charAt(12)) !== digit) return false;
  
  sum = 0;
  factor = 6;
  
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cnpj.charAt(i)) * factor;
    factor = factor === 2 ? 9 : factor - 1;
  }
  
  digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  return parseInt(cnpj.charAt(13)) === digit;
}

/**
 * Valida CPF
 */
export function isValidCPF(cpf) {
  cpf = cpf.replace(/\D/g, '');
  
  if (cpf.length !== 11) return false;
  if (/^(\d)\1+$/.test(cpf)) return false;
  
  let sum = 0;
  
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  
  let digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (parseInt(cpf.charAt(9)) !== digit) return false;
  
  sum = 0;
  
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  
  digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  return parseInt(cpf.charAt(10)) === digit;
}

/**
 * Valida email
 */
export function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}