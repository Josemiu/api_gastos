const { cargarConfiguracion } = require('./config');
const { crearCasosDeUso } = require('./application/crear-casos-de-uso');
const { crearEvaluadorPorDefecto } = require('./domain/services/alertas');
const { crearPool, comprobarBaseDeDatos } = require('./infrastructure/persistence/pool');
const { UsuarioRepositorioPostgres } = require('./infrastructure/persistence/postgres/usuarios');
const {
  CategoriaRepositorioPostgres,
} = require('./infrastructure/persistence/postgres/categorias');
const { GastoRepositorioPostgres } = require('./infrastructure/persistence/postgres/gastos');
const {
  PresupuestoRepositorioPostgres,
} = require('./infrastructure/persistence/postgres/presupuestos');
const { ReporteQueryPostgres } = require('./infrastructure/persistence/postgres/reporte');
const { HasherBcrypt } = require('./infrastructure/security/hasher-bcrypt');
const { TokenServiceJwt } = require('./infrastructure/security/token-jwt');
const { GeneradorDeIdsUuid } = require('./infrastructure/security/ids-uuid');
const { crearApp } = require('./infrastructure/http/app');
const { cargarDocumentacion } = require('./infrastructure/http/documentacion');

// Punto de composición: aquí se eligen las implementaciones reales de cada puerto
// y se conectan con los casos de uso. Es el único archivo que conoce todas las piezas.
const config = cargarConfiguracion();
const pool = crearPool(config.DATABASE_URL);
const tokens = new TokenServiceJwt({ secreto: config.JWT_SECRET, expiraEn: config.JWT_EXPIRES_IN });

const casosDeUso = crearCasosDeUso({
  usuarios: new UsuarioRepositorioPostgres(pool),
  categorias: new CategoriaRepositorioPostgres(pool),
  gastos: new GastoRepositorioPostgres(pool),
  presupuestos: new PresupuestoRepositorioPostgres(pool),
  reporte: new ReporteQueryPostgres(pool),
  hasher: new HasherBcrypt(),
  tokens,
  ids: new GeneradorDeIdsUuid(),
  alertas: crearEvaluadorPorDefecto(),
});

const app = crearApp({
  comprobarSalud: comprobarBaseDeDatos(pool),
  casosDeUso,
  tokens,
  documentacion: cargarDocumentacion(),
});

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
