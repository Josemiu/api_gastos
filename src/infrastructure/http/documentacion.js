const fs = require('node:fs');
const path = require('node:path');
const { parse } = require('yaml');

const RUTA_OPENAPI = path.join(__dirname, '../../../docs/openapi.yaml');

// Lee el documento OpenAPI (docs/openapi.yaml) que describe la API.
const cargarDocumentacion = () => parse(fs.readFileSync(RUTA_OPENAPI, 'utf8'));

module.exports = { cargarDocumentacion };
