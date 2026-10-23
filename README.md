# Sistema de Documentação Oficial Offline

Site local (Node.js + Express) que **baixa a documentação oficial** de cada linguagem e biblioteca e a exibe **sem internet**, para provas em que só é permitido consultar a documentação oficial.

O conteúdo é copiado dos sites dos próprios mantenedores, em dois idiomas:

- **EN (original):** o texto oficial em inglês, sempre disponível.
- **PT (português):** a **versão oficial em português**, quando a própria documentação publica uma (MDN, parte do Express e do mysql2). Quando a página não tem versão em português, aparece o original em inglês com um aviso.

Nada é reescrito: o sistema só remove menus, scripts e propagandas, e ajusta os links para apontarem para a cópia local. Cada página mostra o endereço oficial de onde foi copiada.

Também existe uma **tradução automática opcional** para as páginas sem versão oficial em português (veja abaixo). Ela é sempre marcada como "não oficial" e fica escondida no modo prova.

## O que é baixado

| Tecnologia | Fonte oficial | Páginas (aprox.) | Com versão oficial em português |
|---|---|---|---|
| JavaScript | MDN Web Docs — developer.mozilla.org | 1.340 | 507 |
| HTML | MDN Web Docs | 260 | 122 |
| CSS | MDN Web Docs | 1.280 | 214 |
| APIs Web (DOM, eventos, fetch, formulários, localStorage) | MDN Web Docs | 1.200 | 254 |
| HTTP (status, métodos, CORS, cookies) | MDN Web Docs | 90 | 74 |
| Node.js (API completa) | nodejs.org/dist/&lt;versão&gt;/docs/api | 64 | não existe |
| Express 4.x | expressjs.com | 44 | 34 (guias; a referência da API é só em inglês) |
| MySQL 8.0 Reference Manual (tutorial, tipos de dados, funções, comandos SQL, views/triggers/procedures) | dev.mysql.com/doc/refman | 480 | não existe |
| MySQL Workbench Manual | dev.mysql.com/doc/workbench | 245 | não existe |
| mysql2 | sidorares.github.io/node-mysql2 | 47 | 4 |
| jsonwebtoken, bcrypt | README oficial publicado no npm | 1 cada | não existe |

As versões em português do MDN são mantidas pela comunidade oficial e às vezes estão menos atualizadas que o original; por isso cada página em português tem um link para o original em inglês.

Para ver a lista: `npm run baixar-docs -- --listar`. Para incluir outro pacote npm ou outra seção do MDN, edite [lib/sources/index.js](lib/sources/index.js).

## Passo a passo para a prova

### 1. Em um computador com internet (uma vez só)

```
npm install
npm run baixar-docs
```

O download leva cerca de 10 minutos e ocupa algumas centenas de MB na pasta `docs/`. Se cair a conexão, é só rodar o mesmo comando de novo: ele continua de onde parou.

Opções úteis:

```
npm run baixar-docs -- javascript nodejs   # só algumas tecnologias
npm run baixar-docs -- --forcar            # baixa tudo de novo (atualiza)
npm run baixar-docs -- --sem-imagens       # não baixa imagens
```

Versões (variáveis de ambiente, antes de rodar o download):

- `NODE_DOCS_VERSION=v22.11.0`: versão da documentação do Node.js. O padrão é a versão do Node instalada no computador que faz o download. **Use a mesma versão das máquinas da prova.**
- `EXPRESS_DOCS_VERSION=5x`: documentação do Express 5. O padrão é `4x`.
- `MYSQL_DOCS_VERSION=8.4`: versão do manual do MySQL. O padrão é `8.0`.

### 2. Copiar para os computadores da prova

Copie a pasta inteira do projeto, **incluindo `node_modules` e `docs`**, via pendrive ou rede. Não é preciso rodar `npm install` de novo.

### 3. No dia da prova (sem internet)

```
npm run start:prova
```

Acesse **http://localhost:3322** no navegador. Se um único computador servir a sala, os alunos acessam `http://IP_DO_COMPUTADOR:3322` pela rede local.

`npm run start:prova` liga o **modo prova**: só aparece conteúdo oficial (o original em inglês e as versões oficiais em português). As traduções automáticas ficam escondidas. Para usar também a tradução automática, rode `npm start`.

Nenhum CSS, script ou imagem é carregado da internet. Tudo vem das pastas `public/` e `docs/`. Links para páginas que não foram baixadas aparecem com ↗ e só funcionam com internet.

## Escopo da prova

Por padrão o sistema **mostra só as páginas que o aluno precisa para a prova**, com base no simulado SENAI "Academia de Ginástica": login com JWT e expiração, senha com bcrypt, CPF criptografado (Node `crypto`), CRUD com busca e edição, listagem com JOIN ordenada por data, script SQL com chaves estrangeiras e DER no MySQL Workbench.

- As páginas exibidas **não são alteradas**: o escopo só esconde páginas inteiras. Menu, busca e acesso direto por endereço respeitam o escopo; links para páginas fora dele aparecem como externos (↗).
Há três níveis, escolhidos pela variável `ESCOPO`:

| Nível | Páginas | O que é |
|---|---|---|
| `essencial` (padrão) | ~280 | o mínimo para resolver a prova — lista em [lib/escopo-essencial.js](lib/escopo-essencial.js) |
| `amplo` | ~1.100 | o essencial mais assuntos relacionados — lista em [lib/escopo-prova.js](lib/escopo-prova.js) |
| `completo` | ~5.000 | toda a documentação baixada |

No PowerShell: `$env:ESCOPO="amplo"; npm run start:prova`. Para incluir ou tirar uma página, edite a lista do nível e reinicie o servidor.

O que fica visível no nível **essencial**, por tecnologia:

| Tecnologia | O que entra |
|---|---|
| JavaScript (83) | guias básicos (tipos, condições, laços, funções, objetos, arrays, datas, promises, módulos); if, for, try...catch, async/await, let/const; operadores mais usados; Array (map, filter, find, sort...), String (trim, split, includes...), Date, JSON, Promise, Object |
| HTML (47) | estrutura da página, tabelas, formulários, tipos de `input` usados num cadastro e atributos de validação |
| CSS (17) | seletores de tipo/classe/id, flexbox e propriedades básicas de espaçamento, cor e texto |
| APIs Web (34) | buscar elementos, alterar conteúdo, eventos e submit de formulário, fetch e resposta JSON, FormData, localStorage, redirecionamento |
| HTTP (10) | métodos GET/POST/PUT/DELETE e status 200, 201, 400, 401, 404, 500 |
| Node.js (6) | crypto, Buffer, process, variáveis de ambiente, módulos, path |
| Express (16) | instalação, rotas, middlewares, erros, arquivos estáticos, template engines, banco de dados, API (express, app, req, res, router), cors |
| MySQL (29) | CREATE DATABASE/TABLE, FOREIGN KEY, ALTER/DROP TABLE, INSERT, SELECT, JOIN, UPDATE, DELETE, USE; tipos INT, DECIMAL, VARCHAR, TEXT, ENUM, DATE/DATETIME/TIME; funções de data, LIKE, criptografia e COUNT |
| MySQL Workbench (21) | conexão, editor SQL, editor de tabelas e chaves estrangeiras, diagrama EER, exportar/imprimir o diagrama, engenharia direta e reversa, exportar o script SQL |
| mysql2 (15) | conexão, pool, consultas simples e prepared statements (CRUD), promises, tratamento de erros |
| jsonwebtoken, bcrypt (2) | README completo |

## Busca

A busca no topo procura em todas as documentações ao mesmo tempo, ou só na tecnologia atual. Ela leva direto à seção da página (por exemplo, `res.json` abre a seção `res.json()` da página Response do Express). Como o conteúdo é em inglês, busque com termos em inglês: `array map`, `foreign key`, `inner join`, `addEventListener`.

## Tradução automática para português (opcional, paga)

Para as páginas **sem** versão oficial em português (Node.js, MySQL, referência da API do Express etc.), é possível gerar uma tradução automática. Ela aparece no modo PT, fora do modo prova. A tradução:

- é gerada **antes**, com internet, e fica salva em `docs/<tecnologia>/pt/`, então depois também funciona offline;
- usa a API do Claude (Anthropic). É preciso uma chave em `ANTHROPIC_API_KEY`;
- traduz só o texto. Blocos de código, nomes de funções, comandos e URLs ficam como no original;
- aparece sempre com o aviso **"Tradução automática — não é a documentação oficial"** e um link para o original.

```
npm run traduzir -- --estimar                         # só mostra o custo estimado
npm run traduzir -- express nodejs                    # traduz algumas tecnologias
npm run traduzir -- --limite=20                       # traduz no máximo 20 páginas
npm run traduzir -- --modelo=claude-haiku-5-5         # modelo mais barato
npm run traduzir                                      # traduz tudo o que falta
```

Páginas que já têm versão oficial em português são puladas. Use `--estimar` para ver o custo antes; com `claude-haiku-5-5` a documentação inteira custa poucos dólares. O comando `--estimar` mostra o valor exato para o que você escolher. Páginas já traduzidas são puladas, então dá para traduzir aos poucos. Depois de traduzir, reinicie o servidor ou acesse `/recarregar`.

> Atenção: a regra da prova fala em documentação **oficial**. A tradução automática não é oficial; por isso o modo prova a esconde. As versões oficiais em português continuam visíveis.

## Estrutura

```
server.js                 servidor web (porta 3322)
scripts/baixar-docs.js    download da documentação oficial
scripts/traduzir.js       tradução automática opcional
lib/sources/              uma fonte por site oficial (MDN, Node, Express, MySQL, npm)
lib/html.js               limpeza do HTML baixado (sem alterar o texto)
lib/library.js            leitura das páginas e reescrita de links para a cópia local
lib/search.js             índice de busca
lib/translate.js          chamada à API do Claude para tradução
docs/                     documentação baixada (gerada; fora do git)
views/, public/           interface
```

A pasta `content/` guarda as 23 páginas resumidas e traduzidas à mão da versão anterior do sistema. Ela **não é mais exibida**, porque esse material não é documentação oficial.
# SimuladoSAEP
