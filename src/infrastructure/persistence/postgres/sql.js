const { ErrorDeConflicto } = require('../../../domain/errors');

const UNIQUE_VIOLATION = '23505';

// Convierte el error de unicidad de PostgreSQL en un error de dominio.
// Cualquier otro error se deja pasar tal cual.
function traducirUnicidad(error, mensaje) {
  if (error.code === UNIQUE_VIOLATION) {
    throw new ErrorDeConflicto(mensaje);
  }
  throw error;
}

// Condición SQL para filtrar un mes completo (AAAA-MM) sin perder el uso del índice.
// `n` es el número del parámetro ($n) que contiene el mes.
const condicionDeMes = (n) =>
  `fecha >= ($${n}::text || '-01')::date AND fecha < (($${n}::text || '-01')::date + INTERVAL '1 month')`;

module.exports = { traducirUnicidad, condicionDeMes };
