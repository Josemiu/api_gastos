const { z } = require('zod');
const { ErrorDeValidacion } = require('../../domain/errors');

// Validación del formato de lo que llega por HTTP (tipos y campos obligatorios).
// Las reglas de negocio (monto positivo, fecha real, etc.) las valida el dominio.
const texto = (campo) => z.string({ error: `${campo} debe ser un texto` });
const numero = (campo) => z.number({ error: `${campo} debe ser un número` });

const esquemas = {
  registro: z.object({
    nombre: texto('nombre'),
    email: texto('email'),
    password: texto('password'),
  }),
  login: z.object({
    email: texto('email'),
    password: texto('password'),
  }),
  categoria: z.object({
    nombre: texto('nombre'),
  }),
  gasto: z.object({
    categoriaId: texto('categoriaId'),
    monto: numero('monto'),
    descripcion: texto('descripcion').optional(),
    fecha: texto('fecha'),
  }),
  presupuesto: z.object({
    categoriaId: texto('categoriaId'),
    mes: texto('mes'),
    limite: numero('limite'),
  }),
  reporteMensual: z.object({
    mes: texto('mes'),
  }),
};

// Valida los datos con un esquema. Si no cumplen, lanza un ErrorDeValidacion con el
// detalle de cada campo para que el cliente sepa qué corregir.
function validar(esquema, datos) {
  const resultado = esquema.safeParse(datos ?? {});
  if (resultado.success) return resultado.data;

  const error = new ErrorDeValidacion('Los datos enviados no son válidos');
  error.detalles = resultado.error.issues.map((issue) => ({
    campo: issue.path.join('.'),
    mensaje: issue.message,
  }));
  throw error;
}

module.exports = { esquemas, validar };
