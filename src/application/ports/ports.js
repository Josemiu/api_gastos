/**
 * Puertos de la aplicación: contratos que la infraestructura debe cumplir.
 * Los casos de uso dependen solo de estas formas, nunca de pg, bcrypt ni JWT.
 * Son pequeños a propósito (segregación de interfaces): cada caso de uso recibe
 * únicamente lo que necesita.
 *
 * @typedef {Object} UsuarioRepository
 * @property {(usuario: import('../../domain/entities/usuario').Usuario) => Promise<void>} guardar
 * @property {(id: string) => Promise<Usuario|null>} buscarPorId
 * @property {(email: string) => Promise<Usuario|null>} buscarPorEmail  email ya normalizado
 *
 * @typedef {Object} CategoriaRepository
 * @property {(categoria: Categoria) => Promise<void>} guardar
 * @property {(id: string) => Promise<Categoria|null>} buscarPorId
 * @property {(usuarioId: string, nombre: string) => Promise<Categoria|null>} buscarPorNombre
 * @property {(usuarioId: string) => Promise<Categoria[]>} listarPorUsuario
 *
 * @typedef {Object} GastoRepository
 * @property {(gasto: Gasto) => Promise<void>} guardar
 * @property {(filtro: {usuarioId: string, categoriaId: string, mes: Mes}) => Promise<Dinero>} totalGastado
 *
 * @typedef {Object} PresupuestoRepository
 * @property {(presupuesto: Presupuesto) => Promise<void>} guardar
 * @property {(filtro: {usuarioId: string, categoriaId: string, mes: Mes}) => Promise<Presupuesto|null>} buscar
 * @property {(filtro: {usuarioId: string, mes: Mes}) => Promise<Presupuesto[]>} listarPorMes
 *
 * Puerto de solo lectura para los reportes (separado del de escritura de gastos).
 * @typedef {Object} ReporteQuery
 * @property {(filtro: {usuarioId: string, mes: Mes}) => Promise<Array<{categoriaId: string, total: Dinero}>>} gastadoPorCategoria
 *
 * @typedef {Object} PasswordHasher
 * @property {(plano: string) => Promise<string>} hashear
 * @property {(plano: string, hash: string) => Promise<boolean>} comparar
 *
 * @typedef {Object} TokenService
 * @property {(datos: {usuarioId: string}) => Promise<string>} emitir
 *
 * @typedef {Object} GeneradorDeIds
 * @property {() => string} generar
 */

module.exports = {};
