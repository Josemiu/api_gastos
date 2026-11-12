const { Dinero } = require('../../../domain/value-objects/dinero');
const { condicionDeMes } = require('./sql');

// Implementación con PostgreSQL del puerto GastoRepository.
class GastoRepositorioPostgres {
  constructor(db) {
    this.db = db;
  }

  async guardar(gasto) {
    await this.db.query(
      `INSERT INTO gastos (id, usuario_id, categoria_id, monto, descripcion, fecha)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        gasto.id,
        gasto.usuarioId,
        gasto.categoriaId,
        gasto.monto.aNumero(),
        gasto.descripcion,
        gasto.fecha,
      ],
    );
  }

  async totalGastado({ usuarioId, categoriaId, mes }) {
    const { rows } = await this.db.query(
      `SELECT COALESCE(SUM(monto), 0) AS total
       FROM gastos
       WHERE usuario_id = $1 AND categoria_id = $2 AND ${condicionDeMes(3)}`,
      [usuarioId, categoriaId, mes.toString()],
    );
    // NUMERIC llega como texto desde pg; se convierte a Dinero.
    return Dinero.crear(Number(rows[0].total));
  }
}

module.exports = { GastoRepositorioPostgres };
