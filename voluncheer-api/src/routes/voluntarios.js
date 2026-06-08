const express = require('express');
const router = express.Router();
const { meuPerfil, editarPerfil } = require('../controllers/voluntarioController');
const { autenticar, apenasVoluntario } = require('../middleware/auth');

router.get('/perfil', autenticar, apenasVoluntario, meuPerfil);
router.put('/perfil', autenticar, apenasVoluntario, editarPerfil);

module.exports = router;
