const { RegistrarUsuario } = require('../../../src/application/use-cases/registrar-usuario');
const { IniciarSesion } = require('../../../src/application/use-cases/iniciar-sesion');
const {
  UsuarioRepositorioEnMemoria,
} = require('../../../src/infrastructure/persistence/memoria/usuarios');
const {
  ErrorDeValidacion,
  ErrorDeConflicto,
  ErrorNoAutorizado,
} = require('../../../src/domain/errors');
const { HasherFalso, GeneradorDeIdsSecuencial, TokenServiceFalso } = require('../../support/fakes');

function armar() {
  const usuarios = new UsuarioRepositorioEnMemoria();
  const hasher = new HasherFalso();
  return {
    usuarios,
    registrar: new RegistrarUsuario({ usuarios, hasher, ids: new GeneradorDeIdsSecuencial() }),
    iniciarSesion: new IniciarSesion({ usuarios, hasher, tokens: new TokenServiceFalso() }),
  };
}

const datos = { nombre: 'Ana', email: 'Ana@Correo.com', password: 'secreta123' };

describe('RegistrarUsuario', () => {
  it('registra al usuario, guarda la contraseña cifrada y no la devuelve', async () => {
    const { registrar, usuarios } = armar();

    const resultado = await registrar.ejecutar(datos);

    expect(resultado).toEqual({ id: 'id-1', nombre: 'Ana', email: 'ana@correo.com' });
    expect((await usuarios.buscarPorId('id-1')).passwordHash).toBe('hash(secreta123)');
  });

  it('rechaza contraseñas de menos de 8 caracteres', async () => {
    const { registrar } = armar();

    await expect(registrar.ejecutar({ ...datos, password: 'corta' })).rejects.toThrow(
      ErrorDeValidacion,
    );
  });

  it('rechaza un email ya registrado, sin importar mayúsculas', async () => {
    const { registrar } = armar();
    await registrar.ejecutar(datos);

    await expect(registrar.ejecutar({ ...datos, email: 'ana@correo.com' })).rejects.toThrow(
      ErrorDeConflicto,
    );
  });
});

describe('IniciarSesion', () => {
  it('devuelve un token con credenciales correctas', async () => {
    const { registrar, iniciarSesion } = armar();
    await registrar.ejecutar(datos);

    const resultado = await iniciarSesion.ejecutar({
      email: 'ANA@correo.com',
      password: 'secreta123',
    });

    expect(resultado).toEqual({ token: 'token-id-1' });
  });

  it('da el mismo error si la contraseña es incorrecta o el usuario no existe', async () => {
    const { registrar, iniciarSesion } = armar();
    await registrar.ejecutar(datos);

    const clave = iniciarSesion.ejecutar({ email: 'ana@correo.com', password: 'otra-clave' });
    const inexistente = iniciarSesion.ejecutar({ email: 'x@correo.com', password: 'secreta123' });

    await expect(clave).rejects.toThrow(ErrorNoAutorizado);
    await expect(inexistente).rejects.toThrow('Credenciales inválidas');
  });
});
