const { cargarConfiguracion } = require('./config');
const { crearPool, comprobarBaseDeDatos } = require('./infrastructure/persistence/pool');
const { crearApp } = require('./infrastructure/http/app');

// Punto de composición: aquí se conectan las piezas de la aplicación.
const config = cargarConfiguracion();
const pool = crearPool(config.DATABASE_URL);
const app = crearApp({ comprobarSalud: comprobarBaseDeDatos(pool) });

const servidor = app.listen(config.PORT, () => {
  console.log(`API escuchando en el puerto ${config.PORT} (${config.NODE_ENV})`);
});

// Apagado ordenado: deja de aceptar peticiones y cierra las conexiones a la base de datos.
const apagar = (senal) => {
  console.log(`${senal} recibida, cerrando...`);
  servidor.close(async () => {
    await pool.end();
    process.exit(0);
  });
};
process.on('SIGTERM', () => apagar('SIGTERM'));
process.on('SIGINT', () => apagar('SIGINT'));
