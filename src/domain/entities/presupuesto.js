const { ErrorDeValidacion } = require('../errors');
const { Dinero } = require('../value-objects/dinero');
const { Mes } = require('../value-objects/mes');
const { idObligatorio } = require('../shared/validaciones');

class Presupuesto {
  constructor({ id, usuarioId, categoriaId, mes, limite }) {
    this.id = id;
    this.usuarioId = usuarioId;
    this.categoriaId = categoriaId;
    this.mes = mes;
    this.limite = limite;
    Object.freeze(this);
  }

  static crear({ id, usuarioId, categoriaId, mes, limite }) {
    if (!(mes instanceof Mes)) {
      throw new ErrorDeValidacion('El mes del presupuesto no es válido');
    }
    if (!(limite instanceof Dinero) || !limite.esPositivo()) {
      throw new ErrorDeValidacion('El límite del presupuesto debe ser mayor a 0');
    }
    return new Presupuesto({
      id: idObligatorio(id, 'El id'),
      usuarioId: idObligatorio(usuarioId, 'El usuario'),
      categoriaId: idObligatorio(categoriaId, 'La categoría'),
      mes,
      limite,
    });
  }

  // Lo que queda del presupuesto; es negativo si ya se superó el límite.
  restante(gastado) {
    return this.limite.restar(gastado);
  }
}

module.exports = { Presupuesto };
