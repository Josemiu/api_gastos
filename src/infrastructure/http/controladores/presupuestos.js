const { Router } = require('express');
const { esquemas, validar } = require('../esquemas');
const presentar = require('../presentadores');

function crearControladorPresupuestos({ crearPresupuesto }) {
  const router = Router();

  router.post('/', async (req, res) => {
    const datos = validar(esquemas.presupuesto, req.body);
    const presupuesto = await crearPresupuesto.ejecutar({ usuarioId: req.usuarioId, ...datos });
    res.status(201).json(presentar.presupuesto(presupuesto));
  });

  return router;
}

module.exports = { crearControladorPresupuestos };
