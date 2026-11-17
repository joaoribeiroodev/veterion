// =====================================================
// Veterion - sobe a API e o frontend juntos com um único `npm start`
// =====================================================
const { spawn } = require('child_process');
const path = require('path');

const RAIZ = path.join(__dirname, '..');

function iniciarProcesso(nome, comando, args, opcoes) {
  const proc = spawn(comando, args, { stdio: 'pipe', shell: process.platform === 'win32', ...opcoes });

  proc.stdout.on('data', (dado) => process.stdout.write(`[${nome}] ${dado}`));
  proc.stderr.on('data', (dado) => process.stderr.write(`[${nome}] ${dado}`));
  proc.on('exit', (codigo) => {
    console.log(`[${nome}] encerrado (código ${codigo}).`);
  });

  return proc;
}

console.log('[veterion] Iniciando backend (API) e frontend...');

const backend = iniciarProcesso('api', 'npm', ['start'], { cwd: path.join(RAIZ, 'backend') });
const frontend = iniciarProcesso('web', 'node', [path.join(RAIZ, 'scripts', 'serve-frontend.js')]);

function encerrarTudo() {
  console.log('\n[veterion] Encerrando...');
  backend.kill();
  frontend.kill();
  process.exit(0);
}

process.on('SIGINT', encerrarTudo);
process.on('SIGTERM', encerrarTudo);
