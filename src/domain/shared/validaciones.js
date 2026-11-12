const { ErrorDeValidacion } = require('../errors');

function textoObligatorio(valor, campo, maximo) {
  if (typeof valor !== 'string' || valor.trim() === '') {
    throw new ErrorDeValidacion(`${campo} es obligatorio`);
  }
  const texto = valor.trim();
  if (texto.length > maximo) {
    throw new ErrorDeValidacion(`${campo} no puede superar ${maximo} caracteres`);
  }
  return texto;
}

function idObligatorio(valor, campo) {
  return textoObligatorio(valor, campo, 64);
}

// Acepta solo AAAA-MM-DD y que la fecha exista de verdad (por ejemplo, rechaza 2026-02-30).
function fechaIso(valor, campo) {
  const coincide = typeof valor === 'string' && /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor);
  if (coincide) {
    const [, anio, mes, dia] = coincide.map(Number);
    const fecha = new Date(Date.UTC(anio, mes - 1, dia));
    if (
      fecha.getUTCFullYear() === anio &&
      fecha.getUTCMonth() === mes - 1 &&
      fecha.getUTCDate() === dia
    ) {
      return valor;
    }
  }
  throw new ErrorDeValidacion(`${campo} debe ser una fecha válida con formato AAAA-MM-DD`);
}

module.exports = { textoObligatorio, idObligatorio, fechaIso };
