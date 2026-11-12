const request = require('supertest');
const { crearAppDePrueba } = require('../support/crear-app-de-prueba');

describe('cabeceras de seguridad (helmet)', () => {
  it('agrega cabeceras de protección y oculta que se usa Express', async () => {
    const app = crearAppDePrueba();

    const res = await request(app).get('/health');

    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-powered-by']).toBeUndefined();
    expect(res.headers['content-security-policy']).toBeDefined();
  });
});

describe('límite de peticiones', () => {
  const credenciales = { email: 'ana@correo.com', password: 'incorrecta1' };

  it('bloquea con 429 tras demasiados intentos fallidos de login', async () => {
    const app = crearAppDePrueba({
      limites: { auth: { limit: 3, windowMs: 60_000 }, global: { limit: 1000, windowMs: 60_000 } },
    });

    for (let i = 0; i < 3; i += 1) {
      const intento = await request(app).post('/auth/login').send(credenciales);
      expect(intento.status).toBe(401);
    }
    const bloqueado = await request(app).post('/auth/login').send(credenciales);

    expect(bloqueado.status).toBe(429);
    expect(bloqueado.body.error.codigo).toBe('DEMASIADAS_PETICIONES');
  });

  it('los registros y logins correctos no gastan el límite de intentos', async () => {
    const app = crearAppDePrueba({
      limites: { auth: { limit: 2, windowMs: 60_000 }, global: { limit: 1000, windowMs: 60_000 } },
    });
    const datos = { nombre: 'Ana', email: 'ana@correo.com', password: 'secreta123' };
    await request(app).post('/auth/registro').send(datos);

    for (let i = 0; i < 5; i += 1) {
      const login = await request(app).post('/auth/login').send(datos);
      expect(login.status).toBe(200);
    }
  });

  it('aplica un límite general al resto de rutas, pero no a /health', async () => {
    const app = crearAppDePrueba({
      limites: { global: { limit: 2, windowMs: 60_000 }, auth: { limit: 100, windowMs: 60_000 } },
    });

    const estados = [];
    for (let i = 0; i < 3; i += 1) {
      estados.push((await request(app).get('/categorias')).status);
    }
    const salud = await request(app).get('/health');

    expect(estados).toEqual([401, 401, 429]);
    expect(salud.status).toBe(200);
  });
});
