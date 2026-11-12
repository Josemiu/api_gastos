const {
  contratoUsuarios,
  contratoCategorias,
  contratoGastos,
  contratoPresupuestos,
  contratoReporte,
} = require('../../contracts/repositorios.contract');
const {
  UsuarioRepositorioEnMemoria,
} = require('../../../src/infrastructure/persistence/memoria/usuarios');
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

describe('repositorios en memoria', () => {
  contratoUsuarios(() => new UsuarioRepositorioEnMemoria());
  contratoCategorias(() => new CategoriaRepositorioEnMemoria());
  contratoGastos(() => new GastoRepositorioEnMemoria());
  contratoPresupuestos(() => new PresupuestoRepositorioEnMemoria());
  contratoReporte(() => {
    const gastos = new GastoRepositorioEnMemoria();
    return { gastos, reporte: new ReporteQueryEnMemoria(gastos) };
  });
});
