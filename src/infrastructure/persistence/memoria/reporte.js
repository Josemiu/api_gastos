const { Dinero } = require('../../../domain/value-objects/dinero');

// Implementación en memoria del puerto de lectura ReporteQuery.
class ReporteQueryEnMemoria {
  constructor(gastos) {
    this.gastos = gastos;
  }

  async gastadoPorCategoria({ usuarioId, mes }) {
    const totales = new Map();
    for (const gasto of this.gastos.obtenerTodos()) {
      if (gasto.usuarioId !== usuarioId || !gasto.mes.equals(mes)) continue;
      const actual = totales.get(gasto.categoriaId) ?? Dinero.crear(0);
      totales.set(gasto.categoriaId, actual.sumar(gasto.monto));
    }
    return [...totales].map(([categoriaId, total]) => ({ categoriaId, total }));
  }
}

module.exports = { ReporteQueryEnMemoria };
