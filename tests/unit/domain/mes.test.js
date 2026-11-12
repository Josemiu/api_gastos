const { Mes } = require('../../../src/domain/value-objects/mes');
const { ErrorDeValidacion } = require('../../../src/domain/errors');

describe('Mes', () => {
  it('acepta el formato AAAA-MM', () => {
    expect(Mes.crear('2026-11').toString()).toBe('2026-11');
  });

  it('rechaza formatos inválidos', () => {
    for (const valor of ['2026-13', '2026-00', '26-11', '2026/11', '', null, 202611]) {
      expect(() => Mes.crear(valor)).toThrow(ErrorDeValidacion);
    }
  });

  it('se obtiene a partir de una fecha', () => {
    expect(Mes.deFecha('2026-11-05').toString()).toBe('2026-11');
  });

  it('compara meses', () => {
    expect(Mes.crear('2026-11').equals(Mes.deFecha('2026-11-30'))).toBe(true);
    expect(Mes.crear('2026-11').equals(Mes.crear('2026-12'))).toBe(false);
  });
});
