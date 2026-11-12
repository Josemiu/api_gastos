// Implementación en memoria del puerto PresupuestoRepository.
class PresupuestoRepositorioEnMemoria {
  #presupuestos = [];

  async guardar(presupuesto) {
    this.#presupuestos.push(presupuesto);
  }

  async buscar({ usuarioId, categoriaId, mes }) {
    return (
      this.#presupuestos.find(
        (p) => p.usuarioId === usuarioId && p.categoriaId === categoriaId && p.mes.equals(mes),
      ) ?? null
    );
  }

  async listarPorMes({ usuarioId, mes }) {
    return this.#presupuestos.filter((p) => p.usuarioId === usuarioId && p.mes.equals(mes));
  }
}

module.exports = { PresupuestoRepositorioEnMemoria };
