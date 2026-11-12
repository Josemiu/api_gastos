const { ErrorDeValidacion } = require('../errors');
const { Dinero } = require('../value-objects/dinero');
const { Mes } = require('../value-objects/mes');
const { idObligatorio, fechaIso } = require('../shared/validaciones');

class Gasto {
  constructor({ id, usuarioId, categoriaId, monto, descripcion, fecha }) {
    this.id = id;
    this.usuarioId = usuarioId;
    this.categoriaId = categoriaId;
    this.monto = monto;
    this.descripcion = descripcion;
    this.fecha = fecha;
    Object.freeze(this);
  }

  static crear({ id, usuarioId, categoriaId, monto, descripcion = '', fecha }) {
    if (!(monto instanceof Dinero) || !monto.esPositivo()) {
      throw new ErrorDeValidacion('El monto del gasto debe ser mayor a 0');
    }
    if (typeof descripcion !== 'string' || descripcion.length > 255) {
      throw new ErrorDeValidacion('La descripción no puede superar 255 caracteres');
    }
    return new Gasto({
      id: idObligatorio(id, 'El id'),
      usuarioId: idObligatorio(usuarioId, 'El usuario'),
      categoriaId: idObligatorio(categoriaId, 'La categoría'),
      monto,
      descripcion: descripcion.trim(),
      fecha: fechaIso(fecha, 'La fecha'),
    });
  }

  get mes() {
    return Mes.deFecha(this.fecha);
  }
}

module.exports = { Gasto };
