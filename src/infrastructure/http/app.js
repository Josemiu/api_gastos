const express = require('express');

// La app recibe sus dependencias desde fuera (inyección de dependencias),
// así se puede probar sin una base de datos real.
function crearApp({ comprobarSalud }) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json());

  app.get('/health', async (_req, res) => {
    try {
      await comprobarSalud();
      res.status(200).json({ estado: 'ok' });
    } catch {
      res.status(503).json({ estado: 'error' });
    }
  });

  return app;
}

module.exports = { crearApp };
