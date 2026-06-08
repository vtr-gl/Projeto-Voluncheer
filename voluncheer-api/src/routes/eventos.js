const express = require('express');
const router = express.Router();
const {
  listarEventos, buscarEvento,
  criarEvento, editarEvento, deletarEvento
} = require('../controllers/eventoController');
const { autenticar, apenasOng } = require('../middleware/auth');

// Públicas
router.get('/',    listarEventos);
router.get('/:id', buscarEvento);

// Protegidas (ONG)
router.post('/',    autenticar, apenasOng, criarEvento);
router.put('/:id',  autenticar, apenasOng, editarEvento);
router.delete('/:id', autenticar, apenasOng, deletarEvento);

module.exports = router;
