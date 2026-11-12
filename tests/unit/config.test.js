const { cargarConfiguracion } = require('../../src/config');

const SECRETO = 'un-secreto-de-prueba-con-mas-de-32-caracteres';
const base = { DATABASE_URL: 'postgres://x', JWT_SECRET: SECRETO };

describe('cargarConfiguracion', () => {
  it('aplica valores por defecto y convierte el puerto a número', () => {
    const config = cargarConfiguracion({ ...base, PORT: '4000' });

    expect(config.PORT).toBe(4000);
    expect(config.NODE_ENV).toBe('development');
    expect(config.JWT_EXPIRES_IN).toBe('1h');
  });

  it('falla si falta DATABASE_URL', () => {
    expect(() => cargarConfiguracion({ JWT_SECRET: SECRETO })).toThrow(/DATABASE_URL/);
  });

  it('falla si falta JWT_SECRET o es demasiado corto', () => {
    expect(() => cargarConfiguracion({ DATABASE_URL: 'postgres://x' })).toThrow(/JWT_SECRET/);
    expect(() => cargarConfiguracion({ ...base, JWT_SECRET: 'corto' })).toThrow(/JWT_SECRET/);
  });

  it('falla si NODE_ENV tiene un valor no permitido', () => {
    expect(() => cargarConfiguracion({ ...base, NODE_ENV: 'otro' })).toThrow(/NODE_ENV/);
  });
});
