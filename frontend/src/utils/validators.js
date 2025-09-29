// src/utils/validators.js

/**
 * Validar CNPJ
 * @param {string} cnpj - CNPJ para validar
 * @returns {boolean} True se válido
 */
export const validateCNPJ = (cnpj) => {
  if (!cnpj) return false;
  
  const cleaned = cnpj.replace(/\D/g, '');
  
  if (cleaned.length !== 14) return false;
  
  // Verificar CNPJs inválidos conhecidos
  if (/^(\d)\1{13}$/.test(cleaned)) return false;
  
  // Validar dígitos verificadores
  let size = cleaned.length - 2;
  let numbers = cleaned.substring(0, size);
  const digits = cleaned.substring(size);
  let sum = 0;
  let pos = size - 7;
  
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;
  
  size = size + 1;
  numbers = cleaned.substring(0, size);
  sum = 0;
  pos = size - 7;
  
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return false;
  
  return true;
};

/**
 * Validar se data é passada
 * @param {string|Date} date - Data para validar
 * @returns {boolean} True se passada
 */
export const isPastDate = (date) => {
  if (!date) return false;
  
  const d = new Date(date);
  const now = new Date();
  
  return d < now;
};

/**
 * Validar se data é futura
 * @param {string|Date} date - Data para validar
 * @returns {boolean} True se futura
 */
export const isFutureDate = (date) => {
  if (!date) return false;
  
  const d = new Date(date);
  const now = new Date();
  
  return d > now;
};

/**
 * Validar número de nota fiscal
 * @param {string} nf - Número da nota fiscal
 * @returns {boolean} True se válido
 */
export const validateNF = (nf) => {
  if (!nf) return false;
  
  const cleaned = nf.replace(/\D/g, '');
  return cleaned.length >= 1 && cleaned.length <= 20;
};

/**
 * Validar placa de veículo brasileira
 * @param {string} placa - Placa do veículo
 * @returns {boolean} True se válido
 */
export const validatePlaca = (placa) => {
  if (!placa) return false;
  
  const cleaned = placa.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  
  // Placa antiga: ABC1234
  const oldFormat = /^[A-Z]{3}\d{4}$/;
  // Placa Mercosul: ABC1D23
  const mercosulFormat = /^[A-Z]{3}\d[A-Z]\d{2}$/;
  
  return oldFormat.test(cleaned) || mercosulFormat.test(cleaned);
};

/**
 * Validar senha forte
 * @param {string} password - Senha para validar
 * @param {number} minLength - Tamanho mínimo
 * @returns {object} Objeto com resultado e mensagem
 */
export const validatePassword = (password, minLength = 8) => {
  if (!password) {
    return { valid: false, message: 'Senha é obrigatória' };
  }
  
  if (password.length < minLength) {
    return { valid: false, message: `Senha deve ter no mínimo ${minLength} caracteres` };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Senha deve conter ao menos uma letra maiúscula' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Senha deve conter ao menos uma letra minúscula' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Senha deve conter ao menos um número' };
  }
  
  if (!/[^A-Za-z0-9]/.test(password)) {
    return { valid: false, message: 'Senha deve conter ao menos um caractere especial' };
  }
  
  return { valid: true, message: 'Senha válida' };
};

/**
 * Validar URL
 * @param {string} url - URL para validar
 * @returns {boolean} True se válido
 */
export const validateURL = (url) => {
  if (!url) return false;
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validar número positivo
 * @param {number|string} value - Valor para validar
 * @returns {boolean} True se válido
 */
export const validatePositiveNumber = (value) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return !isNaN(num) && num > 0;
};

/**
 * Validar intervalo numérico
 * @param {number} value - Valor para validar
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @returns {boolean} True se válido
 */
export const validateRange = (value, min, max) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return !isNaN(num) && num >= min && num <= max;
};

/**
 * Validar CPF
 * @param {string} cpf - CPF para validar
 * @returns {boolean} True se válido
 */
export const validateCPF = (cpf) => {
  if (!cpf) return false;
  
  const cleaned = cpf.replace(/\D/g, '');
  
  if (cleaned.length !== 11) return false;
  
  // Verificar CPFs inválidos conhecidos
  if (/^(\d)\1{10}$/.test(cleaned)) return false;
  
  // Validar dígitos verificadores
  let sum = 0;
  let remainder;
  
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleaned.substring(i - 1, i)) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.substring(9, 10))) return false;
  
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleaned.substring(i - 1, i)) * (12 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.substring(10, 11))) return false;
  
  return true;
};

/**
 * Validar email
 * @param {string} email - Email para validar
 * @returns {boolean} True se válido
 */
export const validateEmail = (email) => {
  if (!email) return false;
  
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Validar telefone brasileiro
 * @param {string} phone - Telefone para validar
 * @returns {boolean} True se válido
 */
export const validatePhone = (phone) => {
  if (!phone) return false;
  
  const cleaned = phone.replace(/\D/g, '');
  
  // Celular: 11 dígitos (DDD + 9 + 8 dígitos)
  // Fixo: 10 dígitos (DDD + 8 dígitos)
  return cleaned.length === 10 || cleaned.length === 11;
};

/**
 * Validar CEP
 * @param {string} cep - CEP para validar
 * @returns {boolean} True se válido
 */
export const validateCEP = (cep) => {
  if (!cep) return false;
  
  const cleaned = cep.replace(/\D/g, '');
  return cleaned.length === 8;
};

/**
 * Validar UF (estado brasileiro)
 * @param {string} uf - UF para validar
 * @returns {boolean} True se válido
 */
export const validateUF = (uf) => {
  const ufs = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];
  
  return uf && ufs.includes(uf.toUpperCase());
};

/**
 * Validar data
 * @param {string} date - Data para validar (formato: DD/MM/YYYY ou YYYY-MM-DD)
 * @returns {boolean} True se válido
 */
export const validateDate = (date) => {
  if (!date) return false;
  
  const d = new Date(date);
  return !isNaN(d.getTime());
};