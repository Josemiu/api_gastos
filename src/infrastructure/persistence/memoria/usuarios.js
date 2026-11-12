// Implementación en memoria del puerto UsuarioRepository (para pruebas y desarrollo).
class UsuarioRepositorioEnMemoria {
  #porId = new Map();

  async guardar(usuario) {
    this.#porId.set(usuario.id, usuario);
  }

  async buscarPorId(id) {
    return this.#porId.get(id) ?? null;
  }

  async buscarPorEmail(email) {
    for (const usuario of this.#porId.values()) {
      if (usuario.email === email) return usuario;
    }
    return null;
  }
}

module.exports = { UsuarioRepositorioEnMemoria };
