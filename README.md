# API de Gastos y Presupuestos

API REST para registrar gastos por categoría, definir presupuestos mensuales y consultar cuánto se ha gastado y cuánto queda. Al registrar un gasto, la respuesta avisa si ya se usó el 80% del presupuesto o si se alcanzó el 100%.

Es un proyecto personal para practicar arquitectura limpia en Node.js: el foco está en cómo se organiza el código, no en la cantidad de funciones.

## Tecnologías

- Node.js 22 y Express 5
- PostgreSQL 16 (`pg`, sin ORM) y migraciones con `node-pg-migrate`
- Zod para validar los datos de entrada
- JWT (`jsonwebtoken`) y bcrypt (`bcryptjs`) para la autenticación
- Jest y Supertest para las pruebas
- Swagger UI (OpenAPI 3), Helmet y `express-rate-limit`
- Docker Compose para la base de datos, GitHub Actions para el CI

## Arquitectura

Usa arquitectura hexagonal: las reglas de negocio no dependen de Express ni de PostgreSQL, sino que se conectan con ellos a través de puertos.

```
src/
├── domain/                  Reglas de negocio puras
│   ├── entities/            Usuario, Categoria, Gasto, Presupuesto
│   ├── value-objects/       Dinero (en centavos), Mes
│   ├── services/alertas/    Reglas de alerta (patrón Strategy)
│   └── errors/              Errores de dominio
├── application/
│   ├── use-cases/           Un caso de uso por acción
│   ├── ports/               Contratos que debe cumplir la infraestructura
│   └── crear-casos-de-uso.js
├── infrastructure/
│   ├── persistence/
│   │   ├── postgres/        Repositorios reales
│   │   └── memoria/         Repositorios en memoria (para pruebas)
│   ├── security/            bcrypt, JWT, generador de ids
│   └── http/                Rutas, controladores, validación, errores, documentación
├── config/                  Variables de entorno validadas con Zod
└── main.js                  Composición: conecta todo
```

### Principios aplicados

- **Responsabilidad única:** cada caso de uso hace una sola cosa y los controladores solo traducen HTTP.
- **Abierto/cerrado:** las alertas son estrategias. Agregar una regla nueva es crear una clase y añadirla a la lista; el evaluador no cambia.
- **Sustitución de Liskov:** los repositorios en memoria y los de PostgreSQL pasan las mismas pruebas de contrato (`tests/contracts`).
- **Segregación de interfaces:** puertos pequeños. Los reportes usan un puerto de solo lectura, separado del de escritura.
- **Inversión de dependencias:** los casos de uso dependen de los puertos, y `main.js` inyecta las implementaciones.

### Decisiones de diseño

- **`Dinero` guarda centavos como enteros** para evitar errores de punto flotante (`0.1 + 0.2`). Los porcentajes se calculan multiplicando antes de dividir para que los umbrales sean exactos.
- **Superar un presupuesto no bloquea el gasto.** El gasto ya ocurrió, así que se guarda siempre y solo se devuelve una alerta.
- **Una categoría de otro usuario se trata como inexistente (404).** Así no se revela qué datos existen.
- **El login responde igual si falla el email o la contraseña**, para no revelar qué correos están registrados.
- **El algoritmo del JWT está fijado a HS256** al verificar, lo que rechaza tokens `alg: none`.
- **Los errores se traducen a HTTP en un solo lugar** (`manejador-de-errores.js`). Los errores inesperados devuelven 500 sin detalles internos.

## Cómo ejecutarlo

Requisitos: Node.js 22 y Docker.

```bash
npm install
cp .env.example .env     # en Windows (cmd): copy .env.example .env
```

Edita `.env` y completa `JWT_SECRET` (mínimo 32 caracteres). Puedes generar uno con:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Levanta la base de datos, crea las tablas e inicia la API:

```bash
docker compose up -d
npm run migrate up
npm run dev
```

- API: http://localhost:3000
- Documentación interactiva: http://localhost:3000/docs
- Documento OpenAPI: http://localhost:3000/openapi.json
- Estado: http://localhost:3000/health

La base de datos queda en el puerto **5433** del equipo, para no chocar con un PostgreSQL local.

### Imagen Docker de la API

```bash
docker build -t api-gastos .
```

La imagen no incluye las migraciones: se ejecutan aparte con `npm run migrate up`.

## Endpoints

| Método | Ruta                            | Auth | Descripción                              |
| ------ | ------------------------------- | ---- | ---------------------------------------- |
| POST   | `/auth/registro`                | No   | Crea un usuario                          |
| POST   | `/auth/login`                   | No   | Devuelve un token JWT                    |
| GET    | `/categorias`                   | Sí   | Lista las categorías del usuario         |
| POST   | `/categorias`                   | Sí   | Crea una categoría                       |
| POST   | `/gastos`                       | Sí   | Registra un gasto (con alerta)           |
| POST   | `/presupuestos`                 | Sí   | Crea el presupuesto de un mes            |
| GET    | `/reportes/mensual?mes=AAAA-MM` | Sí   | Gastado, límite y restante por categoría |
| GET    | `/health`                       | No   | Estado de la API y la base de datos      |

Las rutas protegidas piden el encabezado `Authorization: Bearer <token>`.

### Ejemplo de uso

```bash
curl -X POST localhost:3000/auth/registro -H "Content-Type: application/json" \
  -d '{"nombre":"Ana","email":"ana@correo.com","password":"secreta123"}'

curl -X POST localhost:3000/auth/login -H "Content-Type: application/json" \
  -d '{"email":"ana@correo.com","password":"secreta123"}'
# -> {"token":"..."}

curl -X POST localhost:3000/categorias -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" -d '{"nombre":"Comida"}'

curl -X POST localhost:3000/presupuestos -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"categoriaId":"<id>","mes":"2026-11","limite":200}'

curl -X POST localhost:3000/gastos -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"categoriaId":"<id>","monto":170,"fecha":"2026-11-05"}'
# -> alerta ADVERTENCIA con porcentajeUsado 85
```

## Pruebas

```bash
npm test              # unitarias y de API (sin base de datos)
npm run test:db       # además, repositorios contra PostgreSQL real
npm run test:coverage # cobertura
npm run lint
```

- Las pruebas del dominio y de los casos de uso no usan base de datos ni servidor.
- Las pruebas de la API usan Supertest con repositorios en memoria, pero con bcrypt y JWT reales.
- `npm run test:db` necesita `TEST_DATABASE_URL` en `.env`. Crea un esquema temporal y lo borra al terminar, sin tocar tus tablas.
- El CI (GitHub Actions) corre lint, formato y todas las pruebas, incluidas las de PostgreSQL.

## Seguridad

- Contraseñas con bcrypt y tokens JWT con vencimiento (`JWT_EXPIRES_IN`, por defecto 1 hora).
- Consultas SQL parametrizadas.
- Cabeceras de seguridad con Helmet.
- Límite de peticiones: 100 por minuto por IP en general, y 10 intentos fallidos cada 15 minutos en `/auth`.
- Cada usuario solo accede a sus propios datos.

## Limitaciones conocidas

Es un proyecto acotado a propósito. Algunas cosas que no incluye:

- No hay edición ni borrado de categorías, gastos y presupuestos, ni listado de gastos.
- No hay refresh tokens ni recuperación de contraseña.
- No usa transacciones: dos gastos simultáneos podrían calcular mal una alerta.
- Detrás de un proxy inverso hay que configurar `trust proxy` en Express para que el límite de peticiones identifique bien la IP del cliente.
