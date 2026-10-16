---
title: "INSERT, SELECT, UPDATE, DELETE e JOIN"
category: "SQL"
order: 4
source: "https://dev.mysql.com/doc/refman/8.4/en/sql-data-manipulation-statements.html"
sourceLabel: "MySQL Reference Manual — Data Manipulation Statements"
officialTranslation: false
---

> Tradução e adaptação da documentação oficial do MySQL Reference Manual (idioma original: inglês).

## INSERT — inserir dados

```sql
INSERT INTO aluno (nome, cpf, email) VALUES ('Ana Souza', '12345678900', 'ana@email.com');

-- inserindo vários registros de uma vez
INSERT INTO aluno (nome, cpf, email) VALUES
  ('Ana Souza', '11111111111', 'ana@email.com'),
  ('Bruno Lima', '22222222222', 'bruno@email.com'),
  ('Carla Melo', '33333333333', 'carla@email.com');
```

## SELECT — consultar dados

```sql
SELECT * FROM aluno;
SELECT nome, email FROM aluno;
SELECT * FROM aluno WHERE nome = 'Ana Souza';
SELECT * FROM aluno WHERE nome LIKE '%ana%';       -- busca parcial, sem diferenciar maiúsculas/minúsculas por padrão
SELECT * FROM aluno ORDER BY nome ASC;
SELECT * FROM aluno ORDER BY id DESC LIMIT 10;
```

## UPDATE — atualizar dados

```sql
UPDATE aluno SET email = 'novoemail@email.com' WHERE id = 1;
UPDATE agendamento SET data_aula = '2026-03-10 14:00:00' WHERE id = 5;
```

**Atenção:** sempre use `WHERE` em um `UPDATE`. Sem `WHERE`, todas as linhas da tabela são atualizadas.

## DELETE — remover dados

```sql
DELETE FROM aluno WHERE id = 1;
```

**Atenção:** o mesmo vale para `DELETE` — sem `WHERE`, todas as linhas são apagadas.

## JOIN — combinando dados de várias tabelas

Usado quando é preciso trazer dados relacionados por chave estrangeira em uma única consulta (ex.: listar agendamentos mostrando o nome do aluno e a descrição do plano, não apenas os IDs).

```sql
SELECT
  ag.id,
  ag.data_aula,
  al.nome AS aluno_nome,
  pt.descricao AS plano_descricao
FROM agendamento ag
JOIN aluno al ON al.id = ag.aluno_id
JOIN plano_treino pt ON pt.id = ag.plano_treino_id
ORDER BY ag.data_aula ASC;
```

- `JOIN` (ou `INNER JOIN`): traz apenas linhas que têm correspondência nas duas tabelas.
- `LEFT JOIN`: traz todas as linhas da tabela da esquerda, mesmo sem correspondência na tabela da direita (campos ficam `NULL` quando não há correspondência).

```sql
-- alunos que ainda não têm nenhum agendamento também aparecem
SELECT al.nome, ag.data_aula
FROM aluno al
LEFT JOIN agendamento ag ON ag.aluno_id = al.id;
```

## Contando e agrupando (COUNT, GROUP BY)

```sql
SELECT aluno_id, COUNT(*) AS total_agendamentos
FROM agendamento
GROUP BY aluno_id;
```
