---
title: "Modelagem ER e Engenharia Direta (Forward Engineering)"
category: "Interface do Workbench"
order: 1
source: "https://dev.mysql.com/doc/workbench/en/wb-mysql-model-editor.html"
sourceLabel: "MySQL Workbench Manual — The MySQL Model Editor"
officialTranslation: false
---

> Tradução e adaptação da documentação oficial do MySQL Workbench (idioma original: inglês).

## Criando um novo modelo

1. Na tela inicial, em **Models**, clique em **Create New Model (EER Diagram)**.
2. Isso cria um modelo em branco com um diagrama ER (*EER Diagram*) para desenhar as tabelas.

## Criando tabelas no diagrama

1. Na barra de ferramentas do diagrama, use a ferramenta **Place a New Table**.
2. Clique na área do diagrama para posicionar a tabela.
3. Dê um duplo clique sobre a tabela para abrir o editor e definir:
   - **Column Name**: nome da coluna.
   - **Datatype**: tipo de dado (`INT`, `VARCHAR(100)`, `DATE`, etc.).
   - **PK**: marca a coluna como chave primária.
   - **NN**: marca a coluna como `NOT NULL`.
   - **UQ**: marca a coluna como `UNIQUE`.
   - **AI**: marca a coluna como `AUTO_INCREMENT`.

## Criando relacionamentos (chaves estrangeiras)

Na barra de ferramentas lateral, existem ferramentas de relacionamento, por exemplo:

- **1:n (Non-Identifying Relationship)**: usada para relacionar duas tabelas por uma chave estrangeira, sem que a chave estrangeira faça parte da chave primária da tabela filha.

Para criar: selecione a ferramenta de relacionamento, clique primeiro na tabela "um" (ex.: `aluno`) e depois na tabela "muitos" (ex.: `agendamento`). O Workbench cria automaticamente a coluna de chave estrangeira na tabela filha e desenha a linha de relacionamento no diagrama.

## Engenharia direta (Forward Engineering): do modelo para o banco de dados

Depois de montar o modelo, é possível gerar o script SQL (`CREATE TABLE`, `ALTER TABLE` com as `FOREIGN KEY`, etc.) e aplicá-lo diretamente em um servidor MySQL:

1. Menu **Database** → **Forward Engineer...**
2. Selecione a conexão com o servidor MySQL de destino.
3. Siga o assistente, revisando o script SQL gerado antes de executar.
4. Ao final, o Workbench executa o script no servidor, criando o banco de dados real a partir do modelo.

## Exportando apenas o script SQL (sem conectar a um servidor)

Também é possível apenas gerar o arquivo `.sql` do modelo, sem aplicá-lo a um servidor:

1. Menu **File** → **Export** → **Forward Engineer SQL CREATE Script...**
2. Escolha o local para salvar o arquivo `.sql`.

Esse é o caminho usado, por exemplo, para gerar um arquivo de script de criação do banco (como `banco.sql`) a partir do diagrama ER montado no Workbench.

## Engenharia reversa (Reverse Engineering): de um banco existente para o modelo

Caminho inverso: a partir de um banco já criado (ou de um script `.sql`), o Workbench gera o diagrama ER automaticamente.

1. Menu **Database** → **Reverse Engineer...**
2. Selecione a conexão (ou o arquivo `.sql`) de origem.
3. O Workbench lê as tabelas existentes e monta o diagrama ER correspondente.
