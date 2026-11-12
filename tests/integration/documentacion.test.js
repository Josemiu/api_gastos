const request = require('supertest');
const { crearAppDePrueba } = require('../support/crear-app-de-prueba');
const { cargarDocumentacion } = require('../../src/infrastructure/http/documentacion');

describe('documentación OpenAPI', () => {
  const documentacion = cargarDocumentacion();

  it('sirve el documento en /openapi.json', async () => {
    const app = crearAppDePrueba();

    const res = await request(app).get('/openapi.json');

    expect(res.status).toBe(200);
    expect(res.body.openapi).toMatch(/^3\./);
    expect(res.body.info.title).toBeDefined();
  });

  it('sirve la interfaz de Swagger en /docs', async () => {
    const app = crearAppDePrueba();

    const res = await request(app).get('/docs/');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/html/);
    expect(res.text).toMatch(/swagger/i);
  });

  it('documenta todas las rutas de la API', () => {
    const esperadas = [
      ['post', '/auth/registro'],
      ['post', '/auth/login'],
      ['get', '/categorias'],
      ['post', '/categorias'],
      ['post', '/gastos'],
      ['post', '/presupuestos'],
      ['get', '/reportes/mensual'],
      ['get', '/health'],
    ];

    for (const [metodo, ruta] of esperadas) {
      expect(documentacion.paths[ruta]?.[metodo]).toBeDefined();
    }
  });

  it('marca como protegidas todas las rutas que exigen token', () => {
    const publicas = new Set(['/auth/registro', '/auth/login', '/health']);

    for (const [ruta, metodos] of Object.entries(documentacion.paths)) {
      for (const operacion of Object.values(metodos)) {
        const protegida = Array.isArray(operacion.security) && operacion.security.length > 0;
        expect([ruta, protegida]).toEqual([ruta, !publicas.has(ruta)]);
      }
    }
  });
});
