const request = require('supertest');
const { crearApp } = require('../../src/infrastructure/http/app');
const { cargarDocumentacion } = require('../../src/infrastructure/http/documentacion');
const { crearCasosDeUso } = require('../../src/application/crear-casos-de-uso');
const { crearEvaluadorPorDefecto } = require('../../src/domain/services/alertas');
const { HasherBcrypt } = require('../../src/infrastructure/security/hasher-bcrypt');
const { TokenServiceJwt } = require('../../src/infrastructure/security/token-jwt');
const { GeneradorDeIdsUuid } = require('../../src/infrastructure/security/ids-uuid');
const {
  UsuarioRepositorioEnMemoria,
} = require('../../src/infrastructure/persistence/memoria/usuarios');
const {
  CategoriaRepositorioEnMemoria,
} = require('../../src/infrastructure/persistence/memoria/categorias');
const {
  GastoRepositorioEnMemoria,
} = require('../../src/infrastructure/persistence/memoria/gastos');
const {
  PresupuestoRepositorioEnMemoria,
} = require('../../src/infrastructure/persistence/memoria/presupuestos');
const { ReporteQueryEnMemoria } = require('../../src/infrastructure/persistence/memoria/reporte');

const SECRETO = 'un-secreto-de-prueba-con-mas-de-32-caracteres';

// Arma la aplicación completa con persistencia en memoria (sin base de datos),
// pero con las implementaciones reales de bcrypt, JWT y UUID.
function crearAppDePrueba({ logger = { error: () => {} }, reemplazos = {}, limites } = {}) {
  const gastos = new GastoRepositorioEnMemoria();
  const tokens = new TokenServiceJwt({ secreto: SECRETO, expiraEn: '1h' });
  const casosDeUso = {
    ...crearCasosDeUso({
      usuarios: new UsuarioRepositorioEnMemoria(),
      categorias: new CategoriaRepositorioEnMemoria(),
      gastos,
      presupuestos: new PresupuestoRepositorioEnMemoria(),
      reporte: new ReporteQueryEnMemoria(gastos),
      hasher: new HasherBcrypt({ costo: 4 }),
      tokens,
      ids: new GeneradorDeIdsUuid(),
      alertas: crearEvaluadorPorDefecto(),
    }),
    ...reemplazos,
  };
  return crearApp({
    comprobarSalud: async () => {},
    casosDeUso,
    tokens,
    logger,
    limites,
    documentacion: cargarDocumentacion(),
  });
}

// Registra un usuario, inicia sesión y devuelve su token.
async function registrarYEntrar(app, email = 'ana@correo.com') {
  await request(app).post('/auth/registro').send({ nombre: 'Ana', email, password: 'secreta123' });
  const login = await request(app).post('/auth/login').send({ email, password: 'secreta123' });
  return login.body.token;
}

module.exports = { crearAppDePrueba, registrarYEntrar };
