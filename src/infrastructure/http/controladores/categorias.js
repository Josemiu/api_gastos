const { Router } = require('express');
const { esquemas, validar } = require('../esquemas');
const presentar = require('../presentadores');

function crearControladorCategorias({ crearCategoria, listarCategorias }) {
  const router = Router();

  router.post('/', async (req, res) => {
    const { nombre } = validar(esquemas.categoria, req.body);
    const categoria = await crearCategoria.ejecutar({ usuarioId: req.usuarioId, nombre });
    res.status(201).json(presentar.categoria(categoria));
  });

  router.get('/', async (req, res) => {
    const categorias = await listarCategorias.ejecutar({ usuarioId: req.usuarioId });
    res.status(200).json(categorias.map(presentar.categoria));
  });

  return router;
}

module.exports = { crearControladorCategorias };
