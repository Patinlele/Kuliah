const http = require('http');
const fs = require('fs');
const querystring = require('querystring');

const DATA_FILE = 'data.json';

function loadData() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, '[]');
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    fs.readFile('index.html', 'utf-8', (err, content) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error loading file');
      } else {
        const data = loadData();
        const rows = data.map(item => `
          <tr>
            <td>${item.id}</td>
            <td>${item.judul}</td>
            <td>${item.tahunRilis}</td>
            <td>${item.penulis}</td>
            <td>${item.penerbit}</td>
            <td>${item.genre}</td>
          </tr>
        `).join('');

        const html = content.replace('<!--TABEL-->', `
          <h2>Daftar Data</h2>
          <table>
            <tr>
              <th>ID</th>
              <th>Judul Buku</th>
              <th>Tahun Rilis</th>
              <th>Penulis Buku</th>
              <th>Penerbit</th>
              <th>Genre</th>
            </tr>
            ${rows}
          </table>
        `);

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
      }
    });
  } else if (req.method === 'POST' && req.url === '/create') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      const parsed = querystring.parse(body);
      const data = loadData();

      const newEntry = {
        id: data.length ? data[data.length - 1].id + 1 : 1,
        judul: parsed.judul,
        tahunRilis: parsed.tahunRilis,
        penulis: parsed.penulis,
        penerbit: parsed.penerbit,
        genre: parsed.genre
      };

      data.push(newEntry);
      saveData(data);

      res.writeHead(302, { Location: '/' });
      res.end();
    });
  } else if (req.method === 'GET' && req.url === '/background.jpg') {
    fs.readFile('background.jpg', (err, content) => {
      if (err) {
        res.writeHead(404);
        res.end();
      } else {
        res.writeHead(200, { 'Content-Type': 'image/jpeg' });
        res.end(content);
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(3000, () => {
  console.log('Server berjalan di http://localhost:3000');
});
