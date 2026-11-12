const { RegistrarUsuario } = require('./use-cases/registrar-usuario');
const { IniciarSesion } = require('./use-cases/iniciar-sesion');
const { CrearCategoria } = require('./use-cases/crear-categoria');
const { ListarCategorias } = require('./use-cases/listar-categorias');
const { RegistrarGasto } = require('./use-cases/registrar-gasto');
const { CrearPresupuesto } = require('./use-cases/crear-presupuesto');
const { ConsultarReporteMensual } = require('./use-cases/consultar-reporte-mensual');

// Conecta cada caso de uso con los puertos que necesita (inyección de dependencias).
// Recibe implementaciones cualquiera de los puertos: reales o en memoria.
function crearCasosDeUso({
  usuarios,
  categorias,
  gastos,
  presupuestos,
  reporte,
  hasher,
  tokens,
  ids,
  alertas,
}) {
  return {
    registrarUsuario: new RegistrarUsuario({ usuarios, hasher, ids }),
    iniciarSesion: new IniciarSesion({ usuarios, hasher, tokens }),
    crearCategoria: new CrearCategoria({ categorias, ids }),
    listarCategorias: new ListarCategorias({ categorias }),
    registrarGasto: new RegistrarGasto({ gastos, categorias, presupuestos, ids, alertas }),
    crearPresupuesto: new CrearPresupuesto({ presupuestos, categorias, ids }),
    consultarReporteMensual: new ConsultarReporteMensual({ reporte, presupuestos, categorias }),
  };
}

module.exports = { crearCasosDeUso };
