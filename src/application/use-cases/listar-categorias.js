class ListarCategorias {
  /** @param {{categorias: CategoriaRepository}} deps */
  constructor({ categorias }) {
    this.categorias = categorias;
  }

  async ejecutar({ usuarioId }) {
    return this.categorias.listarPorUsuario(usuarioId);
  }
}

module.exports = { ListarCategorias };
