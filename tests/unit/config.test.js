const { cargarConfiguracion } = require('../../src/config');

describe('cargarConfiguracion', () => {
  it('aplica valores por defecto y convierte el puerto a número', () => {
    const config = cargarConfiguracion({ DATABASE_URL: 'postgres://x', PORT: '4000' });

    expect(config.PORT).toBe(4000);
    expect(config.NODE_ENV).toBe('development');
  });

  it('falla si falta DATABASE_URL', () => {
    expect(() => cargarConfiguracion({})).toThrow(/DATABASE_URL/);
  });

  it('falla si NODE_ENV tiene un valor no permitido', () => {
    expect(() => cargarConfiguracion({ DATABASE_URL: 'postgres://x', NODE_ENV: 'otro' })).toThrow(
      /NODE_ENV/,
    );
  });
});
