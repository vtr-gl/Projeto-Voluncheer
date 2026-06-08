const { um, executar } = require('../database/db');

// GET /voluntarios/perfil — perfil do voluntário logado
function meuPerfil(req, res) {
  const voluntario = um(
    `SELECT v.*, u.ds_email FROM voluntario v
     JOIN usuario u ON v.id_usuario = u.id_usuario
     WHERE v.id_usuario = ?`,
    [req.usuario.id_usuario]
  );
  if (!voluntario) return res.status(404).json({ erro: 'Perfil não encontrado.' });
  res.json(voluntario);
}

// PUT /voluntarios/perfil — editar perfil
function editarPerfil(req, res) {
  const voluntario = um('SELECT * FROM voluntario WHERE id_usuario = ?', [req.usuario.id_usuario]);
  if (!voluntario) return res.status(404).json({ erro: 'Perfil não encontrado.' });

  const { nm_voluntario, tel_voluntario, dt_nascimento } = req.body;

  executar(
    `UPDATE voluntario SET
       nm_voluntario  = COALESCE(?, nm_voluntario),
       tel_voluntario = COALESCE(?, tel_voluntario),
       dt_nascimento  = COALESCE(?, dt_nascimento)
     WHERE id_voluntario = ?`,
    [nm_voluntario || null, tel_voluntario || null, dt_nascimento || null, voluntario.id_voluntario]
  );

  res.json({ mensagem: 'Perfil atualizado!' });
}

module.exports = { meuPerfil, editarPerfil };
