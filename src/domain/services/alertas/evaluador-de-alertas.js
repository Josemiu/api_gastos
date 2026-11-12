const redondear = (numero) => Math.round(numero * 100) / 100;

// Aplica una lista de reglas (estrategias) y devuelve la primera alerta que corresponda.
// Para agregar una regla nueva basta con pasarla en la lista: este código no cambia.
class EvaluadorDeAlertas {
  constructor(reglas) {
    this.reglas = reglas;
  }

  evaluar({ gastado, limite }) {
    const porcentajeUsado = gastado.porcentajeDe(limite);
    for (const regla of this.reglas) {
      const alerta = regla.evaluar({ porcentajeUsado });
      if (alerta) {
        return { ...alerta, porcentajeUsado: redondear(porcentajeUsado) };
      }
    }
    return null;
  }
}

module.exports = { EvaluadorDeAlertas };
