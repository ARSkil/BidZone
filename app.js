require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Хранилище пользователей (файл)
const usersFile = path.join(__dirname, 'users.json');
function loadUsers() {
  const data = fs.readFileSync(usersFile, 'utf8');
  return JSON.parse(data);
}
function saveUsers(users) {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

// Настройка middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'secretkey',
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

// Passport локальная стратегия (логин/пароль)
passport.use(new LocalStrategy((username, password, done) => {
  const users = loadUsers();
  const user = users.find(u => u.username === username);
  if (!user) {
    return done(null, false, { message: 'Incorrect username.' });
  }
  if (!bcrypt.compareSync(password, user.password)) {
    return done(null, false, { message: 'Incorrect password.' });
  }
  return done(null, user);
}));

// Passport Google OAuth
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, (accessToken, refreshToken, profile, done) => {
  let users = loadUsers();
  let user = users.find(u => u.googleId === profile.id);
  if (!user) {
    // создаём нового
    user = {
      id: users.length + 1,
      googleId: profile.id,
      username: profile.displayName,
    };
    users.push(user);
    saveUsers(users);
  }
  return done(null, user);
}));

// Passport Facebook OAuth
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: process.env.FACEBOOK_CALLBACK_URL,
  profileFields: ['id', 'displayName', 'emails']
}, (accessToken, refreshToken, profile, done) => {
  let users = loadUsers();
  let user = users.find(u => u.facebookId === profile.id);
  if (!user) {
    user = {
      id: users.length + 1,
      facebookId: profile.id,
      username: profile.displayName,
    };
    users.push(user);
    saveUsers(users);
  }
  return done(null, user);
}));

// Сериализация пользователя
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser((id, done) => {
  const users = loadUsers();
  const user = users.find(u => u.id === id);
  done(null, user);
});

// --- Маршруты ---

app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.send(`<h1>Welcome, ${req.user.username}!</h1><a href="/logout">Logout</a>`);
  } else {
    res.send('<h1>Home</h1><a href="/login">Login</a> | <a href="/register">Register</a>');
  }
});

// Форма регистрации
app.get('/register', (req, res) => {
  res.send(`
    <h2>Register</h2>
    <form method="post" action="/register">
      <input name="username" placeholder="Username" required />
      <input type="password" name="password" placeholder="Password" required />
      <button type="submit">Register</button>
    </form>
    <a href="/login">Login</a>
  `);
});

// Обработка регистрации
app.post('/register', (req, res) => {
  let users = loadUsers();
  const { username, password } = req.body;

  if (users.find(u => u.username === username)) {
    return res.send('User already exists. <a href="/register">Try again</a>');
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = {
    id: users.length + 1,
    username,
    password: hashedPassword
  };

  users.push(newUser);
  saveUsers(users);

  res.redirect('/login');
});

// Форма логина
app.get('/login', (req, res) => {
  res.send(`
    <h2>Login</h2>
    <form method="post" action="/login">
      <input name="username" placeholder="Username" required />
      <input type="password" name="password" placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
    <a href="/register">Register</a>
    <br><br>
    <a href="/auth/google">Login with Google</a><br>
    <a href="/auth/facebook">Login with Facebook</a>
  `);
});

// Обработка логина
app.post('/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login?error=true'
  })
);

// Google OAuth маршруты
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => { res.redirect('/'); }
);

// Facebook OAuth маршруты
app.get('/auth/facebook',
  passport.authenticate('facebook', { scope: ['email'] })
);
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  (req, res) => { res.redirect('/'); }
);

// Выход
app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
