const { Presupuesto } = require('../../domain/entities/presupuesto');
const { Dinero } = require('../../domain/value-objects/dinero');
const { Mes } = require('../../domain/value-objects/mes');
const { ErrorDeConflicto, ErrorNoEncontrado } = require('../../domain/errors');

class CrearPresupuesto {
  /** @param {{presupuestos: PresupuestoRepository, categorias: CategoriaRepository, ids: GeneradorDeIds}} deps */
  constructor({ presupuestos, categorias, ids }) {
    this.presupuestos = presupuestos;
    this.categorias = categorias;
    this.ids = ids;
  }

  async ejecutar({ usuarioId, categoriaId, mes, limite }) {
    const categoria = await this.categorias.buscarPorId(categoriaId);
    if (!categoria || categoria.usuarioId !== usuarioId) {
      throw new ErrorNoEncontrado('La categoría no existe');
    }

    const presupuesto = Presupuesto.crear({
      id: this.ids.generar(),
      usuarioId,
      categoriaId,
      mes: Mes.crear(mes),
      limite: Dinero.crear(limite),
    });

    if (await this.presupuestos.buscar({ usuarioId, categoriaId, mes: presupuesto.mes })) {
      throw new ErrorDeConflicto('Ya existe un presupuesto para esa categoría y ese mes');
    }

    await this.presupuestos.guardar(presupuesto);
    return presupuesto;
  }
}

module.exports = { CrearPresupuesto };
