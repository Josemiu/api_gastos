// Errores propios del dominio. La capa HTTP los traduce a códigos de estado.
class ErrorDeDominio extends Error {
  constructor(mensaje, codigo) {
    super(mensaje);
    this.name = this.constructor.name;
    this.codigo = codigo;
  }
}

class ErrorDeValidacion extends ErrorDeDominio {
  constructor(mensaje) {
    super(mensaje, 'VALIDACION');
  }
}

class ErrorNoEncontrado extends ErrorDeDominio {
  constructor(mensaje) {
    super(mensaje, 'NO_ENCONTRADO');
  }
}

class ErrorDeConflicto extends ErrorDeDominio {
  constructor(mensaje) {
    super(mensaje, 'CONFLICTO');
  }
}

class ErrorNoAutorizado extends ErrorDeDominio {
  constructor(mensaje) {
    super(mensaje, 'NO_AUTORIZADO');
  }
}

module.exports = {
  ErrorDeDominio,
  ErrorDeValidacion,
  ErrorNoEncontrado,
  ErrorDeConflicto,
  ErrorNoAutorizado,
};
