---
title: "Criando tabelas: CREATE TABLE, chaves primárias e estrangeiras"
category: "SQL"
order: 3
source: "https://dev.mysql.com/doc/refman/8.4/en/create-table.html"
sourceLabel: "MySQL Reference Manual — CREATE TABLE Statement"
officialTranslation: false
---

> Tradução e adaptação da documentação oficial do MySQL Reference Manual (idioma original: inglês).

## Sintaxe básica

```sql
CREATE TABLE nome_tabela (
  coluna1 TIPO [restrições],
  coluna2 TIPO [restrições],
  ...
);
```

## Chave primária (PRIMARY KEY)

Identifica unicamente cada linha da tabela. É comum usar um `INT` com `AUTO_INCREMENT`, que gera o próximo número automaticamente a cada `INSERT`.

```sql
CREATE TABLE aluno (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL
);
```

## Chave estrangeira (FOREIGN KEY)

Garante integridade referencial: o valor de uma coluna só pode existir se o registro correspondente existir na tabela referenciada.

```sql
CREATE TABLE plano_treino (
  id INT AUTO_INCREMENT PRIMARY KEY,
  descricao VARCHAR(200) NOT NULL,
  aluno_id INT NOT NULL,
  FOREIGN KEY (aluno_id) REFERENCES aluno(id)
);
```

### Exemplo completo com três tabelas relacionadas

```sql
CREATE TABLE aluno (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  cpf VARCHAR(255) NOT NULL,
  email VARCHAR(150)
);

CREATE TABLE plano_treino (
  id INT AUTO_INCREMENT PRIMARY KEY,
  descricao VARCHAR(200) NOT NULL,
  aluno_id INT NOT NULL,
  FOREIGN KEY (aluno_id) REFERENCES aluno(id)
);

CREATE TABLE agendamento (
  id INT AUTO_INCREMENT PRIMARY KEY,
  data_aula DATETIME NOT NULL,
  aluno_id INT NOT NULL,
  plano_treino_id INT NOT NULL,
  FOREIGN KEY (aluno_id) REFERENCES aluno(id),
  FOREIGN KEY (plano_treino_id) REFERENCES plano_treino(id)
);
```

## Opções comuns de coluna

| Restrição | Significado |
|---|---|
| `NOT NULL` | A coluna não pode ficar vazia |
| `UNIQUE` | O valor não pode se repetir entre as linhas |
| `DEFAULT valor` | Valor usado automaticamente se nenhum for informado |
| `AUTO_INCREMENT` | Gera um número sequencial automaticamente (apenas em chave primária numérica) |

## Ações em FOREIGN KEY (ON DELETE / ON UPDATE)

```sql
FOREIGN KEY (aluno_id) REFERENCES aluno(id)
  ON DELETE CASCADE
  ON UPDATE CASCADE
```

- `ON DELETE CASCADE`: se o aluno for apagado, os registros relacionados (ex.: seus agendamentos) são apagados automaticamente.
- `ON DELETE RESTRICT` (padrão): impede apagar um aluno que ainda tenha registros relacionados.

## Alterando uma tabela já criada (ALTER TABLE)

```sql
ALTER TABLE aluno ADD COLUMN telefone VARCHAR(20);
ALTER TABLE aluno MODIFY COLUMN nome VARCHAR(150) NOT NULL;
ALTER TABLE aluno DROP COLUMN telefone;
```
