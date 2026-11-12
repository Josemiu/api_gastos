// Estrategia: avisa cuando se alcanzó o se superó el límite del presupuesto.
class ReglaExcedido {
  evaluar({ porcentajeUsado }) {
    if (porcentajeUsado >= 100) {
      return { nivel: 'EXCEDIDO', mensaje: 'Alcanzaste o superaste el presupuesto' };
    }
    return null;
  }
}

module.exports = { ReglaExcedido };
