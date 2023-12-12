const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(cookieParser());
app.use(session({ secret: 'secretpassword', resave: true, saveUninitialized: true }));
app.use(bodyParser.urlencoded({ extended: true }));

const users = [];
const messages = [];

const requireAuth = (req, res, next) => {
  if (req.session.user) {
    res.locals.user = req.session.user;
    next();
  } else {
    res.redirect('/login');
  }
};

app.use(['/menu', '/chat', '/cadastro'], requireAuth);

app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/views/login.html');
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (email === 'usuario@example.com' && password === 'senha123') {
    req.session.user = { email: 'usuario@example.com', name: 'Nome do Usuário' };
    res.redirect('/menu');
  } else {
    res.sendFile(__dirname + '/views/login.html', { error: 'Credenciais inválidas. Tente novamente.' });
  }
});

app.get('/menu', (req, res) => {
  const lastAccess = req.cookies.lastAccess || 'Nunca acessou antes';
  res.cookie('lastAccess', new Date().toLocaleString());
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Menu</title>
    </head>
    <body>
        <h1>Menu</h1>
        <p>Último acesso: ${lastAccess}</p>
        <p><a href="/cadastro">Cadastro de Usuários</a></p>
        <p><a href="/chat">Bate-papo</a></p>
    </body>
    </html>
  `;
  res.send(html);
});

app.get('/chat', (req, res) => {
  const usersList = users.map(user => user.nickname);
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bate-papo</title>
    </head>
    <body>
        <h1>Bate-papo</h1>
        <form action="/enviar-mensagem" method="post">
            <label for="user">Usuário:</label>
            <select id="user" name="user" required>
                ${usersList.map(user => `<option value="${user}">${user}</option>`).join('')}
            </select>
            <label for="message">Mensagem:</label>
            <input type="text" id="message" name="message" required>
            <button type="submit">Enviar Mensagem</button>
        </form>
        <ul>
            ${messages.map(message => `<li><strong>${message.user}:</strong> ${message.text}</li>`).join('')}
        </ul>
        <p><a href="/menu">Voltar para o Menu</a></p>
        <p><a href="/cadastro">Voltar para o Cadastro</a></p>
    </body>
    </html>
  `;
  res.send(html);
});

app.post('/enviar-mensagem', (req, res) => {
  const { user, message } = req.body;
  const newMessage = { user, text: message };
  messages.push(newMessage);
  res.redirect('/chat');
});

app.get('/cadastro', (req, res) => {
  const usersList = users.map(user => `${user.name} - ${user.birthdate} - ${user.nickname}`);
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Cadastro de Usuários</title>
    </head>
    <body>
        <h1>Cadastro de Usuários</h1>
        <ul>
            ${usersList.map(user => `<li>${user}</li>`).join('')}
        </ul>
        <form action="/cadastro" method="post">
            <label for="name">Nome:</label>
            <input type="text" id="name" name="name" required>

            <label for="birthdate">Data de Nascimento:</label>
            <input type="date" id="birthdate" name="birthdate" required>

            <label for="nickname">Nickname ou Apelido:</label>
            <input type="text" id="nickname" name="nickname" required>

            <button type="submit">Cadastrar</button>
        </form>
        
        <p><a href="/menu">Voltar para o Menu</a></p>
    </body>
    </html>
  `;
  res.send(html);
});

app.post('/cadastro', (req, res) => {
  const { name, birthdate, nickname } = req.body;
  const newUser = { name, birthdate, nickname };
  users.push(newUser);
  res.redirect('/cadastro');
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});