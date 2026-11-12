const { randomUUID } = require('node:crypto');

// Implementación del puerto GeneradorDeIds con UUID v4 (viene incluido en Node.js).
class GeneradorDeIdsUuid {
  generar() {
    return randomUUID();
  }
}

module.exports = { GeneradorDeIdsUuid };
