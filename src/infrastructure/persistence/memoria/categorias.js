// Implementación en memoria del puerto CategoriaRepository.
class CategoriaRepositorioEnMemoria {
  #porId = new Map();

  async guardar(categoria) {
    this.#porId.set(categoria.id, categoria);
  }

  async buscarPorId(id) {
    return this.#porId.get(id) ?? null;
  }

  async buscarPorNombre(usuarioId, nombre) {
    for (const categoria of this.#porId.values()) {
      if (categoria.usuarioId === usuarioId && categoria.nombre === nombre) return categoria;
    }
    return null;
  }

  async listarPorUsuario(usuarioId) {
    return [...this.#porId.values()].filter((categoria) => categoria.usuarioId === usuarioId);
  }
}

module.exports = { CategoriaRepositorioEnMemoria };
