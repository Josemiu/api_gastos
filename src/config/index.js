const { z } = require('zod');

const esquema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1, 'es obligatoria'),
});

// La configuración viene solo del entorno (Twelve-Factor). Si falta algo, la app no arranca.
function cargarConfiguracion(env = process.env) {
  const resultado = esquema.safeParse(env);
  if (!resultado.success) {
    const detalle = resultado.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Configuración inválida -> ${detalle}`);
  }
  return Object.freeze(resultado.data);
}

module.exports = { cargarConfiguracion };
