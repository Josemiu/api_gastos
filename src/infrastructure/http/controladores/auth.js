const { Router } = require('express');
const { esquemas, validar } = require('../esquemas');

// Controlador delgado: valida el formato, llama al caso de uso y responde. Sin lógica de negocio.
function crearControladorAuth({ registrarUsuario, iniciarSesion }) {
  const router = Router();

  router.post('/registro', async (req, res) => {
    const datos = validar(esquemas.registro, req.body);
    res.status(201).json(await registrarUsuario.ejecutar(datos));
  });

  router.post('/login', async (req, res) => {
    const datos = validar(esquemas.login, req.body);
    res.status(200).json(await iniciarSesion.ejecutar(datos));
  });

  return router;
}

module.exports = { crearControladorAuth };
