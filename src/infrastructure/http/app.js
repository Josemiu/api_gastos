const express = require('express');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const { autenticar } = require('./middleware/autenticar');
const { crearLimitadores } = require('./middleware/limitadores');
const { manejadorDeErrores, rutaNoEncontrada } = require('./middleware/manejador-de-errores');
const { crearControladorAuth } = require('./controladores/auth');
const { crearControladorCategorias } = require('./controladores/categorias');
const { crearControladorGastos } = require('./controladores/gastos');
const { crearControladorPresupuestos } = require('./controladores/presupuestos');
const { crearControladorReportes } = require('./controladores/reportes');

// La app recibe sus dependencias desde fuera (inyección de dependencias),
// así se puede probar sin una base de datos real.
function crearApp({
  comprobarSalud,
  casosDeUso,
  tokens,
  logger = console,
  limites,
  documentacion,
}) {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());

  // El health check queda fuera del límite de peticiones para que los monitores no lo agoten.
  app.get('/health', async (_req, res) => {
    try {
      await comprobarSalud();
      res.status(200).json({ estado: 'ok' });
    } catch {
      res.status(503).json({ estado: 'error' });
    }
  });

  if (documentacion) {
    app.get('/openapi.json', (_req, res) => res.json(documentacion));
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(documentacion));
  }

  const limitadores = crearLimitadores(limites);
  app.use(limitadores.global);
  app.use(express.json({ limit: '100kb' }));

  const protegida = autenticar(tokens);

  app.use('/auth', limitadores.auth, crearControladorAuth(casosDeUso));
  app.use('/categorias', protegida, crearControladorCategorias(casosDeUso));
  app.use('/gastos', protegida, crearControladorGastos(casosDeUso));
  app.use('/presupuestos', protegida, crearControladorPresupuestos(casosDeUso));
  app.use('/reportes', protegida, crearControladorReportes(casosDeUso));

  app.use(rutaNoEncontrada);
  app.use(manejadorDeErrores(logger));

  return app;
}

module.exports = { crearApp };
