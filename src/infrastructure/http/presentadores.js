// Convierten las entidades del dominio en el JSON que se envía al cliente (DTOs de salida).
// Así nunca se filtra información interna, como el id del usuario dueño o la contraseña.

const categoria = (c) => ({ id: c.id, nombre: c.nombre });

const gasto = (g) => ({
  id: g.id,
  categoriaId: g.categoriaId,
  monto: g.monto.aNumero(),
  descripcion: g.descripcion,
  fecha: g.fecha,
});

const presupuesto = (p) => ({
  id: p.id,
  categoriaId: p.categoriaId,
  mes: p.mes.toString(),
  limite: p.limite.aNumero(),
});

const reporte = (r) => ({
  mes: r.mes,
  totalGastado: r.totalGastado.aNumero(),
  categorias: r.categorias.map((fila) => ({
    categoriaId: fila.categoriaId,
    nombre: fila.nombre,
    gastado: fila.gastado.aNumero(),
    limite: fila.limite ? fila.limite.aNumero() : null,
    restante: fila.restante ? fila.restante.aNumero() : null,
    porcentajeUsado: fila.porcentajeUsado,
  })),
});

module.exports = { categoria, gasto, presupuesto, reporte };
