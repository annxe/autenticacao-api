const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 3000;

const usersDatabase = [];

// Backend Functions //
const checkIfEmailExists = async (email) => {
  return usersDatabase.find(user => user.email === email);
}

const getUserData = async (email) => {
  return usersDatabase.find(user => user.email === email);
}

const loginUser = async (loginPayload) => {

  if (loginPayload.email === "jao@gmail.com" && loginPayload.senha === "123") {
    console.log('Sessão iniciada')
    return true
  } else {
    console.log('Usuário e/ou senha inválidos')
    return false
  }
};

// Middleware para verificar a autenticação
const checkAuthentication = async (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Não autorizado' });
  }

  jwt.verify(token.split(' ')[1], 'senha', (err, decoded) => {
    if (err) {
      return res.status(401).json({ success: false, message: 'Usuário e/ou senha inválidos' });
    }

    return loginUser;
  });
}

const registerNewUser = async (userData) => {

  const userId = uuidv4();

  const now = new Date().toISOString();

  const newUser = {
      id: userId,
      nome: userData.nome,
      email: userData.email,
      senha: userData.senha,
      telefone: '40028922',
      data_criacao: now,
      data_atualizacao: now,
      ultimo_login: null,
      token: null
  }

  usersDatabase.push(newUser)

  return newUser
}

app.use(express.json());

// Cadastro
app.post('/signup', async (req, res) => {
  
  const userData = req.body;
  
  const emailExists = await checkIfEmailExists(userData.email);

  if (emailExists) {
    res.status(401).send({"status": "error", "message": 'Email já existente'});
    return;
  }

  try {
      const newUser = await registerNewUser(userData);
      res.status(201).json(newUser);
  } catch (error) {
      console.error('Signup error:', error);
  }
});

// Login
app.post('/login', async (req, res) => {

    const bodyPayload = req.body;

    const currentUserData = await getUserData(bodyPayload.email)
    if (!currentUserData) {
      res.status(401).json({"status": "error", "message": "Usuário e/ou senha inválidos" });
      return;
    } else {
      if (bodyPayload.email === currentUserData.email && bodyPayload.senha === currentUserData.senha) {
        res.status(200).json({"status": "success", "message": "Credenciais Corretas, Usuário foi Logado" });
      } else {
        res.status(401).json({"status": "error", "message": "Usuário e/ou senha inválidos" });
      }
    }
}); 


app.get('/searchusers', checkAuthentication, (req, res) => {
  res.json({ success: true, message: 'Usuários encontrados com sucesso!' });
});

// Inicia servidor de API
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});