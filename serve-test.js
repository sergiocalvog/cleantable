const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 8080;
const FILE_PATH = path.join(__dirname, 'test-page.html');

const server = http.createServer((req, res) => {
  let targetFile = 'test-page.html';
  if (req.url === '/en' || req.url === '/test-page-en.html') {
    targetFile = 'test-page-en.html';
  } else if (req.url !== '/' && req.url !== '/test-page.html' && !req.url.startsWith('/?')) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Ruta no encontrada');
    return;
  }

  const filePath = path.join(__dirname, targetFile);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`Error al leer ${targetFile}`);
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log('====================================================');
  console.log(` Servidor de pruebas iniciado con éxito:`);
  console.log(` URL: ${url}`);
  console.log(' Abre esa URL en Chrome con la extensión cargada.');
  console.log(' Presiona Ctrl + C para detener el servidor.');
  console.log('====================================================');

  // Intentar abrir automáticamente en el navegador predeterminado (Windows)
  exec(`start ${url}`, (err) => {
    // Si falla el comando de apertura automática, no interrumpe el servidor
  });
});
