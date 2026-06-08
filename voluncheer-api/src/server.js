require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { criarTabelas } = require('./database/schema');

const app = express();

app.use(cors());
app.use(express.json());

// Rotas
app.use('/auth',        require('./routes/auth'));
app.use('/ongs',        require('./routes/ongs'));
app.use('/eventos',     require('./routes/eventos'));
app.use('/inscricoes',  require('./routes/inscricoes'));
app.use('/voluntarios', require('./routes/voluntarios'));

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', mensagem: 'API Voluncheer rodando 🌱' });
});

// 404
app.use((req, res) => res.status(404).json({ erro: 'Rota não encontrada.' }));

const PORT = process.env.PORT || 3000;

criarTabelas().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  });
});
