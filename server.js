const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const rootDir = __dirname;

const server = http.createServer((req, res) => {
  const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = reqUrl.pathname;

  // Enhance res object for Vercel Serverless Function compatibility
  res.status = function(code) {
    res.statusCode = code;
    return res;
  };
  res.json = function(data) {
    if (!res.getHeader('Content-Type')) {
      res.setHeader('Content-Type', 'application/json');
    }
    res.end(JSON.stringify(data));
    return res;
  };

  // Attach query params object to req.query
  const queryObj = {};
  reqUrl.searchParams.forEach((val, key) => {
    queryObj[key] = val;
  });
  req.query = queryObj;

  // SECURITY: Block direct access to raw data directory and json files
  if (pathname.startsWith('/api/data') || (pathname.endsWith('.json') && pathname !== '/package.json')) {
    return res.status(403).json({ found: false, message: 'Akses ditolak' });
  }

  // Route Vercel Serverless Functions in /api
  if (pathname === '/api/cek' || pathname === '/api/cek.js') {
    delete require.cache[require.resolve('./api/cek.js')];
    try {
      const handler = require('./api/cek.js');
      return handler(req, res);
    } catch (err) {
      console.error('API Error:', err);
      return res.status(500).json({ found: false, message: 'Internal Server Error' });
    }
  }

  // Serve static files
  let filePath = path.join(rootDir, pathname === '/' ? 'index.html' : pathname);
  
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(rootDir, 'index.html');
  }

  const ext = path.extname(filePath);
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml'
  };

  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Local dev server running at http://localhost:${PORT}`);
});
