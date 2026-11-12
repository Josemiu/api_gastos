// Dobles de prueba para los puertos que dependen de librerías externas.
// Las versiones reales (bcrypt, JWT, uuid) se implementan en la capa de infraestructura.

class HasherFalso {
  async hashear(plano) {
    return `hash(${plano})`;
  }

  async comparar(plano, hash) {
    return hash === `hash(${plano})`;
  }
}

class GeneradorDeIdsSecuencial {
  #contador = 0;

  generar() {
    this.#contador += 1;
    return `id-${this.#contador}`;
  }
}

class TokenServiceFalso {
  async emitir({ usuarioId }) {
    return `token-${usuarioId}`;
  }
}

module.exports = { HasherFalso, GeneradorDeIdsSecuencial, TokenServiceFalso };
