// Pruebas contra una base de datos PostgreSQL real.
// Solo se ejecutan si existe TEST_DATABASE_URL (ver README). Cada ejecución crea un esquema
// temporal y lo borra al terminar, así no toca las tablas reales.

const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { Pool } = require('pg');
const { contratoDeTodosLosRepositorios, uuid } = require('../contracts/repositorios.contract');
const {
  UsuarioRepositorioPostgres,
} = require('../../src/infrastructure/persistence/postgres/usuarios');
const {
  CategoriaRepositorioPostgres,
} = require('../../src/infrastructure/persistence/postgres/categorias');
const {
  GastoRepositorioPostgres,
} = require('../../src/infrastructure/persistence/postgres/gastos');
const {
  PresupuestoRepositorioPostgres,
} = require('../../src/infrastructure/persistence/postgres/presupuestos');
const { ReporteQueryPostgres } = require('../../src/infrastructure/persistence/postgres/reporte');
const { Usuario } = require('../../src/domain/entities/usuario');
const { ErrorDeConflicto } = require('../../src/domain/errors');

const urlDePrueba = process.env.TEST_DATABASE_URL;
const describeConBd = urlDePrueba ? describe : describe.skip;

describeConBd('repositorios PostgreSQL', () => {
  const esquema = `test_${randomUUID().replaceAll('-', '')}`;
  let pool;

  beforeAll(async () => {
    const admin = new Pool({ connectionString: urlDePrueba });
    await admin.query(`CREATE SCHEMA ${esquema}`);
    await admin.end();

    // Cada conexión del pool arranca con el esquema temporal como esquema por defecto.
    pool = new Pool({ connectionString: urlDePrueba, options: `-c search_path=${esquema}` });

    const migracion = fs.readFileSync(
      path.join(__dirname, '../../migrations/1700000000000_esquema-inicial.sql'),
      'utf8',
    );
    const subida = migracion.split('-- Down Migration')[0];
    await pool.query(subida);
  });

  beforeEach(async () => {
    await pool.query('TRUNCATE usuarios, categorias, gastos, presupuestos CASCADE');
  });

  afterAll(async () => {
    await pool.end();
    const admin = new Pool({ connectionString: urlDePrueba });
    await admin.query(`DROP SCHEMA ${esquema} CASCADE`);
    await admin.end();
  });

  const crearEscenario = () => ({
    usuarios: new UsuarioRepositorioPostgres(pool),
    categorias: new CategoriaRepositorioPostgres(pool),
    gastos: new GastoRepositorioPostgres(pool),
    presupuestos: new PresupuestoRepositorioPostgres(pool),
    reporte: new ReporteQueryPostgres(pool),
  });

  contratoDeTodosLosRepositorios(crearEscenario);

  it('traduce la violación de unicidad del email a ErrorDeConflicto', async () => {
    const { usuarios } = crearEscenario();
    const crear = (n) =>
      Usuario.crear({ id: uuid(n), nombre: 'Ana', email: 'ana@correo.com', passwordHash: 'h' });
    await usuarios.guardar(crear(1));

    await expect(usuarios.guardar(crear(2))).rejects.toThrow(ErrorDeConflicto);
  });
});
