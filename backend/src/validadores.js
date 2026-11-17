// =====================================================
// Veterion - validadores
// =====================================================

// Valida o CPF pelo algoritmo oficial dos dígitos verificadores
// (o sistema original só checava "11 dígitos", aceitando CPFs inválidos).
function cpfValido(cpfLimpo) {
  if (!cpfLimpo || cpfLimpo.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpfLimpo)) return false; // 00000000000, 11111111111, etc.

  const digitos = cpfLimpo.split('').map(Number);
  const calcularDigito = (fatiaDigitos, pesoInicial) => {
    const soma = fatiaDigitos.reduce((acc, d, i) => acc + d * (pesoInicial - i), 0);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const d1 = calcularDigito(digitos.slice(0, 9), 10);
  const d2 = calcularDigito(digitos.slice(0, 9).concat(d1), 11);
  return d1 === digitos[9] && d2 === digitos[10];
}

// Validação simples e suficiente de formato de e-mail (evita cadastros claramente inválidos).
function emailValido(email) {
  if (!email) return true; // e-mail é opcional
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

module.exports = { cpfValido, emailValido };
