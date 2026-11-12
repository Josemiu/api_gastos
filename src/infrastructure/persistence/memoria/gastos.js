const { Dinero } = require('../../../domain/value-objects/dinero');

// Implementación en memoria del puerto GastoRepository.
class GastoRepositorioEnMemoria {
  #gastos = [];

  async guardar(gasto) {
    this.#gastos.push(gasto);
  }

  async totalGastado({ usuarioId, categoriaId, mes }) {
    return this.#gastos
      .filter(
        (gasto) =>
          gasto.usuarioId === usuarioId &&
          gasto.categoriaId === categoriaId &&
          gasto.mes.equals(mes),
      )
      .reduce((suma, gasto) => suma.sumar(gasto.monto), Dinero.crear(0));
  }

  // Solo para otros adaptadores en memoria (por ejemplo, el de reportes).
  obtenerTodos() {
    return [...this.#gastos];
  }
}

module.exports = { GastoRepositorioEnMemoria };
