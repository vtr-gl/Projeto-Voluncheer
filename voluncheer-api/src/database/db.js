const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.resolve(__dirname, '../../data/voluncheer.db');
let db = null;

async function conectar() {
  if (db) return db;

  const SQL = await initSqlJs();
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  if (fs.existsSync(DB_PATH)) {
    db = new SQL.Database(fs.readFileSync(DB_PATH));
  } else {
    db = new SQL.Database();
  }

  db.run('PRAGMA foreign_keys = ON;');
  return db;
}

function salvar() {
  if (!db) return;
  fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
}

// SELECT múltiplos registros
function todos(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

// SELECT um registro
function um(sql, params = []) {
  return todos(sql, params)[0] ?? null;
}

// INSERT / UPDATE / DELETE — retorna lastID
function executar(sql, params = []) {
  db.run(sql, params);
  salvar();
  const res = db.exec('SELECT last_insert_rowid() as id');
  return { lastID: res[0]?.values[0]?.[0] ?? null };
}

module.exports = { conectar, salvar, todos, um, executar };
