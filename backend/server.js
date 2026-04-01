const express = require('express');
const supabase = require('./supabase');
const authRouter = require('./routes/auth');

const app = express();
app.use(express.json());

app.use('/auth', authRouter);

app.get('/test', async (req, res) => {
  res.json({ message: 'Le serveur fonctionne' });
});

app.listen(3000, () => {
  console.log('Serveur sur http://localhost:3000');
});