import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import userModel from './models/user.js'; // Ensure the path is correct
import dotenv from 'dotenv';
dotenv.config();


const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: ["http://localhost:5173"],
  credentials: true
}));

// Connect to MongoDB
mongoose.connect('mongodb+srv://vinnieomari99:1999@cluster0.oiowwwn.mongodb.net/expenseApp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Failed to connect to MongoDB', err));

// Routes
app.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  userModel.create({ name, email, password })
    .then(user => res.json(user))
    .catch(err => res.json(err));
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  userModel.findOne({ email })
    .then(user => {
      if (user) {
        if (user.password === password) {
          const accessToken = jwt.sign({ email }, "jwt-access-token-secret-key", { expiresIn: '1m' });
          const refreshToken = jwt.sign({ email }, "jwt-refresh-token-secret-key", { expiresIn: '5m' });

          res.cookie('accessToken', accessToken, { maxAge: 60000 });
          res.cookie('refreshToken', refreshToken, { maxAge: 300000, httpOnly: true, secure: true, sameSite: 'strict' });

          return res.json({ Login: true });
        }
        return res.json({ Login: false, Message: "Incorrect password" });
      }
      return res.json({ Login: false, Message: "No record found" });
    })
    .catch(err => res.json(err));
});

const verifyUser = (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  if (!accessToken) {
    if (renewToken(req, res)) {
      next();
    } else {
      return res.json({ valid: false, message: "No Access Token" });
    }
  } else {
    jwt.verify(accessToken, 'jwt-access-token-secret-key', (err, decoded) => {
      if (err) {
        return res.json({ valid: false, message: "Invalid Token" });
      }
      req.email = decoded.email;
      next();
    });
  }
};

const renewToken = (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return false;
  }
  let isRenewed = false;
  jwt.verify(refreshToken, 'jwt-refresh-token-secret-key', (err, decoded) => {
    if (err) {
      return res.json({ valid: false, message: "Invalid Refresh Token" });
    }
    const accessToken = jwt.sign({ email: decoded.email }, "jwt-access-token-secret-key", { expiresIn: '1m' });
    res.cookie('accessToken', accessToken, { maxAge: 60000 });
    isRenewed = true;
  });
  return isRenewed;
};

app.get('/dashboard', verifyUser, (req, res) => {
  return res.json({ valid: true, message: "Authorized" });
});

// Start the server
app.listen(3001, () => {
  console.log('Server is running on http://localhost:3001');
});
