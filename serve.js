#!/usr/bin/env node
/**
 * Simple HTTP server for development
 * UPDATED COMMENTS: Node.js development server with ES6 modules support
 * SCALED FOR: Hot reload and proper MIME types
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// REUSED: MIME type mapping for web assets
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf'
};

/**
 * Get MIME type for file extension
 * UPDATED COMMENTS: Enhanced MIME type detection with fallback
 */
function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * Serve static files with proper headers
 * SCALED FOR: Development-friendly caching and CORS
 */
function serveFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found');
      return;
    }
    
    const mimeType = getMimeType(filePath);
    const headers = {
      'Content-Type': mimeType,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': '*'
    };
    
    // CRITICAL: No cache for development
    if (mimeType === 'application/javascript' || mimeType === 'text/css') {
      headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
      headers['Pragma'] = 'no-cache';
      headers['Expires'] = '0';
    }
    
    res.writeHead(200, headers);
    res.end(data);
  });
}

/**
 * Main request handler
 * REUSED: Standard HTTP server request handling
 */
function requestHandler(req, res) {
  // UPDATED COMMENTS: Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': '*'
    });
    res.end();
    return;
  }
  
  const parsedUrl = url.parse(req.url);
  let pathname = parsedUrl.pathname;
  
  // SCALED FOR: Default file serving
  if (pathname === '/') {
    pathname = '/index.html';
  }
  
  const filePath = path.join(__dirname, pathname);
  
  // CRITICAL: Security check - prevent directory traversal
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }
  
  // REUSED: File existence check
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found: ' + pathname);
      console.log('404:', pathname);
      return;
    }
    
    serveFile(res, filePath);
    console.log('200:', pathname);
  });
}

// ANCHOR: server_startup
const PORT = process.env.PORT || 8080;
const server = http.createServer(requestHandler);

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Debug page: http://localhost:${PORT}/debug.html`);
  console.log('Press Ctrl+C to stop');
});

// UPDATED COMMENTS: Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nServer stopped');
  process.exit(0);
});