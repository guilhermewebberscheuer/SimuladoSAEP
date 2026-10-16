---
title: "Visão geral do MySQL Workbench"
category: "Fundamentos"
order: 1
source: "https://dev.mysql.com/doc/workbench/en/wb-introduction.html"
sourceLabel: "MySQL Workbench Manual — Introduction"
officialTranslation: false
---

> Tradução e adaptação da documentação oficial do MySQL Workbench (idioma original: inglês).

## O que é o MySQL Workbench

O MySQL Workbench é uma ferramenta visual unificada para arquitetos de banco de dados, desenvolvedores e administradores de banco de dados (DBAs). Ela fornece modelagem de dados, desenvolvimento SQL e ferramentas de administração abrangentes para configuração de servidor, administração de usuários, backup, entre outras funções.

O MySQL Workbench está disponível em quatro variantes principais:

- **Modelagem (Design)**: permite criar modelos de dados (diagramas ER), fazer engenharia direta e reversa entre um modelo e um banco de dados em funcionamento, e documentar o esquema.
- **Desenvolvimento SQL (SQL Development)**: permite executar consultas SQL em conexões com servidores MySQL usando o editor de SQL embutido.
- **Administração de servidor (Server Administration)**: permite administrar instâncias do MySQL Server, incluindo configuração de parâmetros, gerenciamento de usuários e permissões, backup e recuperação, e inspeção de logs.
- **Migração de dados (Data Migration)**: permite migrar de outros sistemas de banco de dados, como Microsoft SQL Server, para o MySQL.

## Áreas principais da interface

### 1. Modelagem ER (ER Diagram)

Permite criar visualmente tabelas, colunas, chaves primárias e estrangeiras, índices e relacionamentos entre tabelas, gerando um diagrama Entidade-Relacionamento (ER). A partir do modelo, é possível gerar o script SQL (*Forward Engineering*) que cria o banco de dados correspondente.

### 2. Conexões (Database Connections)

A tela inicial do Workbench lista as conexões salvas com servidores MySQL. Cada conexão armazena host, porta, usuário e esquema padrão, permitindo abrir uma nova aba de consulta SQL diretamente conectada ao servidor.

### 3. Editor SQL

Após abrir uma conexão, o editor permite escrever e executar instruções SQL (`SELECT`, `INSERT`, `UPDATE`, `DELETE`, `CREATE TABLE`, etc.), visualizar os resultados em formato de grade (semelhante a uma planilha) e exportar resultados.

### 4. Navegador de esquemas (Schemas)

No painel lateral esquerdo da aba de conexão, é possível visualizar todos os esquemas (bancos de dados) disponíveis no servidor, suas tabelas, views, stored procedures e functions.

## Engenharia direta e reversa

- **Forward Engineering**: converte um modelo criado no Workbench em um script SQL executável, que cria o banco de dados real no servidor.
- **Reverse Engineering**: faz o caminho inverso — lê um banco de dados já existente (ou um script SQL) e gera o diagrama ER correspondente no Workbench.
