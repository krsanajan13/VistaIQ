const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const API_DIR = path.join(__dirname, 'api');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Route mapping for API handlers
const apiRoutes = {
  '/api/console/ask': require('./api/console/ask'),
  '/api/console/forecast': require('./api/console/forecast'),
  '/api/console/anomaly': require('./api/console/anomaly'),
  '/api/concierge/plan': require('./api/concierge/plan')
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  console.log(`${req.method} ${pathname}`);

  // Handle API requests
  if (req.method === 'POST' && apiRoutes[pathname]) {
    let bodyStr = '';
    req.on('data', chunk => {
      bodyStr += chunk;
    });

    req.on('end', async () => {
      try {
        const body = bodyStr ? JSON.parse(bodyStr) : {};
        
        // Mock request object to match Vercel serverless request signature
        const mockReq = {
          method: req.method,
          body: body,
          headers: req.headers,
          query: Object.fromEntries(url.searchParams)
        };

        // Mock response object to match Vercel serverless response signature
        const mockRes = {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          status(code) {
            this.statusCode = code;
            return this;
          },
          json(data) {
            res.writeHead(this.statusCode, this.headers);
            res.end(JSON.stringify(data));
            return this;
          }
        };

        // Execute function handler
        await apiRoutes[pathname](mockReq, mockRes);
      } catch (err) {
        console.error(`API Error in ${pathname}:`, err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Internal Server Error', error: err.message }));
      }
    });
    return;
  }

  // Handle pre-flight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    });
    res.end();
    return;
  }

  // Handle static file requests (GET / HEAD)
  if (req.method === 'GET' || req.method === 'HEAD') {
    let filePath = path.join(PUBLIC_DIR, pathname);
    
    // Default to index.html or handle SPA fallback rewriting (like in vercel.json)
    if (pathname === '/' || !path.extname(filePath)) {
      filePath = path.join(PUBLIC_DIR, 'index.html');
    }

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        // Fall back to index.html for SPA router (matching vercel.json rewrite rule)
        const fallbackPath = path.join(PUBLIC_DIR, 'index.html');
        fs.stat(fallbackPath, (err2, stats2) => {
          if (err2 || !stats2.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
          } else {
            serveFile(fallbackPath, res);
          }
        });
      } else {
        serveFile(filePath, res);
      }
    });
    return;
  }

  // Fallback
  res.writeHead(405, { 'Content-Type': 'text/plain' });
  res.end('Method Not Allowed');
});

function serveFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  res.writeHead(200, { 
    'Content-Type': contentType,
    'Access-Control-Allow-Origin': '*'
  });
  
  const stream = fs.createReadStream(filePath);
  stream.on('error', (err) => {
    console.error('File stream error:', err);
    if (!res.writableEnded) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
    }
  });
  stream.pipe(res);
}

server.listen(PORT, () => {
  console.log(`VistaIQ local development server running at http://localhost:${PORT}`);
});
