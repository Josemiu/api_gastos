const { CrearCategoria } = require('../../../src/application/use-cases/crear-categoria');
const { RegistrarGasto } = require('../../../src/application/use-cases/registrar-gasto');
const { CrearPresupuesto } = require('../../../src/application/use-cases/crear-presupuesto');
const {
  CategoriaRepositorioEnMemoria,
} = require('../../../src/infrastructure/persistence/memoria/categorias');
const {
  GastoRepositorioEnMemoria,
} = require('../../../src/infrastructure/persistence/memoria/gastos');
const {
  PresupuestoRepositorioEnMemoria,
} = require('../../../src/infrastructure/persistence/memoria/presupuestos');
const { crearEvaluadorPorDefecto } = require('../../../src/domain/services/alertas');
const { GeneradorDeIdsSecuencial } = require('../../support/fakes');

async function armar() {
  const categorias = new CategoriaRepositorioEnMemoria();
  const gastos = new GastoRepositorioEnMemoria();
  const presupuestos = new PresupuestoRepositorioEnMemoria();
  const ids = new GeneradorDeIdsSecuencial();
  const categoria = await new CrearCategoria({ categorias, ids }).ejecutar({
    usuarioId: 'u1',
    nombre: 'Comida',
  });
  await new CrearPresupuesto({ presupuestos, categorias, ids }).ejecutar({
    usuarioId: 'u1',
    categoriaId: categoria.id,
    mes: '2026-11',
    limite: 200,
  });
  const registrar = new RegistrarGasto({
    gastos,
    categorias,
    presupuestos,
    ids,
    alertas: crearEvaluadorPorDefecto(),
  });
  const gastar = (monto, fecha = '2026-11-05') =>
    registrar.ejecutar({ usuarioId: 'u1', categoriaId: categoria.id, monto, fecha });
  return { gastar, registrar, categoria };
}

describe('RegistrarGasto: alertas de presupuesto', () => {
  it('no avisa mientras se use menos del 80%', async () => {
    const { gastar } = await armar();

    const { alerta } = await gastar(159.99);

    expect(alerta).toBeNull();
  });

  it('avisa una advertencia al llegar al 80%', async () => {
    const { gastar } = await armar();

    const { alerta } = await gastar(160);

    expect(alerta).toMatchObject({
      nivel: 'ADVERTENCIA',
      porcentajeUsado: 80,
      categoria: 'Comida',
    });
  });

  it('suma los gastos anteriores del mismo mes para evaluar', async () => {
    const { gastar } = await armar();
    await gastar(100);

    const { alerta } = await gastar(100);

    expect(alerta).toMatchObject({ nivel: 'EXCEDIDO', porcentajeUsado: 100 });
  });

  it('el gasto se guarda aunque se supere el presupuesto', async () => {
    const { gastar } = await armar();

    const { gasto, alerta } = await gastar(250);

    expect(gasto.monto.aNumero()).toBe(250);
    expect(alerta).toMatchObject({ nivel: 'EXCEDIDO', porcentajeUsado: 125 });
  });

  it('ignora los gastos de otros meses y los meses sin presupuesto', async () => {
    const { gastar } = await armar();
    await gastar(190, '2026-10-20');

    const otroMes = await gastar(300, '2026-12-01');
    const mismoMes = await gastar(10, '2026-11-05');

    expect(otroMes.alerta).toBeNull();
    expect(mismoMes.alerta).toBeNull();
  });
});
