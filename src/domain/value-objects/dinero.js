const { ErrorDeValidacion } = require('../errors');

// Guarda el monto en centavos (entero) para evitar errores de punto flotante.
// Se crea siempre con un valor no negativo, pero una resta puede dar un resultado
// negativo (por ejemplo, lo que queda de un presupuesto que ya se pasó).
class Dinero {
  #centavos;

  constructor(centavos) {
    this.#centavos = centavos;
    Object.freeze(this);
  }

  static crear(valor) {
    if (typeof valor !== 'number' || !Number.isFinite(valor)) {
      throw new ErrorDeValidacion('El monto debe ser un número');
    }
    if (valor < 0) {
      throw new ErrorDeValidacion('El monto no puede ser negativo');
    }
    const centavos = Math.round(valor * 100);
    if (Math.abs(valor * 100 - centavos) > 1e-6) {
      throw new ErrorDeValidacion('El monto admite como máximo 2 decimales');
    }
    return new Dinero(centavos);
  }

  sumar(otro) {
    return new Dinero(this.#centavos + otro.#centavos);
  }

  restar(otro) {
    return new Dinero(this.#centavos - otro.#centavos);
  }

  esMayorQue(otro) {
    return this.#centavos > otro.#centavos;
  }

  esMayorOIgualQue(otro) {
    return this.#centavos >= otro.#centavos;
  }

  esPositivo() {
    return this.#centavos > 0;
  }

  equals(otro) {
    return this.#centavos === otro.#centavos;
  }

  // Qué porcentaje representa este monto respecto al total.
  porcentajeDe(total) {
    if (total.#centavos === 0) {
      throw new ErrorDeValidacion('No se puede calcular un porcentaje sobre un total en cero');
    }
    // Se multiplica antes de dividir para que valores como 80% salgan exactos.
    return (this.#centavos * 100) / total.#centavos;
  }

  aNumero() {
    return this.#centavos / 100;
  }

  toJSON() {
    return this.aNumero();
  }
}

module.exports = { Dinero };
