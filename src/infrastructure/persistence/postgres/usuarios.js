const { Usuario } = require('../../../domain/entities/usuario');
const { traducirUnicidad } = require('./sql');

const aEntidad = (fila) =>
  fila
    ? Usuario.crear({
        id: fila.id,
        nombre: fila.nombre,
        email: fila.email,
        passwordHash: fila.password_hash,
      })
    : null;

// Implementación con PostgreSQL del puerto UsuarioRepository.
class UsuarioRepositorioPostgres {
  constructor(db) {
    this.db = db;
  }

  async guardar(usuario) {
    try {
      await this.db.query(
        'INSERT INTO usuarios (id, nombre, email, password_hash) VALUES ($1, $2, $3, $4)',
        [usuario.id, usuario.nombre, usuario.email, usuario.passwordHash],
      );
    } catch (error) {
      traducirUnicidad(error, 'Ya existe un usuario con ese email');
    }
  }

  async buscarPorId(id) {
    const { rows } = await this.db.query('SELECT * FROM usuarios WHERE id = $1', [id]);
    return aEntidad(rows[0]);
  }

  async buscarPorEmail(email) {
    const { rows } = await this.db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    return aEntidad(rows[0]);
  }
}

module.exports = { UsuarioRepositorioPostgres };
