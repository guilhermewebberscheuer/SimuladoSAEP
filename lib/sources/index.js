// Lista de tecnologias disponíveis. A ordem aqui é a ordem exibida no menu.
// Para incluir outro pacote npm, basta adicionar uma entrada npmReadmeSource.

const { mdnSource } = require('./mdn');
const { nodeSource } = require('./nodejs');
const { expressSource } = require('./express');
const { mysqlSource } = require('./mysql');
const { mysql2Source } = require('./mysql2');
const { npmReadmeSource } = require('./npm-readme');

const MYSQL_VERSION = process.env.MYSQL_DOCS_VERSION || '8.0';

// Interfaces da API Web usadas no front-end (DOM, eventos, fetch, formulários, storage).
const WEB_API_INTERFACES = [
  'Document_Object_Model', 'Document', 'Element', 'Node', 'NodeList', 'HTMLCollection',
  'DOMTokenList', 'EventTarget', 'Event', 'CustomEvent', 'MouseEvent', 'KeyboardEvent',
  'SubmitEvent', 'InputEvent', 'HTMLElement', 'HTMLFormElement', 'HTMLInputElement',
  'HTMLSelectElement', 'HTMLTextAreaElement', 'HTMLButtonElement', 'HTMLTableElement',
  'HTMLTableRowElement', 'HTMLOptionElement', 'HTMLAnchorElement', 'HTMLImageElement',
  'Window', 'Location', 'History', 'Console', 'console', 'Fetch_API', 'Response',
  'Request', 'Headers', 'FormData', 'URL', 'URLSearchParams', 'Storage',
  'Web_Storage_API', 'AbortController', 'Blob', 'File', 'FileReader',
].map((n) => `/en-US/docs/Web/API/${n}`);

const HTTP_PATHS = [
  '/en-US/docs/Web/HTTP/Reference/Status',
  '/en-US/docs/Web/HTTP/Reference/Methods',
  '/en-US/docs/Web/HTTP/Guides/Overview',
  '/en-US/docs/Web/HTTP/Guides/Messages',
  '/en-US/docs/Web/HTTP/Guides/CORS',
  '/en-US/docs/Web/HTTP/Guides/Cookies',
  '/en-US/docs/Web/HTTP/Guides/Session',
];

const underAny = (prefixes) => (url) => prefixes.some((p) => url === p || url.startsWith(`${p}/`));

function getSources() {
  return [
    mdnSource({
      id: 'javascript',
      name: 'JavaScript',
      description: 'Guia e referência de JavaScript (MDN)',
      rootPath: '/en-US/docs/Web/JavaScript',
    }),
    mdnSource({
      id: 'html',
      name: 'HTML',
      description: 'Referência de elementos e atributos HTML (MDN)',
      rootPath: '/en-US/docs/Web/HTML',
    }),
    mdnSource({
      id: 'css',
      name: 'CSS',
      description: 'Referência de CSS (MDN)',
      rootPath: '/en-US/docs/Web/CSS',
    }),
    mdnSource({
      id: 'web-api',
      name: 'APIs Web (DOM, fetch)',
      description: 'DOM, eventos, formulários, fetch e localStorage (MDN)',
      rootPath: '/en-US/docs/Web/API',
      include: underAny(WEB_API_INTERFACES),
    }),
    mdnSource({
      id: 'http',
      name: 'HTTP',
      description: 'Códigos de status, métodos, CORS e cookies (MDN)',
      rootPath: '/en-US/docs/Web/HTTP',
      include: underAny(HTTP_PATHS),
    }),
    nodeSource(),
    expressSource(),
    mysqlSource({
      id: 'mysql',
      name: `MySQL ${MYSQL_VERSION}`,
      description: `MySQL ${MYSQL_VERSION} Reference Manual: tutorial, tipos de dados, funções, comandos SQL, views/triggers/procedures`,
      sourceLabel: `MySQL ${MYSQL_VERSION} Reference Manual — dev.mysql.com`,
      base: `https://dev.mysql.com/doc/refman/${MYSQL_VERSION}/en/`,
      version: MYSQL_VERSION,
      start: [
        'tutorial.html',
        'language-structure.html',
        'data-types.html',
        'functions.html',
        'sql-statements.html',
        'stored-objects.html',
      ],
    }),
    mysqlSource({
      id: 'mysql-workbench',
      name: 'MySQL Workbench',
      description: 'MySQL Workbench Manual completo',
      sourceLabel: 'MySQL Workbench Manual — dev.mysql.com',
      base: 'https://dev.mysql.com/doc/workbench/en/',
      start: ['index.html'],
    }),
    mysql2Source(),
    npmReadmeSource({ id: 'jsonwebtoken', name: 'jsonwebtoken (JWT)', pkg: 'jsonwebtoken' }),
    npmReadmeSource({ id: 'bcrypt', name: 'bcrypt', pkg: 'bcrypt' }),
  ];
}

module.exports = { getSources };
