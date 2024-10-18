// const express = require('express');
// const app = express();
// const port = 3000;

// app.get('/', (req, res) => {
//   res.send('Hello, World!');
// });

// app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`);
// });


const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// Configurar o body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, 'public')));

// Lista de tarefas temporária
let tasks = [];

// Rota inicial para o arquivo index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Adicionar uma nova tarefa
app.post('/tasks', (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).send('O título da tarefa é obrigatório');
  }
  const task = { id: tasks.length + 1, title, status: 'pendente' };
  tasks.push(task);
  res.status(201).send(task);
});

// Atualizar o status de uma tarefa
app.put('/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const task = tasks.find(t => t.id == id);
  if (!task) {
    return res.status(404).send('Tarefa não encontrada');
  }
  task.status = status;
  res.send(task);
});

// Remover uma tarefa
app.delete('/tasks/:id', (req, res) => {
  const { id } = req.params;
  tasks = tasks.filter(t => t.id != id);
  res.send(`Tarefa com id ${id} removida`);
});

// Listar todas as tarefas
app.get('/tasks', (req, res) => {
  res.send(tasks);
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});



