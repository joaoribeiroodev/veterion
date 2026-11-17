// =====================================================
// Veterion - utilitários de criptografia
// Hash com salt aleatório (scrypt) para dados sensíveis (senha e CPF):
// o valor original não pode ser recuperado a partir do que é salvo.
// Formato salvo:  salt:hash
// =====================================================
const crypto = require('crypto');

// Pepper fixo usado apenas no hash DETERMINÍSTICO de busca (cpf_busca).
// Pode (e deve) ser sobrescrito em produção via variável de ambiente.
const PEPPER = process.env.VETERION_PEPPER || 'veterion-dev-pepper-troque-em-producao';

function hashSensivel(texto) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(texto, salt, 32).toString('hex');
  return `${salt}:${hash}`;
}

function confereSensivel(texto, guardado) {
  if (!guardado || !guardado.includes(':')) return false;
  const [salt, hash] = guardado.split(':');
  try {
    const novo = crypto.scryptSync(texto, salt, 32);
    const antigo = Buffer.from(hash, 'hex');
    return novo.length === antigo.length && crypto.timingSafeEqual(novo, antigo);
  } catch {
    return false;
  }
}

// Hash determinístico (HMAC-SHA256) usado SOMENTE para permitir checar duplicidade
// de CPF sem guardar o CPF em texto puro nem o tornar reversível.
function hashBusca(texto) {
  return crypto.createHmac('sha256', PEPPER).update(String(texto)).digest('hex');
}

const soDigitos = (s) => String(s || '').replace(/\D/g, '');

module.exports = { hashSensivel, confereSensivel, hashBusca, soDigitos };
