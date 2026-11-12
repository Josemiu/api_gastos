const { Dinero } = require('../../../domain/value-objects/dinero');
const { condicionDeMes } = require('./sql');

// Implementación con PostgreSQL del puerto de lectura ReporteQuery.
// La suma se hace en la base de datos, no en Node.
class ReporteQueryPostgres {
  constructor(db) {
    this.db = db;
  }

  async gastadoPorCategoria({ usuarioId, mes }) {
    const { rows } = await this.db.query(
      `SELECT categoria_id, SUM(monto) AS total
       FROM gastos
       WHERE usuario_id = $1 AND ${condicionDeMes(2)}
       GROUP BY categoria_id`,
      [usuarioId, mes.toString()],
    );
    return rows.map((fila) => ({
      categoriaId: fila.categoria_id,
      total: Dinero.crear(Number(fila.total)),
    }));
  }
}

module.exports = { ReporteQueryPostgres };
