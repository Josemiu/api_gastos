const request = require('supertest');
const { crearApp } = require('../../src/infrastructure/http/app');

describe('GET /health', () => {
  it('responde 200 cuando la base de datos está disponible', async () => {
    const app = crearApp({ comprobarSalud: async () => {}, casosDeUso: {}, tokens: {} });

    const respuesta = await request(app).get('/health');

    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toEqual({ estado: 'ok' });
  });

  it('responde 503 cuando la base de datos falla', async () => {
    const app = crearApp({
      comprobarSalud: async () => {
        throw new Error('sin conexión');
      },
      casosDeUso: {},
      tokens: {},
    });

    const respuesta = await request(app).get('/health');

    expect(respuesta.status).toBe(503);
    expect(respuesta.body).toEqual({ estado: 'error' });
  });
});
