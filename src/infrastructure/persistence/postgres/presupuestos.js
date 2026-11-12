const { Presupuesto } = require('../../../domain/entities/presupuesto');
const { Dinero } = require('../../../domain/value-objects/dinero');
const { Mes } = require('../../../domain/value-objects/mes');
const { traducirUnicidad } = require('./sql');

const aEntidad = (fila) =>
  fila
    ? Presupuesto.crear({
        id: fila.id,
        usuarioId: fila.usuario_id,
        categoriaId: fila.categoria_id,
        mes: Mes.crear(fila.mes),
        limite: Dinero.crear(Number(fila.limite)),
      })
    : null;

// Implementación con PostgreSQL del puerto PresupuestoRepository.
class PresupuestoRepositorioPostgres {
  constructor(db) {
    this.db = db;
  }

  async guardar(presupuesto) {
    try {
      await this.db.query(
        `INSERT INTO presupuestos (id, usuario_id, categoria_id, mes, limite)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          presupuesto.id,
          presupuesto.usuarioId,
          presupuesto.categoriaId,
          presupuesto.mes.toString(),
          presupuesto.limite.aNumero(),
        ],
      );
    } catch (error) {
      traducirUnicidad(error, 'Ya existe un presupuesto para esa categoría y ese mes');
    }
  }

  async buscar({ usuarioId, categoriaId, mes }) {
    const { rows } = await this.db.query(
      'SELECT * FROM presupuestos WHERE usuario_id = $1 AND categoria_id = $2 AND mes = $3',
      [usuarioId, categoriaId, mes.toString()],
    );
    return aEntidad(rows[0]);
  }

  async listarPorMes({ usuarioId, mes }) {
    const { rows } = await this.db.query(
      'SELECT * FROM presupuestos WHERE usuario_id = $1 AND mes = $2',
      [usuarioId, mes.toString()],
    );
    return rows.map(aEntidad);
  }
}

module.exports = { PresupuestoRepositorioPostgres };
