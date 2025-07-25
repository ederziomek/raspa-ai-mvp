import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Porta do Railway ou 3000 como fallback
const PORT = process.env.PORT || 3000;

// Servir arquivos estáticos do build
app.use(express.static(path.join(__dirname, 'dist')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Raspa.ai Frontend' });
});

// Todas as rotas devem retornar o index.html (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Frontend rodando na porta ${PORT}`);
  console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

