// Pruebas de contrato: cualquier implementación de un repositorio (en memoria o PostgreSQL)
// debe comportarse igual. Se reutilizan para ambas, así se comprueba que son intercambiables.

const { Usuario } = require('../../src/domain/entities/usuario');
const { Categoria } = require('../../src/domain/entities/categoria');
const { Gasto } = require('../../src/domain/entities/gasto');
const { Presupuesto } = require('../../src/domain/entities/presupuesto');
const { Dinero } = require('../../src/domain/value-objects/dinero');
const { Mes } = require('../../src/domain/value-objects/mes');

const usuario = (id = 'u1', email = 'ana@correo.com') =>
  Usuario.crear({ id, nombre: 'Ana', email, passwordHash: 'hash' });
const categoria = (id = 'c1', usuarioId = 'u1', nombre = 'Comida') =>
  Categoria.crear({ id, usuarioId, nombre });
const gasto = (id, monto, fecha = '2026-11-05', categoriaId = 'c1', usuarioId = 'u1') =>
  Gasto.crear({ id, usuarioId, categoriaId, monto: Dinero.crear(monto), fecha });
const presupuesto = (id = 'p1', mes = '2026-11', categoriaId = 'c1', usuarioId = 'u1') =>
  Presupuesto.crear({
    id,
    usuarioId,
    categoriaId,
    mes: Mes.crear(mes),
    limite: Dinero.crear(200),
  });

function contratoUsuarios(crearRepo) {
  describe('contrato de UsuarioRepository', () => {
    it('guarda y busca por id y por email', async () => {
      const repo = await crearRepo();
      await repo.guardar(usuario());

      expect((await repo.buscarPorId('u1')).email).toBe('ana@correo.com');
      expect((await repo.buscarPorEmail('ana@correo.com')).id).toBe('u1');
    });

    it('devuelve null cuando no existe', async () => {
      const repo = await crearRepo();

      expect(await repo.buscarPorId('x')).toBeNull();
      expect(await repo.buscarPorEmail('nadie@correo.com')).toBeNull();
    });
  });
}

function contratoCategorias(crearRepo) {
  describe('contrato de CategoriaRepository', () => {
    it('guarda y busca por id y por nombre dentro de un usuario', async () => {
      const repo = await crearRepo();
      await repo.guardar(categoria());

      expect((await repo.buscarPorId('c1')).nombre).toBe('Comida');
      expect((await repo.buscarPorNombre('u1', 'Comida')).id).toBe('c1');
      expect(await repo.buscarPorNombre('u2', 'Comida')).toBeNull();
    });

    it('lista solo las categorías del usuario', async () => {
      const repo = await crearRepo();
      await repo.guardar(categoria('c1', 'u1', 'Comida'));
      await repo.guardar(categoria('c2', 'u1', 'Ocio'));
      await repo.guardar(categoria('c3', 'u2', 'Otra'));

      const lista = await repo.listarPorUsuario('u1');

      expect(lista.map((c) => c.id).sort()).toEqual(['c1', 'c2']);
    });
  });
}

function contratoGastos(crearRepo) {
  describe('contrato de GastoRepository', () => {
    it('suma lo gastado por usuario, categoría y mes', async () => {
      const repo = await crearRepo();
      await repo.guardar(gasto('g1', 10.5));
      await repo.guardar(gasto('g2', 4.5));
      await repo.guardar(gasto('g3', 99, '2026-12-01'));
      await repo.guardar(gasto('g4', 99, '2026-11-02', 'c2'));

      const total = await repo.totalGastado({
        usuarioId: 'u1',
        categoriaId: 'c1',
        mes: Mes.crear('2026-11'),
      });

      expect(total.aNumero()).toBe(15);
    });

    it('devuelve cero si no hay gastos', async () => {
      const repo = await crearRepo();

      const total = await repo.totalGastado({
        usuarioId: 'u1',
        categoriaId: 'c1',
        mes: Mes.crear('2026-11'),
      });

      expect(total.aNumero()).toBe(0);
    });
  });
}

function contratoPresupuestos(crearRepo) {
  describe('contrato de PresupuestoRepository', () => {
    it('busca por usuario, categoría y mes', async () => {
      const repo = await crearRepo();
      await repo.guardar(presupuesto());

      const encontrado = await repo.buscar({
        usuarioId: 'u1',
        categoriaId: 'c1',
        mes: Mes.crear('2026-11'),
      });
      const otroMes = await repo.buscar({
        usuarioId: 'u1',
        categoriaId: 'c1',
        mes: Mes.crear('2026-12'),
      });

      expect(encontrado.id).toBe('p1');
      expect(otroMes).toBeNull();
    });

    it('lista los presupuestos de un mes', async () => {
      const repo = await crearRepo();
      await repo.guardar(presupuesto('p1', '2026-11', 'c1'));
      await repo.guardar(presupuesto('p2', '2026-11', 'c2'));
      await repo.guardar(presupuesto('p3', '2026-12', 'c1'));

      const lista = await repo.listarPorMes({ usuarioId: 'u1', mes: Mes.crear('2026-11') });

      expect(lista.map((p) => p.id).sort()).toEqual(['p1', 'p2']);
    });
  });
}

function contratoReporte(crearEscenario) {
  describe('contrato de ReporteQuery', () => {
    it('agrupa lo gastado por categoría en un mes', async () => {
      const { gastos, reporte } = await crearEscenario();
      await gastos.guardar(gasto('g1', 10, '2026-11-01', 'c1'));
      await gastos.guardar(gasto('g2', 5, '2026-11-02', 'c1'));
      await gastos.guardar(gasto('g3', 7, '2026-11-03', 'c2'));
      await gastos.guardar(gasto('g4', 50, '2026-12-01', 'c1'));

      const filas = await reporte.gastadoPorCategoria({
        usuarioId: 'u1',
        mes: Mes.crear('2026-11'),
      });
      const porCategoria = Object.fromEntries(filas.map((f) => [f.categoriaId, f.total.aNumero()]));

      expect(porCategoria).toEqual({ c1: 15, c2: 7 });
    });
  });
}

module.exports = {
  contratoUsuarios,
  contratoCategorias,
  contratoGastos,
  contratoPresupuestos,
  contratoReporte,
};
