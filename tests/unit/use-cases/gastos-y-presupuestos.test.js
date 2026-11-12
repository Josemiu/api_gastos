const { CrearCategoria } = require('../../../src/application/use-cases/crear-categoria');
const { RegistrarGasto } = require('../../../src/application/use-cases/registrar-gasto');
const { CrearPresupuesto } = require('../../../src/application/use-cases/crear-presupuesto');
const {
  ConsultarReporteMensual,
} = require('../../../src/application/use-cases/consultar-reporte-mensual');
const {
  CategoriaRepositorioEnMemoria,
} = require('../../../src/infrastructure/persistence/memoria/categorias');
const {
  GastoRepositorioEnMemoria,
} = require('../../../src/infrastructure/persistence/memoria/gastos');
const {
  PresupuestoRepositorioEnMemoria,
} = require('../../../src/infrastructure/persistence/memoria/presupuestos');
const {
  ReporteQueryEnMemoria,
} = require('../../../src/infrastructure/persistence/memoria/reporte');
const {
  ErrorDeValidacion,
  ErrorDeConflicto,
  ErrorNoEncontrado,
} = require('../../../src/domain/errors');
const { GeneradorDeIdsSecuencial } = require('../../support/fakes');

function armar() {
  const categorias = new CategoriaRepositorioEnMemoria();
  const gastos = new GastoRepositorioEnMemoria();
  const presupuestos = new PresupuestoRepositorioEnMemoria();
  const ids = new GeneradorDeIdsSecuencial();
  return {
    crearCategoria: new CrearCategoria({ categorias, ids }),
    registrarGasto: new RegistrarGasto({ gastos, categorias, ids }),
    crearPresupuesto: new CrearPresupuesto({ presupuestos, categorias, ids }),
    consultarReporte: new ConsultarReporteMensual({
      reporte: new ReporteQueryEnMemoria(gastos),
      presupuestos,
      categorias,
    }),
  };
}

describe('CrearCategoria', () => {
  it('crea una categoría y no permite repetir el nombre para el mismo usuario', async () => {
    const { crearCategoria } = armar();

    const creada = await crearCategoria.ejecutar({ usuarioId: 'u1', nombre: 'Comida' });

    expect(creada).toMatchObject({ usuarioId: 'u1', nombre: 'Comida' });
    await expect(crearCategoria.ejecutar({ usuarioId: 'u1', nombre: 'Comida' })).rejects.toThrow(
      ErrorDeConflicto,
    );
    await expect(
      crearCategoria.ejecutar({ usuarioId: 'u2', nombre: 'Comida' }),
    ).resolves.toBeDefined();
  });
});

describe('RegistrarGasto', () => {
  it('registra un gasto en una categoría del usuario', async () => {
    const { crearCategoria, registrarGasto } = armar();
    const categoria = await crearCategoria.ejecutar({ usuarioId: 'u1', nombre: 'Comida' });

    const gasto = await registrarGasto.ejecutar({
      usuarioId: 'u1',
      categoriaId: categoria.id,
      monto: 12.5,
      descripcion: 'Almuerzo',
      fecha: '2026-11-05',
    });

    expect(gasto.monto.aNumero()).toBe(12.5);
    expect(gasto.descripcion).toBe('Almuerzo');
  });

  it('no deja usar una categoría que no existe o que es de otro usuario', async () => {
    const { crearCategoria, registrarGasto } = armar();
    const ajena = await crearCategoria.ejecutar({ usuarioId: 'u2', nombre: 'Ocio' });
    const datos = { usuarioId: 'u1', monto: 5, fecha: '2026-11-05' };

    await expect(registrarGasto.ejecutar({ ...datos, categoriaId: 'nope' })).rejects.toThrow(
      ErrorNoEncontrado,
    );
    await expect(registrarGasto.ejecutar({ ...datos, categoriaId: ajena.id })).rejects.toThrow(
      ErrorNoEncontrado,
    );
  });

  it('valida el monto y la fecha', async () => {
    const { crearCategoria, registrarGasto } = armar();
    const categoria = await crearCategoria.ejecutar({ usuarioId: 'u1', nombre: 'Comida' });
    const datos = { usuarioId: 'u1', categoriaId: categoria.id, monto: 5, fecha: '2026-11-05' };

    await expect(registrarGasto.ejecutar({ ...datos, monto: 0 })).rejects.toThrow(
      ErrorDeValidacion,
    );
    await expect(registrarGasto.ejecutar({ ...datos, monto: -3 })).rejects.toThrow(
      ErrorDeValidacion,
    );
    await expect(registrarGasto.ejecutar({ ...datos, fecha: '2026-02-30' })).rejects.toThrow(
      ErrorDeValidacion,
    );
  });
});

describe('CrearPresupuesto', () => {
  it('crea un presupuesto y no permite duplicarlo para la misma categoría y mes', async () => {
    const { crearCategoria, crearPresupuesto } = armar();
    const categoria = await crearCategoria.ejecutar({ usuarioId: 'u1', nombre: 'Comida' });
    const datos = { usuarioId: 'u1', categoriaId: categoria.id, mes: '2026-11', limite: 200 };

    const creado = await crearPresupuesto.ejecutar(datos);

    expect(creado.limite.aNumero()).toBe(200);
    await expect(crearPresupuesto.ejecutar(datos)).rejects.toThrow(ErrorDeConflicto);
    await expect(crearPresupuesto.ejecutar({ ...datos, mes: '2026-12' })).resolves.toBeDefined();
  });

  it('rechaza límite en cero y categorías ajenas', async () => {
    const { crearCategoria, crearPresupuesto } = armar();
    const ajena = await crearCategoria.ejecutar({ usuarioId: 'u2', nombre: 'Ocio' });

    await expect(
      crearPresupuesto.ejecutar({
        usuarioId: 'u1',
        categoriaId: ajena.id,
        mes: '2026-11',
        limite: 100,
      }),
    ).rejects.toThrow(ErrorNoEncontrado);

    const propia = await crearCategoria.ejecutar({ usuarioId: 'u1', nombre: 'Comida' });
    await expect(
      crearPresupuesto.ejecutar({
        usuarioId: 'u1',
        categoriaId: propia.id,
        mes: '2026-11',
        limite: 0,
      }),
    ).rejects.toThrow(ErrorDeValidacion);
  });
});

describe('ConsultarReporteMensual', () => {
  it('resume lo gastado, el límite, lo que queda y el porcentaje usado por categoría', async () => {
    const { crearCategoria, registrarGasto, crearPresupuesto, consultarReporte } = armar();
    const comida = await crearCategoria.ejecutar({ usuarioId: 'u1', nombre: 'Comida' });
    const transporte = await crearCategoria.ejecutar({ usuarioId: 'u1', nombre: 'Transporte' });
    const ocio = await crearCategoria.ejecutar({ usuarioId: 'u1', nombre: 'Ocio' });
    await crearPresupuesto.ejecutar({
      usuarioId: 'u1',
      categoriaId: comida.id,
      mes: '2026-11',
      limite: 200,
    });
    await crearPresupuesto.ejecutar({
      usuarioId: 'u1',
      categoriaId: ocio.id,
      mes: '2026-11',
      limite: 100,
    });
    const gasto = (categoriaId, monto, fecha) =>
      registrarGasto.ejecutar({ usuarioId: 'u1', categoriaId, monto, fecha });
    await gasto(comida.id, 100, '2026-11-02');
    await gasto(comida.id, 50, '2026-11-10');
    await gasto(transporte.id, 30, '2026-11-11');
    await gasto(comida.id, 999, '2026-12-01');

    const reporte = await consultarReporte.ejecutar({ usuarioId: 'u1', mes: '2026-11' });

    expect(reporte.mes).toBe('2026-11');
    expect(reporte.totalGastado.aNumero()).toBe(180);
    const fila = (nombre) => reporte.categorias.find((c) => c.nombre === nombre);
    expect(fila('Comida')).toMatchObject({ porcentajeUsado: 75 });
    expect(fila('Comida').gastado.aNumero()).toBe(150);
    expect(fila('Comida').restante.aNumero()).toBe(50);
    expect(fila('Transporte')).toMatchObject({
      limite: null,
      restante: null,
      porcentajeUsado: null,
    });
    expect(fila('Ocio').gastado.aNumero()).toBe(0);
    expect(fila('Ocio').restante.aNumero()).toBe(100);
  });

  it('valida el formato del mes', async () => {
    const { consultarReporte } = armar();

    await expect(consultarReporte.ejecutar({ usuarioId: 'u1', mes: 'noviembre' })).rejects.toThrow(
      ErrorDeValidacion,
    );
  });
});
