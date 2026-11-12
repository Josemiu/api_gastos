const { contratoDeTodosLosRepositorios } = require('../../contracts/repositorios.contract');
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
  contratoDeTodosLosRepositorios(() => {
    const gastos = new GastoRepositorioEnMemoria();
    return {
      usuarios: new UsuarioRepositorioEnMemoria(),
      categorias: new CategoriaRepositorioEnMemoria(),
      gastos,
      presupuestos: new PresupuestoRepositorioEnMemoria(),
      reporte: new ReporteQueryEnMemoria(gastos),
    };
  });
});
