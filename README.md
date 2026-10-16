# Sistema de Documentação Offline

Site local (Node.js + Express) para consulta à documentação **oficial**, traduzida para português, durante provas sem acesso à internet. Cobre: **Node.js, Express, JavaScript, HTML, MySQL Workbench**, além das bibliotecas de apoio necessárias para um projeto de autenticação/CRUD completo (**mysql2, jsonwebtoken, bcrypt**).

Cada página do sistema exibe, ao final, a fonte oficial original consultada (URL), para que o conteúdo possa ser auditado e nunca se afaste da documentação real.

## Como rodar (modo normal, com internet disponível para instalar)

```
npm install
npm start
```

Acesse http://localhost:3000 no navegador.

## Como preparar para o dia da prova (sem internet)

O `npm install` baixa os pacotes da internet. Isso só precisa ser feito **uma vez**, antes da prova. Depois disso, a pasta inteira do projeto (incluindo `node_modules`) pode ser copiada via pendrive/rede para os computadores da prova e funciona 100% offline, sem precisar repetir o `npm install`.

Passos recomendados:

1. Em um computador com internet, rode `npm install` dentro da pasta do projeto.
2. Copie a pasta completa (`sistema_documentacao`, incluindo `node_modules`) para cada computador da prova (ou para um só, se os alunos vão acessar por rede local).
3. Em cada computador, rode `npm start` (ou `node server.js`).
4. Os alunos acessam `http://localhost:3000` no navegador da própria máquina — ou, se for um único computador servindo a sala, `http://IP_DO_COMPUTADOR:3000` pela rede local (sem internet).

Nenhum CSS, script ou imagem é carregado de CDN externo — tudo é servido localmente pela pasta `public/`.

## Como adicionar/editar conteúdo

Cada página é um arquivo Markdown dentro de `content/<tecnologia>/`, uma das pastas:

- `content/nodejs/`
- `content/express/`
- `content/javascript/`
- `content/html/`
- `content/mysql-workbench/`
- `content/mysql2/` (driver de conexão Node.js ↔ MySQL)
- `content/jsonwebtoken/` (autenticação com token/expiração)
- `content/bcrypt/` (hash de senha)

Formato de cada arquivo (exemplo):

```markdown
---
title: "Título da página"
category: "Nome da categoria no menu"
order: 1
source: "https://url-da-documentacao-oficial"
sourceLabel: "Nome oficial da fonte"
officialTranslation: true
---

Conteúdo em Markdown aqui, em português.
```

- `officialTranslation: true` → use quando a fonte oficial **já tem** tradução em português publicada oficialmente (ex.: MDN pt-BR, Express.js pt-br). Nesse caso, o texto deve ser copiado/adaptado da própria página oficial em português.
- `officialTranslation: false` (ou omitir) → use quando a fonte oficial só existe em inglês (ex.: Node.js API docs, MySQL Reference Manual / Workbench Manual). Nesse caso, o texto é uma tradução fiel feita para este sistema, e a página exibe um aviso disso.

Depois de adicionar/editar arquivos `.md`, basta reiniciar o servidor (`Ctrl+C` e `npm start` novamente) para que o conteúdo e o índice de busca sejam atualizados. (Existe também a rota `/recarregar` para recarregar sem reiniciar o processo.)

## Fontes oficiais usadas como base

| Tecnologia | Fonte oficial | Tem pt-BR oficial? |
|---|---|---|
| JavaScript | developer.mozilla.org (MDN) | Sim |
| HTML | developer.mozilla.org (MDN) | Sim |
| Express | expressjs.com/pt-br | Sim |
| Node.js | nodejs.org/docs/latest/api | Não — tradução própria, fiel ao original |
| MySQL Workbench | dev.mysql.com/doc/workbench | Não — tradução própria, fiel ao original |
| mysql2 | sidorares.github.io/node-mysql2 | Não — tradução própria, fiel ao original |
| jsonwebtoken | github.com/auth0/node-jsonwebtoken | Não — tradução própria, fiel ao original |
| bcrypt | npmjs.com/package/bcrypt | Não — tradução própria, fiel ao original |

## Por que mysql2, jsonwebtoken e bcrypt estão incluídos

A documentação oficial do Node.js **não** ensina a conectar com o MySQL, gerar tokens com expiração ou fazer hash de senha — isso depende de pacotes de terceiros. Como a prova (modelo SENAI/SAEP) exige login com expiração e dados sensíveis (senha, CPF) protegidos, incluí a documentação oficial desses três pacotes específicos, usados no curso: `mysql2` (conexão com o banco), `jsonwebtoken` (token de login com expiração) e `bcrypt` (hash de senha). Se o curso usar outro pacote para algum desses pontos (ex.: `mysql` em vez de `mysql2`, ou sessão em vez de JWT), avise para eu ajustar o conteúdo.

## Status atual do conteúdo

23 páginas já traduzidas e revisadas, cobrindo o necessário para o tipo de prova prática apresentada (sistema de cadastro/agendamento com login, CRUD, criptografia e relacionamento entre tabelas):

- **JavaScript**: variáveis, funções, arrays/objetos, async/await, manipulação do DOM
- **HTML**: estrutura básica, formulários, tabelas
- **Node.js**: módulo `fs`, módulo `crypto` (hash e criptografia reversível para CPF)
- **Express**: roteamento, middleware, req/res, Router, tratamento de erros
- **MySQL Workbench**: visão geral da ferramenta, modelagem ER/Forward Engineering, tipos de dados, DDL (CREATE/ALTER TABLE, chaves), DML (INSERT/SELECT/UPDATE/DELETE/JOIN)
- **mysql2**: conexão/pool, consultas parametrizadas (incluindo busca e JOIN)
- **jsonwebtoken**: geração/verificação de token com expiração, middleware de autenticação
- **bcrypt**: hash e verificação de senha

Pode ser expandido a qualquer momento — basta adicionar novos arquivos `.md` seguindo o formato acima.
