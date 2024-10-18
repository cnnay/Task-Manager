const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const path = require('path');
const cors = require('cors'); // Adicionando CORS

const app = express();
const port = 3000;

// Segredo para assinar o JWT
const JWT_SECRET = 'segredo_super_secreto';

// Configurar o body-parser para aceitar requisições JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors()); // Ativando CORS

// Servir arquivos estáticos (HTML, CSS, JS) da pasta public
app.use(express.static(path.join(__dirname, 'public')));

// Usuários fictícios (no lugar disso, você usaria um banco de dados)
const users = [
    { id: 1, username: 'user1', password: 'password1' },
    { id: 2, username: 'user2', password: 'password2' }
];

// Lista de tarefas (simulação de banco de dados)
let tasks = [
    { id: 1, title: 'Tarefa 1', status: 'pending' },
    { id: 2, title: 'Tarefa 2', status: 'pending' }
];

// Rota de login para autenticação
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Verifique se username e password foram fornecidos
    if (!username || !password) {
        return res.status(400).json({ message: 'Usuário ou senha não fornecidos' });
    }

    // Verifique se o usuário existe e a senha está correta
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
        return res.status(401).json({ message: 'Usuário ou senha incorretos' });
    }

    // Gerar um token JWT com os dados do usuário
    const token = jwt.sign({ username: user.username, id: user.id }, JWT_SECRET, { expiresIn: '1h' });

    // Enviar o token de volta como resposta
    res.json({ token });
});

// Middleware para verificar se o usuário está autenticado
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(403);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Rota para obter as tarefas (protegida por JWT)
app.get('/tasks', authenticateToken, (req, res) => {
    res.json(tasks);
});

// Rota para adicionar uma nova tarefa
app.post('/tasks', authenticateToken, (req, res) => {
    const { title } = req.body;
    if (!title) {
        return res.status(400).json({ message: 'Título não fornecido' });
    }
    const newTask = { id: tasks.length + 1, title, status: 'pending' };
    tasks.push(newTask);
    res.json(newTask);
});

// Rota para alternar o status da tarefa
app.put('/tasks/:id', authenticateToken, (req, res) => {
    const taskId = parseInt(req.params.id);
    const { status } = req.body;
    const task = tasks.find(t => t.id === taskId);
    
    if (task) {
        task.status = status;
        res.json(task);
    } else {
        res.status(404).json({ message: 'Tarefa não encontrada' });
    }
});

// Rota para deletar uma tarefa
app.delete('/tasks/:id', authenticateToken, (req, res) => {
    const taskId = parseInt(req.params.id);
    tasks = tasks.filter(t => t.id !== taskId);
    res.json({ message: 'Tarefa deletada' });
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
