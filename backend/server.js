const express = require('express');
const supabase = require('./supabase');
const cors = require('cors');
const authRouter = require('./routes/auth');
const publicationsRouter = require('./routes/publications'); 
const commentairesRouter = require('./routes/commentaires');
const communautesRouter = require('./routes/communautes');
const messagesInboxRouter = require('./routes/messages_inbox');
const invitationsRouter = require('./routes/invitations')
const amisRouter = require('./routes/amis');
const rechercherUtilisateurRouter = require('./routes/rechercher_utilisateur');
const profileRouter = require('./routes/profile');
const messagesGroupeRouter = require('./routes/messages_groupe');

const app = express();
app.use(express.json());
app.use(cors()); 

app.use('/auth', authRouter);
app.use('/publications', publicationsRouter);  
app.use('/commentaires', commentairesRouter);
app.use('/communautes', communautesRouter);
app.use('/messages', messagesInboxRouter);
app.use('/invitations', invitationsRouter);
app.use('/amis', amisRouter);
app.use('/recherche', rechercherUtilisateurRouter);
app.use('/profile', profileRouter);
app.use('/group-chat', messagesGroupeRouter);


app.get('/test', async (req, res) => {
  res.json({ message: 'Le serveur fonctionne' });
});

app.listen(3000, () => {
  console.log('Serveur sur http://localhost:3000');
});