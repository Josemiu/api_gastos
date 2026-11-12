const { Gasto } = require('../../domain/entities/gasto');
const { Dinero } = require('../../domain/value-objects/dinero');
const { ErrorNoEncontrado } = require('../../domain/errors');

class RegistrarGasto {
  /**
   * @param {{
   *   gastos: GastoRepository,
   *   categorias: CategoriaRepository,
   *   presupuestos: PresupuestoRepository,
   *   ids: GeneradorDeIds,
   *   alertas: import('../../domain/services/alertas').EvaluadorDeAlertas
   * }} deps
   */
  constructor({ gastos, categorias, presupuestos, ids, alertas }) {
    this.gastos = gastos;
    this.categorias = categorias;
    this.presupuestos = presupuestos;
    this.ids = ids;
    this.alertas = alertas;
  }

  async ejecutar({ usuarioId, categoriaId, monto, descripcion, fecha }) {
    const categoria = await this.categorias.buscarPorId(categoriaId);
    // Una categoría de otro usuario se trata como inexistente.
    if (!categoria || categoria.usuarioId !== usuarioId) {
      throw new ErrorNoEncontrado('La categoría no existe');
    }

    const gasto = Gasto.crear({
      id: this.ids.generar(),
      usuarioId,
      categoriaId,
      monto: Dinero.crear(monto),
      descripcion,
      fecha,
    });

    // El gasto siempre se guarda; superar el presupuesto solo genera una alerta.
    await this.gastos.guardar(gasto);

    return { gasto, alerta: await this.#evaluarAlerta(gasto, categoria) };
  }

  async #evaluarAlerta(gasto, categoria) {
    const presupuesto = await this.presupuestos.buscar({
      usuarioId: gasto.usuarioId,
      categoriaId: gasto.categoriaId,
      mes: gasto.mes,
    });
    if (!presupuesto) return null;

    const gastado = await this.gastos.totalGastado({
      usuarioId: gasto.usuarioId,
      categoriaId: gasto.categoriaId,
      mes: gasto.mes,
    });
    const alerta = this.alertas.evaluar({ gastado, limite: presupuesto.limite });
    return alerta ? { ...alerta, categoria: categoria.nombre } : null;
  }
}

module.exports = { RegistrarGasto };
