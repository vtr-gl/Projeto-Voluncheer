const express = require('express');
const router = express.Router();
const { cadastroVoluntario, cadastroOng, login } = require('../controllers/authController');

// POST /auth/cadastro/voluntario
router.post('/cadastro/voluntario', cadastroVoluntario);

// POST /auth/cadastro/ong
router.post('/cadastro/ong', cadastroOng);

// POST /auth/login
router.post('/login', login);

module.exports = router;
