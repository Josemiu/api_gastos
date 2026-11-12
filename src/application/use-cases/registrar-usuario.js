const { Usuario } = require('../../domain/entities/usuario');
const { ErrorDeValidacion, ErrorDeConflicto } = require('../../domain/errors');

const LARGO_MINIMO_PASSWORD = 8;

class RegistrarUsuario {
  /** @param {{usuarios: UsuarioRepository, hasher: PasswordHasher, ids: GeneradorDeIds}} deps */
  constructor({ usuarios, hasher, ids }) {
    this.usuarios = usuarios;
    this.hasher = hasher;
    this.ids = ids;
  }

  async ejecutar({ nombre, email, password }) {
    if (typeof password !== 'string' || password.length < LARGO_MINIMO_PASSWORD) {
      throw new ErrorDeValidacion(
        `La contraseña debe tener al menos ${LARGO_MINIMO_PASSWORD} caracteres`,
      );
    }

    const usuario = Usuario.crear({
      id: this.ids.generar(),
      nombre,
      email,
      passwordHash: await this.hasher.hashear(password),
    });

    if (await this.usuarios.buscarPorEmail(usuario.email)) {
      throw new ErrorDeConflicto('Ya existe un usuario con ese email');
    }

    await this.usuarios.guardar(usuario);
    // Nunca se devuelve la contraseña, ni siquiera cifrada.
    return { id: usuario.id, nombre: usuario.nombre, email: usuario.email };
  }
}

module.exports = { RegistrarUsuario };
