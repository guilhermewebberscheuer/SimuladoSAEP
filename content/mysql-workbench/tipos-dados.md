---
title: "Tipos de dados do MySQL"
category: "SQL"
order: 2
source: "https://dev.mysql.com/doc/refman/8.4/en/data-types.html"
sourceLabel: "MySQL Reference Manual — Data Types"
officialTranslation: false
---

> Tradução e adaptação da documentação oficial do MySQL Reference Manual (idioma original: inglês).

## Tipos numéricos

| Tipo | Descrição |
|---|---|
| `INT` | Número inteiro (padrão, 4 bytes) |
| `TINYINT` | Inteiro pequeno (1 byte). `TINYINT(1)` é comumente usado como booleano |
| `DECIMAL(p, s)` | Número decimal exato, com `p` dígitos totais e `s` casas decimais. Ideal para valores monetários |
| `FLOAT` / `DOUBLE` | Números de ponto flutuante (aproximados, evitar para dinheiro) |

## Tipos de texto

| Tipo | Descrição |
|---|---|
| `VARCHAR(n)` | Texto de tamanho variável, até `n` caracteres |
| `CHAR(n)` | Texto de tamanho fixo (sempre ocupa `n` caracteres) |
| `TEXT` | Texto longo, sem limite prático curto (até 65.535 bytes) |

## Tipos de data e hora

| Tipo | Descrição |
|---|---|
| `DATE` | Apenas data (`AAAA-MM-DD`) |
| `TIME` | Apenas horário (`HH:MM:SS`) |
| `DATETIME` | Data e horário juntos (`AAAA-MM-DD HH:MM:SS`) |
| `TIMESTAMP` | Semelhante a `DATETIME`, mas pode ser atualizado automaticamente (`ON UPDATE CURRENT_TIMESTAMP`) e é afetado pelo fuso horário |

## Booleano

O MySQL não tem um tipo `BOOLEAN` nativo separado: `BOOLEAN`/`BOOL` são sinônimos de `TINYINT(1)` (0 = falso, 1 = verdadeiro).

## Exemplo de uso em uma tabela

```sql
CREATE TABLE aluno (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  cpf VARCHAR(255) NOT NULL,       -- armazenado criptografado, por isso maior que 11 caracteres
  email VARCHAR(150),
  data_nascimento DATE,
  ativo TINYINT(1) DEFAULT 1,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Observação: quando um dado (como o CPF) é armazenado criptografado, o campo `VARCHAR` precisa ser grande o suficiente para caber o texto cifrado (geralmente bem maior que os 11 dígitos originais).
