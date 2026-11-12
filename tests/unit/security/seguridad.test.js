const jwt = require('jsonwebtoken');
const { HasherBcrypt } = require('../../../src/infrastructure/security/hasher-bcrypt');
const { TokenServiceJwt } = require('../../../src/infrastructure/security/token-jwt');
const { GeneradorDeIdsUuid } = require('../../../src/infrastructure/security/ids-uuid');
const { ErrorNoAutorizado } = require('../../../src/domain/errors');

const SECRETO = 'un-secreto-de-prueba-con-mas-de-32-caracteres';

describe('HasherBcrypt', () => {
  // Costo bajo solo para que las pruebas sean rápidas.
  const hasher = new HasherBcrypt({ costo: 4 });

  it('no guarda la contraseña en claro y la reconoce después', async () => {
    const hash = await hasher.hashear('secreta123');

    expect(hash).not.toContain('secreta123');
    expect(await hasher.comparar('secreta123', hash)).toBe(true);
    expect(await hasher.comparar('otra-clave', hash)).toBe(false);
  });

  it('genera un hash distinto cada vez (sal aleatoria)', async () => {
    expect(await hasher.hashear('secreta123')).not.toBe(await hasher.hashear('secreta123'));
  });
});

describe('TokenServiceJwt', () => {
  const tokens = new TokenServiceJwt({ secreto: SECRETO, expiraEn: '1h' });

  it('emite un token que se puede verificar', async () => {
    const token = await tokens.emitir({ usuarioId: 'u1' });

    expect(await tokens.verificar(token)).toEqual({ usuarioId: 'u1' });
  });

  it('rechaza tokens firmados con otro secreto', async () => {
    const ajeno = jwt.sign({}, 'otro-secreto-distinto-de-32-caracteres-o-mas', { subject: 'u1' });

    await expect(tokens.verificar(ajeno)).rejects.toThrow(ErrorNoAutorizado);
  });

  it('rechaza tokens vencidos', async () => {
    const vencido = jwt.sign({}, SECRETO, { subject: 'u1', expiresIn: -10 });

    await expect(tokens.verificar(vencido)).rejects.toThrow(ErrorNoAutorizado);
  });

  it('rechaza tokens manipulados o que no son tokens', async () => {
    const token = await tokens.emitir({ usuarioId: 'u1' });

    await expect(tokens.verificar(`${token}x`)).rejects.toThrow(ErrorNoAutorizado);
    await expect(tokens.verificar('no-es-un-token')).rejects.toThrow(ErrorNoAutorizado);
    await expect(tokens.verificar(undefined)).rejects.toThrow(ErrorNoAutorizado);
  });

  it('rechaza tokens sin firma (algoritmo none)', async () => {
    const base64 = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
    const sinFirma = `${base64({ alg: 'none', typ: 'JWT' })}.${base64({ sub: 'u1' })}.`;

    await expect(tokens.verificar(sinFirma)).rejects.toThrow(ErrorNoAutorizado);
  });
});

describe('GeneradorDeIdsUuid', () => {
  it('genera UUIDs distintos', () => {
    const ids = new GeneradorDeIdsUuid();
    const a = ids.generar();

    expect(a).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(ids.generar()).not.toBe(a);
  });
});
