const request = require('supertest');
const { crearAppDePrueba, registrarYEntrar } = require('../support/crear-app-de-prueba');

const conToken = (token) => ({ Authorization: `Bearer ${token}` });

describe('POST /auth/registro', () => {
  it('registra al usuario y no devuelve la contraseña', async () => {
    const app = crearAppDePrueba();

    const res = await request(app)
      .post('/auth/registro')
      .send({ nombre: 'Ana', email: 'Ana@Correo.com', password: 'secreta123' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ nombre: 'Ana', email: 'ana@correo.com' });
    expect(res.body.id).toBeDefined();
    expect(JSON.stringify(res.body)).not.toMatch(/secreta123|hash/i);
  });

  it('responde 409 si el email ya existe', async () => {
    const app = crearAppDePrueba();
    await registrarYEntrar(app);

    const res = await request(app)
      .post('/auth/registro')
      .send({ nombre: 'Otra', email: 'ana@correo.com', password: 'otra-clave-123' });

    expect(res.status).toBe(409);
    expect(res.body.error.codigo).toBe('CONFLICTO');
  });

  it('responde 400 con el detalle de cada campo inválido', async () => {
    const app = crearAppDePrueba();

    const res = await request(app).post('/auth/registro').send({ nombre: 5, password: 'corta' });

    expect(res.status).toBe(400);
    expect(res.body.error.codigo).toBe('VALIDACION');
    const campos = res.body.error.detalles.map((d) => d.campo);
    expect(campos).toEqual(expect.arrayContaining(['nombre', 'email']));
  });

  it('responde 400 si la contraseña es muy corta', async () => {
    const app = crearAppDePrueba();

    const res = await request(app)
      .post('/auth/registro')
      .send({ nombre: 'Ana', email: 'ana@correo.com', password: 'corta' });

    expect(res.status).toBe(400);
  });
});

describe('POST /auth/login', () => {
  it('devuelve un token con credenciales correctas', async () => {
    const app = crearAppDePrueba();

    const token = await registrarYEntrar(app);

    expect(typeof token).toBe('string');
  });

  it('responde 401 con el mismo mensaje si falla el email o la contraseña', async () => {
    const app = crearAppDePrueba();
    await registrarYEntrar(app);

    const clave = await request(app)
      .post('/auth/login')
      .send({ email: 'ana@correo.com', password: 'incorrecta1' });
    const usuario = await request(app)
      .post('/auth/login')
      .send({ email: 'nadie@correo.com', password: 'secreta123' });

    expect(clave.status).toBe(401);
    expect(usuario.status).toBe(401);
    expect(clave.body).toEqual(usuario.body);
  });
});

describe('rutas protegidas', () => {
  const rutas = [
    ['get', '/categorias'],
    ['post', '/categorias'],
    ['post', '/gastos'],
    ['post', '/presupuestos'],
    ['get', '/reportes/mensual'],
  ];

  it.each(rutas)('%s %s responde 401 sin token', async (metodo, ruta) => {
    const app = crearAppDePrueba();

    const res = await request(app)[metodo](ruta);

    expect(res.status).toBe(401);
    expect(res.body.error.codigo).toBe('NO_AUTORIZADO');
  });

  it('responde 401 con un token inválido', async () => {
    const app = crearAppDePrueba();

    const res = await request(app).get('/categorias').set(conToken('token-falso'));

    expect(res.status).toBe(401);
  });

  it('responde 401 si el encabezado no usa el esquema Bearer', async () => {
    const app = crearAppDePrueba();
    const token = await registrarYEntrar(app);

    const res = await request(app).get('/categorias').set('Authorization', token);

    expect(res.status).toBe(401);
  });
});

describe('categorías', () => {
  it('crea y lista solo las categorías del usuario autenticado', async () => {
    const app = crearAppDePrueba();
    const ana = await registrarYEntrar(app, 'ana@correo.com');
    const bea = await registrarYEntrar(app, 'bea@correo.com');

    const creada = await request(app)
      .post('/categorias')
      .set(conToken(ana))
      .send({ nombre: 'Comida' });
    await request(app).post('/categorias').set(conToken(bea)).send({ nombre: 'Ocio' });
    const lista = await request(app).get('/categorias').set(conToken(ana));

    expect(creada.status).toBe(201);
    expect(creada.body).toMatchObject({ nombre: 'Comida' });
    expect(lista.body).toEqual([{ id: creada.body.id, nombre: 'Comida' }]);
  });

  it('responde 409 si el nombre ya existe y 400 si falta', async () => {
    const app = crearAppDePrueba();
    const token = await registrarYEntrar(app);
    await request(app).post('/categorias').set(conToken(token)).send({ nombre: 'Comida' });

    const repetida = await request(app)
      .post('/categorias')
      .set(conToken(token))
      .send({ nombre: 'Comida' });
    const vacia = await request(app).post('/categorias').set(conToken(token)).send({});

    expect(repetida.status).toBe(409);
    expect(vacia.status).toBe(400);
  });
});

describe('gastos, presupuestos y reporte', () => {
  async function escenario() {
    const app = crearAppDePrueba();
    const token = await registrarYEntrar(app);
    const categoria = await request(app)
      .post('/categorias')
      .set(conToken(token))
      .send({ nombre: 'Comida' });
    return { app, token, categoriaId: categoria.body.id };
  }

  it('crea un presupuesto y responde 409 si se repite', async () => {
    const { app, token, categoriaId } = await escenario();
    const cuerpo = { categoriaId, mes: '2026-11', limite: 200 };

    const creado = await request(app).post('/presupuestos').set(conToken(token)).send(cuerpo);
    const repetido = await request(app).post('/presupuestos').set(conToken(token)).send(cuerpo);

    expect(creado.status).toBe(201);
    expect(creado.body).toMatchObject({ categoriaId, mes: '2026-11', limite: 200 });
    expect(repetido.status).toBe(409);
  });

  it('registra un gasto y avisa al llegar al 80% del presupuesto', async () => {
    const { app, token, categoriaId } = await escenario();
    await request(app)
      .post('/presupuestos')
      .set(conToken(token))
      .send({ categoriaId, mes: '2026-11', limite: 200 });

    const bajo = await request(app)
      .post('/gastos')
      .set(conToken(token))
      .send({ categoriaId, monto: 50, descripcion: 'Almuerzo', fecha: '2026-11-05' });
    const alto = await request(app)
      .post('/gastos')
      .set(conToken(token))
      .send({ categoriaId, monto: 110, fecha: '2026-11-06' });

    expect(bajo.status).toBe(201);
    expect(bajo.body.gasto).toMatchObject({ categoriaId, monto: 50, descripcion: 'Almuerzo' });
    expect(bajo.body.alerta).toBeNull();
    expect(alto.body.alerta).toMatchObject({
      nivel: 'ADVERTENCIA',
      porcentajeUsado: 80,
      categoria: 'Comida',
    });
  });

  it('valida el cuerpo del gasto', async () => {
    const { app, token, categoriaId } = await escenario();
    const enviar = (cuerpo) => request(app).post('/gastos').set(conToken(token)).send(cuerpo);

    const monto = await enviar({ categoriaId, monto: '10', fecha: '2026-11-05' });
    const negativo = await enviar({ categoriaId, monto: -5, fecha: '2026-11-05' });
    const fecha = await enviar({ categoriaId, monto: 5, fecha: '2026-02-30' });

    expect(monto.status).toBe(400);
    expect(negativo.status).toBe(400);
    expect(fecha.status).toBe(400);
  });

  it('responde 404 si la categoría es de otro usuario', async () => {
    const { app, categoriaId } = await escenario();
    const bea = await registrarYEntrar(app, 'bea@correo.com');

    const res = await request(app)
      .post('/gastos')
      .set(conToken(bea))
      .send({ categoriaId, monto: 5, fecha: '2026-11-05' });

    expect(res.status).toBe(404);
    expect(res.body.error.codigo).toBe('NO_ENCONTRADO');
  });

  it('devuelve el reporte mensual', async () => {
    const { app, token, categoriaId } = await escenario();
    await request(app)
      .post('/presupuestos')
      .set(conToken(token))
      .send({ categoriaId, mes: '2026-11', limite: 200 });
    await request(app)
      .post('/gastos')
      .set(conToken(token))
      .send({ categoriaId, monto: 150, fecha: '2026-11-05' });
    await request(app)
      .post('/gastos')
      .set(conToken(token))
      .send({ categoriaId, monto: 999, fecha: '2026-12-05' });

    const res = await request(app).get('/reportes/mensual?mes=2026-11').set(conToken(token));

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      mes: '2026-11',
      totalGastado: 150,
      categorias: [
        {
          categoriaId,
          nombre: 'Comida',
          gastado: 150,
          limite: 200,
          restante: 50,
          porcentajeUsado: 75,
        },
      ],
    });
  });

  it('responde 400 si el mes del reporte falta o es inválido', async () => {
    const { app, token } = await escenario();

    const sinMes = await request(app).get('/reportes/mensual').set(conToken(token));
    const malMes = await request(app).get('/reportes/mensual?mes=noviembre').set(conToken(token));

    expect(sinMes.status).toBe(400);
    expect(malMes.status).toBe(400);
  });
});

describe('manejo de errores', () => {
  it('responde 400 si el JSON está mal formado', async () => {
    const app = crearAppDePrueba();

    const res = await request(app)
      .post('/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"email": ');

    expect(res.status).toBe(400);
    expect(res.body.error.codigo).toBe('VALIDACION');
  });

  it('responde 404 en rutas que no existen', async () => {
    const app = crearAppDePrueba();

    const res = await request(app).get('/no-existe');

    expect(res.status).toBe(404);
    expect(res.body.error.codigo).toBe('NO_ENCONTRADO');
  });

  it('responde 500 sin filtrar detalles internos y registra el error', async () => {
    const logger = { error: jest.fn() };
    const app = crearAppDePrueba({
      logger,
      reemplazos: {
        registrarUsuario: {
          ejecutar: async () => {
            throw new Error('fallo secreto de la base de datos');
          },
        },
      },
    });

    const res = await request(app)
      .post('/auth/registro')
      .send({ nombre: 'Ana', email: 'ana@correo.com', password: 'secreta123' });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      error: { codigo: 'ERROR_INTERNO', mensaje: 'Ocurrió un error inesperado' },
    });
    expect(logger.error).toHaveBeenCalled();
  });
});
