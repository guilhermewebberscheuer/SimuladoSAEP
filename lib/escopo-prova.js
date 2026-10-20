// Escopo da prova: quais páginas da documentação oficial ficam visíveis.
// Baseado no simulado SENAI "Academia de Ginástica" (sistema web com login JWT,
// senha com bcrypt, CPF criptografado, CRUD de aluno / plano de treino /
// agendamento, script SQL com chaves estrangeiras e DER no MySQL Workbench).
//
// As páginas não são alteradas: o escopo só esconde páginas inteiras.
// Há dois níveis: 'essencial' (padrão, o mínimo para fazer a prova) e 'amplo'.
// Escolha com a variável ESCOPO=essencial | amplo | completo (completo = sem filtro).
//
// Regras (por tecnologia):
//   true              -> todas as páginas
//   'a/b'             -> exatamente essa página
//   'a/b/**'          -> a página 'a/b' e todas as que estão abaixo dela
//   /regex/           -> páginas cujo slug casa com a expressão
//   { titulo: /re/ }  -> páginas cujo título casa com a expressão (útil no MySQL)
//   { excluir: [...] } -> remove páginas que as outras regras incluíram

// Uma interface do MDN e alguns dos seus membros: membros('Document', ['getElementById'])
const membros = (base, lista = []) => [base, ...lista.map((m) => `${base}/${m}`)];

const amplo = {
  javascript: [
    'index',
    'Guide/**',
    { excluir: [/^Guide\/(Typed_arrays|Iterators_and_generators|Meta_programming|Internationalization|Resource_management|Memory_management|Inheritance_and_the_prototype_chain|Enumerability_and_ownership_of_properties)$/] },
    'Reference',
    'Reference/Statements/**',
    'Reference/Operators/**',
    'Reference/Functions/**',
    'Reference/Classes/**',
    'Reference/Template_literals',
    'Reference/Strict_mode',
    'Reference/Errors/**',
    'Reference/Global_Objects',
    'Reference/Global_Objects/Array/**',
    'Reference/Global_Objects/String/**',
    'Reference/Global_Objects/Number/**',
    'Reference/Global_Objects/Date/**',
    'Reference/Global_Objects/JSON/**',
    'Reference/Global_Objects/Promise/**',
    'Reference/Global_Objects/Boolean/**',
    'Reference/Global_Objects/Error/**',
    'Reference/Global_Objects/Map/**',
    'Reference/Global_Objects/Set/**',
    ...membros('Reference/Global_Objects/Object', ['keys', 'values', 'entries', 'assign', 'fromEntries', 'hasOwn']),
    ...membros('Reference/Global_Objects/Math', ['round', 'floor', 'ceil', 'random', 'max', 'min', 'abs', 'trunc']),
    ...membros('Reference/Global_Objects/RegExp', ['test', 'exec']),
    'Reference/Global_Objects/parseInt',
    'Reference/Global_Objects/parseFloat',
    'Reference/Global_Objects/isNaN',
    'Reference/Global_Objects/NaN',
    'Reference/Global_Objects/undefined',
    'Reference/Global_Objects/encodeURIComponent',
    'Reference/Global_Objects/decodeURIComponent',
    'Reference/Global_Objects/TypeError',
    'Reference/Global_Objects/SyntaxError',
    'Reference/Global_Objects/ReferenceError',
  ],

  html: [
    'index',
    'Reference',
    'Reference/Elements',
    ...[
      'html', 'head', 'body', 'title', 'meta', 'link', 'script', 'style', 'div', 'span', 'p',
      'Heading_Elements', 'a', 'img', 'br', 'hr', 'strong', 'em', 'small', 'ul', 'ol', 'li',
      'header', 'nav', 'main', 'section', 'article', 'aside', 'footer', 'dialog',
      'table', 'caption', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
      'form', 'label', 'input', 'button', 'select', 'option', 'optgroup', 'textarea', 'fieldset', 'legend', 'datalist', 'output',
    ].map((e) => `Reference/Elements/${e}`),
    ...[
      'text', 'password', 'email', 'number', 'date', 'datetime-local', 'time', 'tel', 'search',
      'hidden', 'submit', 'reset', 'button', 'checkbox', 'radio',
    ].map((t) => `Reference/Elements/input/${t}`),
    'Reference/Attributes',
    ...['required', 'pattern', 'placeholder', 'maxlength', 'minlength', 'min', 'max', 'step', 'disabled', 'readonly', 'for', 'autocomplete', 'size']
      .map((a) => `Reference/Attributes/${a}`),
    'Reference/Global_attributes/**',
    'Guides/Constraint_validation',
    'Guides/Date_and_time_formats',
    'How_to/Add_JavaScript_to_your_web_page',
    'How_to/Use_data_attributes',
  ],

  css: [
    'index',
    'Guides/Box_model/**',
    'Guides/Flexible_box_layout/Basic_concepts',
    'Guides/Selectors',
    'Reference/Selectors/Type_selectors',
    'Reference/Selectors/Class_selectors',
    'Reference/Selectors/ID_selectors',
    'Reference/Selectors/Attribute_selectors',
    'Reference/Selectors/Descendant_combinator',
    'Reference/Selectors/:hover',
    'Reference/Selectors/:focus',
    ...[
      'color', 'background-color', 'background', 'font-family', 'font-size', 'font-weight', 'text-align',
      'margin', 'padding', 'border', 'border-radius', 'border-collapse', 'width', 'height', 'max-width',
      'box-sizing', 'display', 'flex', 'flex-direction', 'flex-wrap', 'justify-content', 'align-items', 'gap',
      'cursor', 'list-style', 'text-decoration',
    ].map((p) => `Reference/Properties/${p}`),
  ],

  'web-api': [
    'Document_Object_Model/**',
    ...membros('Document', ['getElementById', 'querySelector', 'querySelectorAll', 'createElement', 'getElementsByClassName', 'DOMContentLoaded_event', 'body', 'title', 'forms']),
    ...membros('Element', ['innerHTML', 'classList', 'setAttribute', 'getAttribute', 'removeAttribute', 'remove', 'append', 'prepend', 'insertAdjacentHTML', 'querySelector', 'querySelectorAll', 'closest', 'click_event', 'input_event', 'id', 'className', 'children']),
    ...membros('Node', ['textContent', 'appendChild', 'removeChild', 'parentNode', 'replaceChild']),
    ...membros('NodeList', ['forEach']),
    'HTMLCollection',
    ...membros('DOMTokenList', ['add', 'remove', 'toggle', 'contains']),
    ...membros('EventTarget', ['addEventListener', 'removeEventListener']),
    ...membros('Event', ['preventDefault', 'target', 'currentTarget', 'stopPropagation']),
    'SubmitEvent',
    ...membros('KeyboardEvent', ['key']),
    'InputEvent',
    ...membros('HTMLElement', ['style', 'hidden', 'dataset', 'innerText', 'click', 'focus', 'change_event']),
    ...membros('HTMLFormElement', ['submit_event', 'reset', 'submit', 'elements', 'requestSubmit', 'checkValidity', 'reportValidity']),
    ...membros('HTMLInputElement', ['value', 'checked', 'valueAsDate', 'checkValidity', 'setCustomValidity', 'disabled', 'type']),
    ...membros('HTMLSelectElement', ['value', 'options', 'selectedIndex', 'add']),
    'HTMLTextAreaElement',
    'HTMLButtonElement',
    ...membros('HTMLOptionElement', ['Option']),
    ...membros('HTMLTableElement', ['insertRow', 'tBodies', 'rows']),
    ...membros('HTMLTableRowElement', ['insertCell', 'cells']),
    ...membros('Window', ['localStorage', 'sessionStorage', 'location', 'alert', 'confirm', 'prompt', 'fetch', 'setTimeout', 'load_event']),
    ...membros('Location', ['href', 'reload', 'assign', 'replace', 'search']),
    ...membros('console', ['log_static', 'error_static', 'table_static', 'warn_static']),
    'Fetch_API',
    'Fetch_API/Using_Fetch',
    ...membros('Response', ['json', 'ok', 'status', 'statusText', 'text', 'headers']),
    'Request',
    ...membros('Headers', ['Headers', 'append', 'get', 'set']),
    ...membros('FormData', ['FormData', 'get', 'append', 'entries', 'set']),
    ...membros('URLSearchParams', ['URLSearchParams', 'get', 'set', 'toString']),
    ...membros('Storage', ['setItem', 'getItem', 'removeItem', 'clear']),
    'Web_Storage_API/**',
  ],

  http: [
    'Guides/Overview',
    'Guides/Messages',
    'Guides/CORS',
    'Reference/Methods',
    ...['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => `Reference/Methods/${m}`),
    'Reference/Status',
    ...['200', '201', '204', '400', '401', '403', '404', '409', '422', '500'].map((s) => `Reference/Status/${s}`),
  ],

  nodejs: [
    'documentation', 'synopsis', 'modules', 'esm', 'packages', 'globals', 'console', 'process',
    'environment_variables', 'path', 'crypto', 'buffer', 'errors',
  ],

  express: [
    true,
    {
      excluir: [
        '4x/advanced/developing-template-engines',
        '4x/guide/behind-proxies',
        '4x/guide/debugging',
        '4x/guide/overriding-express-api',
        '4x/starter/generator',
        '4x/starter/examples',
        'advanced/best-practice-performance',
        'guide/migrating-5',
        'resources/glossary',
        /^resources\/middleware\/(?!cors$)/,
      ],
    },
  ],

  mysql: [
    { titulo: /^Chapter (5|11|13|14|15) / },
    { titulo: /^5\./ },
    { excluir: [{ titulo: /^5\.(5|7|6\.[1-5]|6\.[78]) / }] },
    { titulo: /^11\.(1|1\.[12367]|2) / },
    { titulo: /^13\.(1|1\.[1236]|2|2\.[1235]|3|3\.[1245]|6|8) / },
    { titulo: /^14\.(1|4|4\.[23]|5|6\.[12]|7|8|8\.1|10|13|15|19|19\.1) / },
    { titulo: /^15\.(1|1\.9|1\.9\.3|1\.12|1\.20|1\.20\.[56]|1\.24|1\.32|1\.37|2|2\.2|2\.7|2\.13|2\.13\.2|2\.15|2\.17|8\.1|8\.4|7\.7|7\.7\.(5|10|14|39)) / },
  ],

  'mysql-workbench': [
    'index', 'wb-home',
    'wb-mysql-connections', 'wb-mysql-connections-new', 'wb-getting-started-tutorial-create-connection',
    'wb-manage-server-connections', 'wb-mysql-connections-methods-standard',
    'wb-admin-export-import', 'wb-admin-export-import-management',
    'wb-develop', 'wb-sql-editor', 'wb-sql-editor-query-panel', 'wb-sql-editor-toolbar', 'wb-develop-sql-editor-results',
    'wb-table-editor', 'wb-table-editor-main-window', 'wb-table-editor-columns-tab', 'wb-table-editor-indexes-tab', 'wb-table-editor-foreign-keys-tab',
    'wb-develop-object-management', 'wb-sql-editor-navigator',
    'wb-data-modeling', 'wb-design-modeling-interface', 'wb-model-editor', 'wb-data-modeling-menus', 'wb-toolbar', 'wb-eer-diagrams-section',
    'wb-eer-diagram-editor', 'wb-vertical-toolbar',
    'wb-tables', 'wb-tables-physical-schemata', 'wb-using-table-tool',
    'wb-foreign-key-relationships', 'wb-relationship-tools', 'wb-relationship-editor', 'wb-connection-properties',
    'wb-design-modeling-additional', 'wb-printing', 'wb-printing-options',
    'wb-tutorials', 'wb-getting-started-tutorial-creating-a-model', 'wb-basic-modeling', 'wb-basic-add-table', 'wb-basic-foreign-key',
    'wb-importing-sql-script', 'wb-creating-eer-diagram',
    'wb-design-engineering', 'wb-forward-engineering', 'wb-forward-engineering-sql-scripts', 'wb-forward-engineering-live-server',
    'wb-reverse-engineering', 'wb-reverse-engineer-create-script', 'wb-reverse-engineer-live',
    'wb-keys',
  ],

  mysql2: [
    'index', 'documentation', 'documentation/prepared-statements', 'documentation/promise-wrapper',
    'api-and-configurations', 'examples', 'examples/connections/create-connection', 'examples/connections/create-pool',
    'examples/queries/**', 'faq', 'faq/how-to-handle-errors',
  ],

  jsonwebtoken: [true],
  bcrypt: [true],
};

module.exports = { essencial: require('./escopo-essencial'), amplo };
