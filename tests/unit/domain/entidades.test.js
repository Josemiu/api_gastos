const { Usuario } = require('../../../src/domain/entities/usuario');
const { Categoria } = require('../../../src/domain/entities/categoria');
const { Gasto } = require('../../../src/domain/entities/gasto');
const { Presupuesto } = require('../../../src/domain/entities/presupuesto');
const { Dinero } = require('../../../src/domain/value-objects/dinero');
const { Mes } = require('../../../src/domain/value-objects/mes');
const { ErrorDeValidacion } = require('../../../src/domain/errors');

describe('Usuario', () => {
  const datos = { id: 'u1', nombre: '  Ana  ', email: 'ANA@Correo.com', passwordHash: 'hash' };

  it('normaliza el nombre y el email', () => {
    const usuario = Usuario.crear(datos);
    expect(usuario.nombre).toBe('Ana');
    expect(usuario.email).toBe('ana@correo.com');
  });

  it('rechaza emails inválidos y nombres vacíos', () => {
    expect(() => Usuario.crear({ ...datos, email: 'no-es-email' })).toThrow(ErrorDeValidacion);
    expect(() => Usuario.crear({ ...datos, nombre: '   ' })).toThrow(ErrorDeValidacion);
    expect(() => Usuario.crear({ ...datos, passwordHash: '' })).toThrow(ErrorDeValidacion);
  });
});

describe('Categoria', () => {
  it('crea una categoría con nombre válido', () => {
    const categoria = Categoria.crear({ id: 'c1', usuarioId: 'u1', nombre: ' Comida ' });
    expect(categoria.nombre).toBe('Comida');
  });

  it('rechaza nombres vacíos o demasiado largos', () => {
    expect(() => Categoria.crear({ id: 'c1', usuarioId: 'u1', nombre: '' })).toThrow(
      ErrorDeValidacion,
    );
    expect(() => Categoria.crear({ id: 'c1', usuarioId: 'u1', nombre: 'a'.repeat(61) })).toThrow(
      ErrorDeValidacion,
    );
  });
});

describe('Gasto', () => {
  const datos = {
    id: 'g1',
    usuarioId: 'u1',
    categoriaId: 'c1',
    monto: Dinero.crear(25.5),
    fecha: '2026-11-05',
  };

  it('crea un gasto válido y calcula su mes', () => {
    const gasto = Gasto.crear(datos);
    expect(gasto.descripcion).toBe('');
    expect(gasto.mes.equals(Mes.crear('2026-11'))).toBe(true);
  });

  it('rechaza monto cero, monto que no es Dinero y fechas inexistentes', () => {
    expect(() => Gasto.crear({ ...datos, monto: Dinero.crear(0) })).toThrow(ErrorDeValidacion);
    expect(() => Gasto.crear({ ...datos, monto: 25.5 })).toThrow(ErrorDeValidacion);
    expect(() => Gasto.crear({ ...datos, fecha: '2026-02-30' })).toThrow(ErrorDeValidacion);
    expect(() => Gasto.crear({ ...datos, fecha: '05/11/2026' })).toThrow(ErrorDeValidacion);
  });
});

describe('Presupuesto', () => {
  const datos = {
    id: 'p1',
    usuarioId: 'u1',
    categoriaId: 'c1',
    mes: Mes.crear('2026-11'),
    limite: Dinero.crear(200),
  };

  it('calcula lo que queda según lo gastado', () => {
    const presupuesto = Presupuesto.crear(datos);
    expect(presupuesto.restante(Dinero.crear(150)).aNumero()).toBe(50);
    expect(presupuesto.restante(Dinero.crear(250)).aNumero()).toBe(-50);
  });

  it('rechaza un límite en cero y un mes que no es Mes', () => {
    expect(() => Presupuesto.crear({ ...datos, limite: Dinero.crear(0) })).toThrow(
      ErrorDeValidacion,
    );
    expect(() => Presupuesto.crear({ ...datos, mes: '2026-11' })).toThrow(ErrorDeValidacion);
  });
});
