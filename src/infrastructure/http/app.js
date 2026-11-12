const express = require('express');
const { autenticar } = require('./middleware/autenticar');
const { manejadorDeErrores, rutaNoEncontrada } = require('./middleware/manejador-de-errores');
const { crearControladorAuth } = require('./controladores/auth');
const { crearControladorCategorias } = require('./controladores/categorias');
const { crearControladorGastos } = require('./controladores/gastos');
const { crearControladorPresupuestos } = require('./controladores/presupuestos');
const { crearControladorReportes } = require('./controladores/reportes');

// La app recibe sus dependencias desde fuera (inyección de dependencias),
// así se puede probar sin una base de datos real.
function crearApp({ comprobarSalud, casosDeUso, tokens, logger = console }) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '100kb' }));

  app.get('/health', async (_req, res) => {
    try {
      await comprobarSalud();
      res.status(200).json({ estado: 'ok' });
    } catch {
      res.status(503).json({ estado: 'error' });
    }
  });

  const protegida = autenticar(tokens);

  app.use('/auth', crearControladorAuth(casosDeUso));
  app.use('/categorias', protegida, crearControladorCategorias(casosDeUso));
  app.use('/gastos', protegida, crearControladorGastos(casosDeUso));
  app.use('/presupuestos', protegida, crearControladorPresupuestos(casosDeUso));
  app.use('/reportes', protegida, crearControladorReportes(casosDeUso));

  app.use(rutaNoEncontrada);
  app.use(manejadorDeErrores(logger));

  return app;
}

module.exports = { crearApp };
