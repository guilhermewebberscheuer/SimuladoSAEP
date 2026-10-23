
const express = require('express');
require('dotenv').config();

const alunosRoutes = require('./routes/alunos');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use('/api/alunos', alunosRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Sistema rodando em http://localhost:${PORT}`);
});
