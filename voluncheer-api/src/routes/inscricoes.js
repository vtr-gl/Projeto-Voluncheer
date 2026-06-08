const express = require('express');
const router = express.Router();
const {
  inscrever, minhasInscricoes, inscricoesDoEvento,
  cancelarInscricao, atualizarStatus
} = require('../controllers/inscricaoController');
const { autenticar, apenasOng, apenasVoluntario } = require('../middleware/auth');

// Voluntário
router.post('/',              autenticar, apenasVoluntario, inscrever);
router.get('/minhas',         autenticar, apenasVoluntario, minhasInscricoes);
router.patch('/:id/cancelar', autenticar, apenasVoluntario, cancelarInscricao);

// ONG
router.get('/evento/:id_evento', autenticar, apenasOng, inscricoesDoEvento);
router.patch('/:id/status',      autenticar, apenasOng, atualizarStatus);

module.exports = router;
