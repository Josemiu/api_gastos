const { textoObligatorio, idObligatorio } = require('../shared/validaciones');

class Categoria {
  constructor({ id, usuarioId, nombre }) {
    this.id = id;
    this.usuarioId = usuarioId;
    this.nombre = nombre;
    Object.freeze(this);
  }

  static crear({ id, usuarioId, nombre }) {
    return new Categoria({
      id: idObligatorio(id, 'El id'),
      usuarioId: idObligatorio(usuarioId, 'El usuario'),
      nombre: textoObligatorio(nombre, 'El nombre de la categoría', 60),
    });
  }
}

module.exports = { Categoria };
