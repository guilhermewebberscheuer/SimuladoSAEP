// Escopo ESSENCIAL da prova (padrão): só o que o aluno usa para resolver o simulado
// "Academia de Ginástica" em 3 horas. Mesmas regras de lib/escopo-prova.js.

const em = (base, lista) => lista.map((x) => `${base}/${x}`);

module.exports = {
  javascript: [
    ...em('Guide', [
      'Grammar_and_types', 'Control_flow_and_error_handling', 'Loops_and_iteration', 'Functions',
      'Expressions_and_operators', 'Numbers_and_strings', 'Representing_dates_times', 'Indexed_collections',
      'Working_with_objects', 'Using_promises', 'Modules',
    ]),
    ...em('Reference/Statements', [
      'if...else', 'for', 'for...of', 'while', 'try...catch', 'function', 'async_function', 'let', 'const',
      'return', 'switch', 'throw', 'export', 'import',
    ]),
    ...em('Reference/Operators', [
      'await', 'Spread_syntax', 'Destructuring', 'Optional_chaining', 'Nullish_coalescing', 'Strict_equality',
      'Logical_AND', 'Logical_OR', 'Logical_NOT', 'Conditional_operator', 'typeof', 'new',
    ]),
    'Reference/Functions/Arrow_functions',
    'Reference/Functions/Default_parameters',
    'Reference/Template_literals',
    'Reference/Global_Objects/Array',
    ...em('Reference/Global_Objects/Array', [
      'map', 'filter', 'forEach', 'find', 'findIndex', 'push', 'includes', 'join', 'sort', 'reduce', 'some', 'splice', 'length',
    ]),
    'Reference/Global_Objects/String',
    ...em('Reference/Global_Objects/String', [
      'trim', 'toLowerCase', 'toUpperCase', 'includes', 'split', 'replace', 'slice', 'padStart', 'length',
    ]),
    'Reference/Global_Objects/Number',
    'Reference/Global_Objects/Number/toFixed',
    'Reference/Global_Objects/parseInt',
    'Reference/Global_Objects/encodeURIComponent',
    'Reference/Global_Objects/Date',
    ...em('Reference/Global_Objects/Date', ['Date', 'now', 'toLocaleDateString', 'toLocaleString', 'toISOString']),
    'Reference/Global_Objects/JSON',
    ...em('Reference/Global_Objects/JSON', ['parse', 'stringify']),
    'Reference/Global_Objects/Promise',
    ...em('Reference/Global_Objects/Promise', ['then', 'catch']),
    'Reference/Global_Objects/Object',
    ...em('Reference/Global_Objects/Object', ['keys', 'entries']),
    'Reference/Global_Objects/Error',
  ],

  html: [
    ...em('Reference/Elements', [
      'html', 'head', 'body', 'title', 'meta', 'link', 'script', 'div', 'span', 'p', 'Heading_Elements', 'a', 'img',
      'ul', 'li', 'header', 'nav', 'main', 'footer',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'form', 'label', 'input', 'button', 'select', 'option', 'textarea',
    ]),
    ...em('Reference/Elements/input', ['text', 'password', 'email', 'number', 'date', 'datetime-local', 'time', 'hidden', 'submit', 'search']),
    ...em('Reference/Attributes', ['required', 'placeholder', 'maxlength', 'pattern', 'min']),
  ],

  css: [
    ...em('Reference/Selectors', ['Type_selectors', 'Class_selectors', 'ID_selectors']),
    'Guides/Flexible_box_layout/Basic_concepts',
    ...em('Reference/Properties', [
      'display', 'flex', 'justify-content', 'align-items', 'gap', 'margin', 'padding', 'border',
      'width', 'color', 'background-color', 'font-size', 'text-align',
    ]),
  ],

  'web-api': [
    ...em('Document', ['getElementById', 'querySelector', 'querySelectorAll', 'createElement', 'DOMContentLoaded_event']),
    ...em('Element', ['innerHTML', 'classList', 'remove', 'append', 'click_event']),
    ...em('Node', ['textContent', 'appendChild']),
    'EventTarget/addEventListener',
    ...em('Event', ['preventDefault', 'target']),
    ...em('HTMLFormElement', ['submit_event', 'reset']),
    'HTMLInputElement/value',
    'HTMLSelectElement/value',
    'HTMLSelectElement/add',
    'HTMLOptionElement/Option',
    'HTMLElement/dataset',
    ...em('Window', ['fetch', 'localStorage', 'location', 'alert', 'confirm']),
    'Location/href',
    'Fetch_API/Using_Fetch',
    ...em('Response', ['json', 'ok', 'status']),
    'FormData/FormData',
    'URLSearchParams/URLSearchParams',
    ...em('Storage', ['setItem', 'getItem', 'removeItem']),
  ],

  http: [
    ...em('Reference/Methods', ['GET', 'POST', 'PUT', 'DELETE']),
    ...em('Reference/Status', ['200', '201', '400', '401', '404', '500']),
  ],

  nodejs: ['crypto', 'buffer', 'process', 'environment_variables', 'modules', 'packages', 'esm', 'path'],

  express: [
    ...em('4x/starter', ['installing', 'hello-world', 'basic-routing', 'static-files']),
    ...em('4x/guide', ['routing', 'using-middleware', 'writing-middleware', 'error-handling', 'using-template-engines']),
    'guide/database-integration',
    ...em('4x/api', ['express', 'application', 'request', 'response', 'router']),
    'resources/middleware/cors',
  ],

  mysql: [
    {
      titulo: new RegExp(
        '^(' +
          [
            '5\\.3\\.1', '5\\.3\\.2', '5\\.3\\.4\\.4', '5\\.3\\.4\\.7', '5\\.3\\.4\\.9', '5\\.6\\.6', '5\\.6\\.9', // tutorial
            '13\\.1\\.2', '13\\.1\\.3', '13\\.2\\.2', '13\\.2\\.3', '13\\.3\\.2', '13\\.3\\.4', '13\\.3\\.5', // tipos
            '14\\.7', '14\\.8\\.1', '14\\.13', '14\\.19\\.1', // funções
            '15\\.1\\.9', '15\\.1\\.12', '15\\.1\\.20', '15\\.1\\.20\\.5', '15\\.1\\.24', '15\\.1\\.32', // DDL
            '15\\.2\\.2', '15\\.2\\.7', '15\\.2\\.13', '15\\.2\\.13\\.2', '15\\.2\\.17', '15\\.8\\.4', // DML
          ].join('|') +
          ') '
      ),
    },
  ],

  'mysql-workbench': [
    'wb-mysql-connections-new',
    'wb-sql-editor', 'wb-sql-editor-query-panel',
    'wb-table-editor', 'wb-table-editor-columns-tab', 'wb-table-editor-foreign-keys-tab',
    'wb-data-modeling-menus', 'wb-eer-diagram-editor', 'wb-tables', 'wb-foreign-key-relationships', 'wb-relationship-tools', 'wb-printing',
    'wb-getting-started-tutorial-creating-a-model', 'wb-basic-modeling', 'wb-basic-add-table', 'wb-basic-foreign-key',
    'wb-forward-engineering', 'wb-forward-engineering-sql-scripts', 'wb-reverse-engineering', 'wb-reverse-engineer-live',
    'wb-admin-export-import-management',
  ],

  mysql2: [
    'index',
    'examples/connections/create-connection', 'examples/connections/create-pool',
    'examples/queries/**',
    'documentation/promise-wrapper',
    'faq/how-to-handle-errors',
  ],

  jsonwebtoken: [true],
  bcrypt: [true],
};
