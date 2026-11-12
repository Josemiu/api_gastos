const { ErrorDeValidacion } = require('../errors');
const { textoObligatorio, idObligatorio } = require('../shared/validaciones');

const PATRON_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

class Usuario {
  constructor({ id, nombre, email, passwordHash }) {
    this.id = id;
    this.nombre = nombre;
    this.email = email;
    this.passwordHash = passwordHash;
    Object.freeze(this);
  }

  static crear({ id, nombre, email, passwordHash }) {
    const emailNormalizado = textoObligatorio(email, 'El email', 255).toLowerCase();
    if (!PATRON_EMAIL.test(emailNormalizado)) {
      throw new ErrorDeValidacion('El email no es válido');
    }
    return new Usuario({
      id: idObligatorio(id, 'El id'),
      nombre: textoObligatorio(nombre, 'El nombre', 100),
      email: emailNormalizado,
      passwordHash: textoObligatorio(passwordHash, 'La contraseña cifrada', 255),
    });
  }
}

module.exports = { Usuario };
