const express = require('express');
const router = express.Router();
const { listarOngs, buscarOng, meuPerfil, editarPerfil } = require('../controllers/ongController');
const { autenticar, apenasOng } = require('../middleware/auth');

// Públicas
router.get('/',    listarOngs);
router.get('/:id', buscarOng);

// Protegidas (ONG logada)
router.get('/perfil',    autenticar, apenasOng, meuPerfil);
router.put('/perfil',    autenticar, apenasOng, editarPerfil);

module.exports = router;
