const {
  EvaluadorDeAlertas,
  ReglaAdvertencia,
  ReglaExcedido,
  crearEvaluadorPorDefecto,
} = require('../../../src/domain/services/alertas');
const { Dinero } = require('../../../src/domain/value-objects/dinero');

describe('reglas de alerta (Strategy)', () => {
  it('ReglaAdvertencia avisa desde el umbral hasta antes de llegar al 100%', () => {
    const regla = new ReglaAdvertencia();

    expect(regla.evaluar({ porcentajeUsado: 79.99 })).toBeNull();
    expect(regla.evaluar({ porcentajeUsado: 80 }).nivel).toBe('ADVERTENCIA');
    expect(regla.evaluar({ porcentajeUsado: 99.99 }).nivel).toBe('ADVERTENCIA');
    expect(regla.evaluar({ porcentajeUsado: 100 })).toBeNull();
  });

  it('ReglaAdvertencia permite cambiar el umbral', () => {
    const regla = new ReglaAdvertencia({ umbral: 50 });

    expect(regla.evaluar({ porcentajeUsado: 50 }).nivel).toBe('ADVERTENCIA');
  });

  it('ReglaExcedido avisa al llegar o pasar el 100%', () => {
    const regla = new ReglaExcedido();

    expect(regla.evaluar({ porcentajeUsado: 99.99 })).toBeNull();
    expect(regla.evaluar({ porcentajeUsado: 100 }).nivel).toBe('EXCEDIDO');
    expect(regla.evaluar({ porcentajeUsado: 150 }).nivel).toBe('EXCEDIDO');
  });
});

describe('EvaluadorDeAlertas', () => {
  it('devuelve null si ninguna regla aplica', () => {
    const evaluador = crearEvaluadorPorDefecto();

    expect(evaluador.evaluar({ gastado: Dinero.crear(10), limite: Dinero.crear(200) })).toBeNull();
  });

  it('devuelve la alerta con el porcentaje redondeado', () => {
    const evaluador = crearEvaluadorPorDefecto();

    const alerta = evaluador.evaluar({ gastado: Dinero.crear(170), limite: Dinero.crear(200) });

    expect(alerta).toMatchObject({ nivel: 'ADVERTENCIA', porcentajeUsado: 85 });
    expect(typeof alerta.mensaje).toBe('string');
  });

  it('usa la primera regla que aplique, en el orden recibido', () => {
    const siempre = (nivel) => ({ evaluar: () => ({ nivel, mensaje: nivel }) });
    const evaluador = new EvaluadorDeAlertas([siempre('PRIMERA'), siempre('SEGUNDA')]);

    const alerta = evaluador.evaluar({ gastado: Dinero.crear(1), limite: Dinero.crear(2) });

    expect(alerta.nivel).toBe('PRIMERA');
  });

  it('se pueden agregar reglas nuevas sin modificar el evaluador', () => {
    const critica = {
      evaluar: ({ porcentajeUsado }) =>
        porcentajeUsado >= 200 ? { nivel: 'CRITICA', mensaje: 'x' } : null,
    };
    const evaluador = new EvaluadorDeAlertas([critica, new ReglaExcedido()]);

    const alerta = evaluador.evaluar({ gastado: Dinero.crear(400), limite: Dinero.crear(200) });

    expect(alerta.nivel).toBe('CRITICA');
  });
});
