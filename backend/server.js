const express = require('express');
const supabase = require('./supabase');
const cors = require('cors');
const authRouter = require('./routes/auth');
const publicationsRouter = require('./routes/publications'); 
const commentairesRouter = require('./routes/commentaires');
const communautesRouter = require('./routes/communautes');


const app = express();
app.use(express.json());
app.use(cors()); 

app.use('/auth', authRouter);
app.use('/publications', publicationsRouter);  
app.use('/commentaires', commentairesRouter);
app.use('/communautes', communautesRouter);


app.get('/test', async (req, res) => {
  res.json({ message: 'Le serveur fonctionne' });
});

app.listen(3000, () => {
  console.log('Serveur sur http://localhost:3000');
});