// Estrategia: avisa cuando ya se usó una parte importante del presupuesto (por defecto, 80%)
// pero todavía no se llega al límite.
class ReglaAdvertencia {
  constructor({ umbral = 80 } = {}) {
    this.umbral = umbral;
  }

  evaluar({ porcentajeUsado }) {
    if (porcentajeUsado >= this.umbral && porcentajeUsado < 100) {
      return {
        nivel: 'ADVERTENCIA',
        mensaje: `Ya usaste el ${Math.round(porcentajeUsado)}% del presupuesto`,
      };
    }
    return null;
  }
}

module.exports = { ReglaAdvertencia };
