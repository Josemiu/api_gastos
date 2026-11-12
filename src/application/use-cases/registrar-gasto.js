const { Gasto } = require('../../domain/entities/gasto');
const { Dinero } = require('../../domain/value-objects/dinero');
const { ErrorNoEncontrado } = require('../../domain/errors');

class RegistrarGasto {
  /** @param {{gastos: GastoRepository, categorias: CategoriaRepository, ids: GeneradorDeIds}} deps */
  constructor({ gastos, categorias, ids }) {
    this.gastos = gastos;
    this.categorias = categorias;
    this.ids = ids;
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

    await this.gastos.guardar(gasto);
    return gasto;
  }
}

module.exports = { RegistrarGasto };
