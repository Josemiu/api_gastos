const { ErrorNoAutorizado } = require('../../../domain/errors');

// Exige un encabezado "Authorization: Bearer <token>" válido y guarda el id del usuario
// en req.usuarioId para que lo usen los controladores.
const autenticar = (tokens) => async (req, _res, next) => {
  const [esquema, token] = (req.get('Authorization') ?? '').split(' ');
  if (esquema !== 'Bearer' || !token) {
    throw new ErrorNoAutorizado('Falta el token de autenticación');
  }
  const { usuarioId } = await tokens.verificar(token);
  req.usuarioId = usuarioId;
  next();
};

module.exports = { autenticar };
