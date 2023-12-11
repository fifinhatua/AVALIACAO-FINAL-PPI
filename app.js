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
  res.sendFile(__dirname + '/views/menu.html');
});

app.get('/chat', (req, res) => {
  const messages = [];
  res.sendFile(__dirname + '/views/chat.html', { user: res.locals.user, messages });
});

app.get('/cadastro', (req, res) => {
  const usersList = users.map(user => `${user.name} - ${user.birthdate} - ${user.nickname}`).join('<br>');
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
        <ul>${usersList}</ul>
        
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

  if (!name || !birthdate || !nickname) {
    const htmlWithError = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Cadastro de Usuários</title>
      </head>
      <body>
          <h1>Cadastro de Usuários</h1>
          <p style="color: red;">Todos os campos são obrigatórios.</p>

          <ul>${users.map(user => `${user.name} - ${user.birthdate} - ${user.nickname}`).join('<br>')}</ul>
          
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
    res.send(htmlWithError);
    return;
  }

  const newUser = { name, birthdate, nickname };
  users.push(newUser);

  const usersList = users.map(user => `${user.name} - ${user.birthdate} - ${user.nickname}`).join('<br>');
  const htmlAfterCadastro = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Cadastro de Usuários</title>
    </head>
    <body>
        <h1>Cadastro de Usuários</h1>
        <p style="color: green;">Usuário cadastrado com sucesso!</p>

        <ul>${usersList}</ul>
        
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
  res.send(htmlAfterCadastro);
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});