// Pruebas de contrato: cualquier implementación de los repositorios (en memoria o PostgreSQL)
// debe comportarse igual. Se reutilizan para ambas, así se comprueba que son intercambiables.
//
// Cada función recibe `crearEscenario`, que devuelve repositorios limpios y compartiendo
// el mismo almacenamiento: { usuarios, categorias, gastos, presupuestos, reporte }.

const { Usuario } = require('../../src/domain/entities/usuario');
const { Categoria } = require('../../src/domain/entities/categoria');
const { Gasto } = require('../../src/domain/entities/gasto');
const { Presupuesto } = require('../../src/domain/entities/presupuesto');
const { Dinero } = require('../../src/domain/value-objects/dinero');
const { Mes } = require('../../src/domain/value-objects/mes');

// Ids con formato UUID, porque PostgreSQL los guarda como uuid.
const uuid = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const U1 = uuid(1);
const U2 = uuid(2);
const C1 = uuid(11);
const C2 = uuid(12);
const C3 = uuid(13);

const usuario = (id, email) => Usuario.crear({ id, nombre: 'Ana', email, passwordHash: 'hash' });
const categoria = (id, usuarioId, nombre) => Categoria.crear({ id, usuarioId, nombre });
const gasto = (n, monto, fecha, categoriaId = C1) =>
  Gasto.crear({
    id: uuid(100 + n),
    usuarioId: U1,
    categoriaId,
    monto: Dinero.crear(monto),
    fecha,
  });
const presupuesto = (n, mes, categoriaId) =>
  Presupuesto.crear({
    id: uuid(200 + n),
    usuarioId: U1,
    categoriaId,
    mes: Mes.crear(mes),
    limite: Dinero.crear(200),
  });

const sembrarUsuarios = async (e) => {
  await e.usuarios.guardar(usuario(U1, 'ana@correo.com'));
  await e.usuarios.guardar(usuario(U2, 'bea@correo.com'));
};
const sembrarCategorias = async (e) => {
  await sembrarUsuarios(e);
  await e.categorias.guardar(categoria(C1, U1, 'Comida'));
  await e.categorias.guardar(categoria(C2, U1, 'Ocio'));
  await e.categorias.guardar(categoria(C3, U2, 'Otra'));
};

function contratoUsuarios(crearEscenario) {
  describe('contrato de UsuarioRepository', () => {
    it('guarda y busca por id y por email', async () => {
      const e = await crearEscenario();
      await e.usuarios.guardar(usuario(U1, 'ana@correo.com'));

      expect((await e.usuarios.buscarPorId(U1)).email).toBe('ana@correo.com');
      expect((await e.usuarios.buscarPorEmail('ana@correo.com')).id).toBe(U1);
    });

    it('devuelve null cuando no existe', async () => {
      const e = await crearEscenario();

      expect(await e.usuarios.buscarPorId(uuid(99))).toBeNull();
      expect(await e.usuarios.buscarPorEmail('nadie@correo.com')).toBeNull();
    });
  });
}

function contratoCategorias(crearEscenario) {
  describe('contrato de CategoriaRepository', () => {
    it('guarda y busca por id y por nombre dentro de un usuario', async () => {
      const e = await crearEscenario();
      await sembrarCategorias(e);

      expect((await e.categorias.buscarPorId(C1)).nombre).toBe('Comida');
      expect((await e.categorias.buscarPorNombre(U1, 'Comida')).id).toBe(C1);
      expect(await e.categorias.buscarPorNombre(U2, 'Comida')).toBeNull();
      expect(await e.categorias.buscarPorId(uuid(99))).toBeNull();
    });

    it('lista solo las categorías del usuario', async () => {
      const e = await crearEscenario();
      await sembrarCategorias(e);

      const lista = await e.categorias.listarPorUsuario(U1);

      expect(lista.map((c) => c.id).sort()).toEqual([C1, C2]);
    });
  });
}

function contratoGastos(crearEscenario) {
  describe('contrato de GastoRepository', () => {
    it('suma lo gastado por usuario, categoría y mes', async () => {
      const e = await crearEscenario();
      await sembrarCategorias(e);
      await e.gastos.guardar(gasto(1, 10.5, '2026-11-05'));
      await e.gastos.guardar(gasto(2, 4.5, '2026-11-30'));
      await e.gastos.guardar(gasto(3, 99, '2026-12-01'));
      await e.gastos.guardar(gasto(4, 99, '2026-10-31'));
      await e.gastos.guardar(gasto(5, 99, '2026-11-02', C2));

      const total = await e.gastos.totalGastado({
        usuarioId: U1,
        categoriaId: C1,
        mes: Mes.crear('2026-11'),
      });

      expect(total.aNumero()).toBe(15);
    });

    it('devuelve cero si no hay gastos', async () => {
      const e = await crearEscenario();
      await sembrarCategorias(e);

      const total = await e.gastos.totalGastado({
        usuarioId: U1,
        categoriaId: C1,
        mes: Mes.crear('2026-11'),
      });

      expect(total.aNumero()).toBe(0);
    });
  });
}

function contratoPresupuestos(crearEscenario) {
  describe('contrato de PresupuestoRepository', () => {
    it('busca por usuario, categoría y mes', async () => {
      const e = await crearEscenario();
      await sembrarCategorias(e);
      await e.presupuestos.guardar(presupuesto(1, '2026-11', C1));

      const encontrado = await e.presupuestos.buscar({
        usuarioId: U1,
        categoriaId: C1,
        mes: Mes.crear('2026-11'),
      });
      const otroMes = await e.presupuestos.buscar({
        usuarioId: U1,
        categoriaId: C1,
        mes: Mes.crear('2026-12'),
      });

      expect(encontrado.id).toBe(uuid(201));
      expect(encontrado.limite.aNumero()).toBe(200);
      expect(encontrado.mes.toString()).toBe('2026-11');
      expect(otroMes).toBeNull();
    });

    it('lista los presupuestos de un mes', async () => {
      const e = await crearEscenario();
      await sembrarCategorias(e);
      await e.presupuestos.guardar(presupuesto(1, '2026-11', C1));
      await e.presupuestos.guardar(presupuesto(2, '2026-11', C2));
      await e.presupuestos.guardar(presupuesto(3, '2026-12', C1));

      const lista = await e.presupuestos.listarPorMes({ usuarioId: U1, mes: Mes.crear('2026-11') });

      expect(lista.map((p) => p.id).sort()).toEqual([uuid(201), uuid(202)]);
    });
  });
}

function contratoReporte(crearEscenario) {
  describe('contrato de ReporteQuery', () => {
    it('agrupa lo gastado por categoría en un mes', async () => {
      const e = await crearEscenario();
      await sembrarCategorias(e);
      await e.gastos.guardar(gasto(1, 10, '2026-11-01'));
      await e.gastos.guardar(gasto(2, 5, '2026-11-30'));
      await e.gastos.guardar(gasto(3, 7, '2026-11-03', C2));
      await e.gastos.guardar(gasto(4, 50, '2026-12-01'));

      const filas = await e.reporte.gastadoPorCategoria({
        usuarioId: U1,
        mes: Mes.crear('2026-11'),
      });
      const porCategoria = Object.fromEntries(filas.map((f) => [f.categoriaId, f.total.aNumero()]));

      expect(porCategoria).toEqual({ [C1]: 15, [C2]: 7 });
    });
  });
}

// Ejecuta todos los contratos sobre una implementación.
function contratoDeTodosLosRepositorios(crearEscenario) {
  contratoUsuarios(crearEscenario);
  contratoCategorias(crearEscenario);
  contratoGastos(crearEscenario);
  contratoPresupuestos(crearEscenario);
  contratoReporte(crearEscenario);
}

module.exports = { contratoDeTodosLosRepositorios, uuid };
