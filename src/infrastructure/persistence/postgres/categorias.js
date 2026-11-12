const { Categoria } = require('../../../domain/entities/categoria');
const { traducirUnicidad } = require('./sql');

const aEntidad = (fila) =>
  fila ? Categoria.crear({ id: fila.id, usuarioId: fila.usuario_id, nombre: fila.nombre }) : null;

// Implementación con PostgreSQL del puerto CategoriaRepository.
class CategoriaRepositorioPostgres {
  constructor(db) {
    this.db = db;
  }

  async guardar(categoria) {
    try {
      await this.db.query('INSERT INTO categorias (id, usuario_id, nombre) VALUES ($1, $2, $3)', [
        categoria.id,
        categoria.usuarioId,
        categoria.nombre,
      ]);
    } catch (error) {
      traducirUnicidad(error, 'Ya tienes una categoría con ese nombre');
    }
  }

  async buscarPorId(id) {
    const { rows } = await this.db.query('SELECT * FROM categorias WHERE id = $1', [id]);
    return aEntidad(rows[0]);
  }

  async buscarPorNombre(usuarioId, nombre) {
    const { rows } = await this.db.query(
      'SELECT * FROM categorias WHERE usuario_id = $1 AND nombre = $2',
      [usuarioId, nombre],
    );
    return aEntidad(rows[0]);
  }

  async listarPorUsuario(usuarioId) {
    const { rows } = await this.db.query(
      'SELECT * FROM categorias WHERE usuario_id = $1 ORDER BY nombre',
      [usuarioId],
    );
    return rows.map(aEntidad);
  }
}

module.exports = { CategoriaRepositorioPostgres };
