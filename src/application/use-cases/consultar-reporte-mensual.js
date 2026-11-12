const { Dinero } = require('../../domain/value-objects/dinero');
const { Mes } = require('../../domain/value-objects/mes');

const redondear = (numero) => Math.round(numero * 100) / 100;

class ConsultarReporteMensual {
  /** @param {{reporte: ReporteQuery, presupuestos: PresupuestoRepository, categorias: CategoriaRepository}} deps */
  constructor({ reporte, presupuestos, categorias }) {
    this.reporte = reporte;
    this.presupuestos = presupuestos;
    this.categorias = categorias;
  }

  async ejecutar({ usuarioId, mes: textoMes }) {
    const mes = Mes.crear(textoMes);

    const [gastadoPorCategoria, presupuestosDelMes, categorias] = await Promise.all([
      this.reporte.gastadoPorCategoria({ usuarioId, mes }),
      this.presupuestos.listarPorMes({ usuarioId, mes }),
      this.categorias.listarPorUsuario(usuarioId),
    ]);

    const gastado = new Map(gastadoPorCategoria.map((fila) => [fila.categoriaId, fila.total]));
    const presupuesto = new Map(presupuestosDelMes.map((p) => [p.categoriaId, p]));

    // Solo aparecen las categorías que tienen gastos o presupuesto en ese mes.
    const filas = categorias
      .filter((c) => gastado.has(c.id) || presupuesto.has(c.id))
      .map((categoria) => {
        const total = gastado.get(categoria.id) ?? Dinero.crear(0);
        const limite = presupuesto.get(categoria.id)?.limite ?? null;
        return {
          categoriaId: categoria.id,
          nombre: categoria.nombre,
          gastado: total,
          limite,
          restante: limite ? limite.restar(total) : null,
          porcentajeUsado: limite ? redondear(total.porcentajeDe(limite)) : null,
        };
      })
      .sort((a, b) => a.nombre.localeCompare(b.nombre));

    const totalGastado = filas.reduce((suma, fila) => suma.sumar(fila.gastado), Dinero.crear(0));

    return { mes: mes.toString(), totalGastado, categorias: filas };
  }
}

module.exports = { ConsultarReporteMensual };
