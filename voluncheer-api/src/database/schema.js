const { conectar, executar } = require('./db');

async function criarTabelas() {
  await conectar();

  // USUARIO — login e tipo (voluntario | ong)
  executar(`
    CREATE TABLE IF NOT EXISTS usuario (
      id_usuario    INTEGER PRIMARY KEY AUTOINCREMENT,
      ds_email      VARCHAR(120) NOT NULL UNIQUE,
      ds_senha_hash VARCHAR(255) NOT NULL,
      tp_usuario    TEXT CHECK(tp_usuario IN ('voluntario','ong')) NOT NULL,
      st_usuario    CHAR(1)   NOT NULL DEFAULT 'A',
      dt_cadastro   DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // VOLUNTARIO — perfil do voluntário
  executar(`
    CREATE TABLE IF NOT EXISTS voluntario (
      id_voluntario  INTEGER PRIMARY KEY AUTOINCREMENT,
      id_usuario     INTEGER NOT NULL UNIQUE,
      nm_voluntario  VARCHAR(120) NOT NULL,
      tel_voluntario VARCHAR(20),
      dt_nascimento  DATE,
      FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
    )
  `);

  // ONG — perfil da ONG
  executar(`
    CREATE TABLE IF NOT EXISTS ong (
      id_ong     INTEGER PRIMARY KEY AUTOINCREMENT,
      id_usuario INTEGER NOT NULL UNIQUE,
      ds_ong     VARCHAR(150) NOT NULL,
      ds_cnpj    VARCHAR(18),
      tel_ong    VARCHAR(20),
      end_ong    VARCHAR(180),
      site_ong   VARCHAR(120),
      comp_ong   VARCHAR(120),
      FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
    )
  `);

  // EVENTO — criado pelas ONGs
  executar(`
    CREATE TABLE IF NOT EXISTS evento (
      id_evento  INTEGER PRIMARY KEY AUTOINCREMENT,
      id_ong     INTEGER NOT NULL,
      end_evento VARCHAR(180),
      dt_evento  DATETIME NOT NULL,
      ds_evento  VARCHAR(255) NOT NULL,
      qt_vagas   INTEGER DEFAULT 0,
      FOREIGN KEY (id_ong) REFERENCES ong(id_ong) ON DELETE CASCADE
    )
  `);

  // INSCRICAO — voluntário se inscreve em evento
  executar(`
    CREATE TABLE IF NOT EXISTS inscricao (
      id_inscricao     INTEGER PRIMARY KEY AUTOINCREMENT,
      id_voluntario    INTEGER NOT NULL,
      id_evento        INTEGER NOT NULL,
      dt_inscricao     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      status_inscricao VARCHAR(30) NOT NULL DEFAULT 'pendente',
      UNIQUE (id_voluntario, id_evento),
      FOREIGN KEY (id_voluntario) REFERENCES voluntario(id_voluntario) ON DELETE CASCADE,
      FOREIGN KEY (id_evento)     REFERENCES evento(id_evento)         ON DELETE CASCADE
    )
  `);

  console.log('✅  Tabelas OK');
}

module.exports = { criarTabelas };
