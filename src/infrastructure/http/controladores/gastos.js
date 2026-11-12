const { Router } = require('express');
const { esquemas, validar } = require('../esquemas');
const presentar = require('../presentadores');

function crearControladorGastos({ registrarGasto }) {
  const router = Router();

  router.post('/', async (req, res) => {
    const datos = validar(esquemas.gasto, req.body);
    const { gasto, alerta } = await registrarGasto.ejecutar({
      usuarioId: req.usuarioId,
      ...datos,
    });
    res.status(201).json({ gasto: presentar.gasto(gasto), alerta });
  });

  return router;
}

module.exports = { crearControladorGastos };
