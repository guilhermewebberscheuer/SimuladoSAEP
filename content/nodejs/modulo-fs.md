---
title: "Módulo fs (File System)"
category: "Módulos Core"
order: 1
source: "https://nodejs.org/docs/latest/api/fs.html"
sourceLabel: "Node.js Documentation — File system (fs)"
officialTranslation: false
---

> Tradução e adaptação da documentação oficial do Node.js (idioma original: inglês).

## Visão geral

O módulo `fs` permite interagir com o sistema de arquivos de forma modelada em funções padrão do POSIX. Para usá-lo:

```js
const fs = require('fs');
// ou, usando Promises:
const fs = require('fs/promises');
```

Todas as operações do `fs` possuem três formas: **síncrona** (bloqueante, termina com `Sync`), **com callback** (assíncrona, estilo clássico do Node.js) e **com Promise** (via `fs/promises`).

## Lendo um arquivo

```js
// Assíncrono com callback
fs.readFile('/caminho/arquivo.txt', 'utf8', (err, dados) => {
  if (err) throw err;
  console.log(dados);
});

// Assíncrono com Promise
const fs = require('fs/promises');
const dados = await fs.readFile('/caminho/arquivo.txt', 'utf8');

// Síncrono
const dados = fs.readFileSync('/caminho/arquivo.txt', 'utf8');
```

## Escrevendo em um arquivo

```js
fs.writeFile('/caminho/arquivo.txt', 'conteúdo', (err) => {
  if (err) throw err;
  console.log('Arquivo salvo.');
});
```

`fs.writeFile` sobrescreve o arquivo por padrão. Para adicionar conteúdo ao final de um arquivo existente, use `fs.appendFile`.

## Verificando a existência de um arquivo

A documentação oficial recomenda **não** usar `fs.exists()` (está obsoleta) para depois ler/escrever o arquivo, pois isso cria uma condição de corrida. O padrão recomendado é tentar a operação diretamente e tratar o erro:

```js
try {
  const dados = await fs.readFile('/caminho/arquivo.txt', 'utf8');
} catch (err) {
  if (err.code === 'ENOENT') {
    console.log('Arquivo não existe.');
  } else {
    throw err;
  }
}
```

## Outras funções comuns

| Função | Descrição |
|---|---|
| `fs.mkdir(caminho, callback)` | Cria um diretório |
| `fs.readdir(caminho, callback)` | Lista o conteúdo de um diretório |
| `fs.unlink(caminho, callback)` | Remove (apaga) um arquivo |
| `fs.rename(antigo, novo, callback)` | Renomeia ou move um arquivo |
| `fs.stat(caminho, callback)` | Retorna informações sobre o arquivo (tamanho, datas, tipo) |
