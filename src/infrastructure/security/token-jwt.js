const jwt = require('jsonwebtoken');
const { ErrorNoAutorizado } = require('../../domain/errors');

const ALGORITMO = 'HS256';

// Implementación del puerto TokenService con JWT.
class TokenServiceJwt {
  constructor({ secreto, expiraEn = '1h' }) {
    this.secreto = secreto;
    this.expiraEn = expiraEn;
  }

  async emitir({ usuarioId }) {
    return jwt.sign({}, this.secreto, {
      algorithm: ALGORITMO,
      subject: usuarioId,
      expiresIn: this.expiraEn,
    });
  }

  async verificar(token) {
    try {
      // Se fija el algoritmo permitido: así se rechazan tokens "alg: none" o con otro algoritmo.
      const payload = jwt.verify(token, this.secreto, { algorithms: [ALGORITMO] });
      return { usuarioId: payload.sub };
    } catch {
      throw new ErrorNoAutorizado('Token inválido o vencido');
    }
  }
}

module.exports = { TokenServiceJwt };
