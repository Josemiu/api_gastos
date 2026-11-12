const { Dinero } = require('../../../src/domain/value-objects/dinero');
const { ErrorDeValidacion } = require('../../../src/domain/errors');

describe('Dinero', () => {
  it('guarda montos con hasta 2 decimales', () => {
    expect(Dinero.crear(19.99).aNumero()).toBe(19.99);
    expect(Dinero.crear(0).aNumero()).toBe(0);
  });

  it('rechaza montos negativos, con más de 2 decimales o que no son número', () => {
    expect(() => Dinero.crear(-1)).toThrow(ErrorDeValidacion);
    expect(() => Dinero.crear(1.005)).toThrow(ErrorDeValidacion);
    expect(() => Dinero.crear(NaN)).toThrow(ErrorDeValidacion);
    expect(() => Dinero.crear('10')).toThrow(ErrorDeValidacion);
  });

  it('suma sin errores de punto flotante', () => {
    const total = Dinero.crear(0.1).sumar(Dinero.crear(0.2));
    expect(total.aNumero()).toBe(0.3);
  });

  it('resta y permite un resultado negativo (por ejemplo, cuando te pasas del presupuesto)', () => {
    const restante = Dinero.crear(50).restar(Dinero.crear(70));
    expect(restante.aNumero()).toBe(-20);
  });

  it('compara montos', () => {
    expect(Dinero.crear(10).esMayorQue(Dinero.crear(5))).toBe(true);
    expect(Dinero.crear(5).esMayorQue(Dinero.crear(5))).toBe(false);
    expect(Dinero.crear(5).esMayorOIgualQue(Dinero.crear(5))).toBe(true);
    expect(Dinero.crear(5).equals(Dinero.crear(5))).toBe(true);
  });

  it('calcula el porcentaje respecto a un total', () => {
    expect(Dinero.crear(80).porcentajeDe(Dinero.crear(100))).toBe(80);
    expect(() => Dinero.crear(80).porcentajeDe(Dinero.crear(0))).toThrow(ErrorDeValidacion);
  });

  it('es inmutable y se serializa como número', () => {
    const dinero = Dinero.crear(12.5);
    expect(Object.isFrozen(dinero)).toBe(true);
    expect(JSON.stringify({ monto: dinero })).toBe('{"monto":12.5}');
  });
});
