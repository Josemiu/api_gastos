const { ErrorDeDominio } = require('../../../domain/errors');

const ESTADO_POR_CODIGO = {
  VALIDACION: 400,
  NO_AUTORIZADO: 401,
  NO_ENCONTRADO: 404,
  CONFLICTO: 409,
};

const cuerpoDeError = (codigo, mensaje, detalles) => ({
  error: { codigo, mensaje, ...(detalles && { detalles }) },
});

const rutaNoEncontrada = (_req, res) => {
  res.status(404).json(cuerpoDeError('NO_ENCONTRADO', 'Ruta no encontrada'));
};

// Único lugar donde los errores se traducen a respuestas HTTP.
const manejadorDeErrores = (logger) => (error, _req, res, _next) => {
  if (error instanceof ErrorDeDominio) {
    const estado = ESTADO_POR_CODIGO[error.codigo] ?? 500;
    return res.status(estado).json(cuerpoDeError(error.codigo, error.message, error.detalles));
  }

  // Errores del lector de JSON de Express.
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json(cuerpoDeError('VALIDACION', 'El cuerpo no es un JSON válido'));
  }
  if (error.type === 'entity.too.large') {
    return res
      .status(413)
      .json(cuerpoDeError('CUERPO_DEMASIADO_GRANDE', 'El cuerpo de la petición es muy grande'));
  }

  // Error inesperado: se registra con detalle, pero al cliente no se le cuenta nada interno.
  logger.error(error);
  return res.status(500).json(cuerpoDeError('ERROR_INTERNO', 'Ocurrió un error inesperado'));
};

module.exports = { manejadorDeErrores, rutaNoEncontrada };
