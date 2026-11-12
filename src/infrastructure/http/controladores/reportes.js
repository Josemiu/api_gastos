const { Router } = require('express');
const { esquemas, validar } = require('../esquemas');
const presentar = require('../presentadores');

function crearControladorReportes({ consultarReporteMensual }) {
  const router = Router();

  router.get('/mensual', async (req, res) => {
    const { mes } = validar(esquemas.reporteMensual, req.query);
    const reporte = await consultarReporteMensual.ejecutar({ usuarioId: req.usuarioId, mes });
    res.status(200).json(presentar.reporte(reporte));
  });

  return router;
}

module.exports = { crearControladorReportes };
