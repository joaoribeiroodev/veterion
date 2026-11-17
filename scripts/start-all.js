// =====================================================
// Veterion - sobe a API e o frontend juntos com um único `npm start`
// =====================================================
const { spawn } = require('child_process');
const path = require('path');

const RAIZ = path.join(__dirname, '..');

function iniciarProcesso(nome, comando, args, opcoes) {
  // No Windows, "npm" so e resolvido via shell (npm.cmd); "node" e um
  // executavel direto e nao precisa de shell. Usar shell:true aqui causaria
  // problemas com caminhos que contem espacos (ex.: "C:\\...\\2 - Sistemas\\..."),
  // ja que o shell do Windows (cmd.exe) concatena os argumentos sem escapa-los.
  const usaShell = process.platform === 'win32' && comando === 'npm';
  const proc = spawn(comando, args, { stdio: 'pipe', shell: usaShell, ...opcoes });

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
