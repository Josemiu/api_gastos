const { Pool } = require('pg');

const crearPool = (databaseUrl) => new Pool({ connectionString: databaseUrl });

// Comprobación mínima de que la base de datos responde (la usa /health).
const comprobarBaseDeDatos = (pool) => async () => {
  await pool.query('SELECT 1');
};

module.exports = { crearPool, comprobarBaseDeDatos };
