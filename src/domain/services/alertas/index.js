const { EvaluadorDeAlertas } = require('./evaluador-de-alertas');
const { ReglaAdvertencia } = require('./regla-advertencia');
const { ReglaExcedido } = require('./regla-excedido');

// Orden importante: primero la más grave.
const crearEvaluadorPorDefecto = () =>
  new EvaluadorDeAlertas([new ReglaExcedido(), new ReglaAdvertencia()]);

module.exports = { EvaluadorDeAlertas, ReglaAdvertencia, ReglaExcedido, crearEvaluadorPorDefecto };
