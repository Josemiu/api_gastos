const { ErrorNoAutorizado } = require('../../domain/errors');

class IniciarSesion {
  /** @param {{usuarios: UsuarioRepository, hasher: PasswordHasher, tokens: TokenService}} deps */
  constructor({ usuarios, hasher, tokens }) {
    this.usuarios = usuarios;
    this.hasher = hasher;
    this.tokens = tokens;
  }

  async ejecutar({ email, password }) {
    const usuario =
      typeof email === 'string'
        ? await this.usuarios.buscarPorEmail(email.trim().toLowerCase())
        : null;
    const coincide =
      usuario && typeof password === 'string'
        ? await this.hasher.comparar(password, usuario.passwordHash)
        : false;

    // Mismo mensaje si falla el email o la contraseña, para no revelar qué usuarios existen.
    if (!coincide) {
      throw new ErrorNoAutorizado('Credenciales inválidas');
    }

    return { token: await this.tokens.emitir({ usuarioId: usuario.id }) };
  }
}

module.exports = { IniciarSesion };
