const { rateLimit } = require('express-rate-limit');

const LIMITES_POR_DEFECTO = {
  // Para toda la API: 100 peticiones por minuto y por IP.
  global: { limit: 100, windowMs: 60_000 },
  // Para registro y login: 10 intentos fallidos cada 15 minutos (frena la fuerza bruta).
  auth: { limit: 10, windowMs: 15 * 60_000 },
};

const alExceder = (_req, res) => {
  res.status(429).json({
    error: {
      codigo: 'DEMASIADAS_PETICIONES',
      mensaje: 'Demasiadas peticiones, intenta de nuevo más tarde',
    },
  });
};

const base = { standardHeaders: 'draft-7', legacyHeaders: false, handler: alExceder };

function crearLimitadores(limites = {}) {
  return {
    global: rateLimit({ ...base, ...LIMITES_POR_DEFECTO.global, ...limites.global }),
    // Solo cuentan los intentos fallidos: registrarse o entrar bien no gasta el límite.
    auth: rateLimit({
      ...base,
      ...LIMITES_POR_DEFECTO.auth,
      ...limites.auth,
      skipSuccessfulRequests: true,
    }),
  };
}

module.exports = { crearLimitadores };
