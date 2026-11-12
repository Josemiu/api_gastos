const bcrypt = require('bcryptjs');

// Implementación del puerto PasswordHasher con bcrypt (versión en JavaScript puro,
// para no depender de compilar módulos nativos).
class HasherBcrypt {
  constructor({ costo = 10 } = {}) {
    this.costo = costo;
  }

  hashear(plano) {
    return bcrypt.hash(plano, this.costo);
  }

  comparar(plano, hash) {
    return bcrypt.compare(plano, hash);
  }
}

module.exports = { HasherBcrypt };
