// =====================================================
// Veterion - servidor estático simples para o frontend
// (usa apenas módulos nativos do Node, além do dotenv para ler o .env)
// =====================================================
const http = require('http');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const PORT = process.env.FRONTEND_PORT || 5500;
const RAIZ = path.join(__dirname, '..', 'frontend');

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

const servidor = http.createServer((req, res) => {
  let caminhoPedido = decodeURIComponent(req.url.split('?')[0]);
  if (caminhoPedido === '/') caminhoPedido = '/index.html';

  const caminhoArquivo = path.join(RAIZ, caminhoPedido);

  // Evita sair da pasta frontend (path traversal)
  if (!caminhoArquivo.startsWith(RAIZ)) {
    res.writeHead(400);
    return res.end('Requisição inválida.');
  }

  fs.readFile(caminhoArquivo, (erro, conteudo) => {
    if (erro) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Página não encontrada.');
    }
    const ext = path.extname(caminhoArquivo);
    res.writeHead(200, { 'Content-Type': TIPOS[ext] || 'application/octet-stream' });
    res.end(conteudo);
  });
});

servidor.listen(PORT, () => {
  console.log(`[veterion] Frontend servido em http://localhost:${PORT}`);
});

module.exports = servidor;
