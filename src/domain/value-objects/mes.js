const { ErrorDeValidacion } = require('../errors');
const { fechaIso } = require('../shared/validaciones');

const PATRON = /^\d{4}-(0[1-9]|1[0-2])$/;

class Mes {
  #valor;

  constructor(valor) {
    this.#valor = valor;
    Object.freeze(this);
  }

  static crear(texto) {
    if (typeof texto !== 'string' || !PATRON.test(texto)) {
      throw new ErrorDeValidacion('El mes debe tener formato AAAA-MM');
    }
    return new Mes(texto);
  }

  static deFecha(fecha) {
    return new Mes(fechaIso(fecha, 'La fecha').slice(0, 7));
  }

  equals(otro) {
    return this.#valor === otro.#valor;
  }

  toString() {
    return this.#valor;
  }

  toJSON() {
    return this.#valor;
  }
}

module.exports = { Mes };
