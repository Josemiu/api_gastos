const { Categoria } = require('../../domain/entities/categoria');
const { ErrorDeConflicto } = require('../../domain/errors');

class CrearCategoria {
  /** @param {{categorias: CategoriaRepository, ids: GeneradorDeIds}} deps */
  constructor({ categorias, ids }) {
    this.categorias = categorias;
    this.ids = ids;
  }

  async ejecutar({ usuarioId, nombre }) {
    const categoria = Categoria.crear({ id: this.ids.generar(), usuarioId, nombre });

    if (await this.categorias.buscarPorNombre(usuarioId, categoria.nombre)) {
      throw new ErrorDeConflicto('Ya tienes una categoría con ese nombre');
    }

    await this.categorias.guardar(categoria);
    return categoria;
  }
}

module.exports = { CrearCategoria };
