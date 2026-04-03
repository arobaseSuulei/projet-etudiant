const express = require('express');
const supabase = require('../supabase');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Envoyer un message privé
router.post('/envoyer/:recepteur_id', authenticateToken, async (req, res) => {
  const { recepteur_id } = req.params;
  const { text_message } = req.body;
  const userId = req.user.id;

  // Vérifier que le message n'est pas vide
  if (!text_message || text_message.trim() === '') {
    return res.status(400).json({ error: 'Le message ne peut pas être vide' });
  }

  // Insérer le message dans la base
  const { data, error } = await supabase
    .from('messages')
    .insert([{
      id_emetteur: userId,
      id_recepteur: recepteur_id,
      text_message: text_message
    }])
    .select();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(201).json({ message: 'Message envoyé', data: data[0] });
});

// Récupérer la conversation avec un utilisateur spécifique
router.get('/conversation/:destinataire_id', authenticateToken, async (req, res) => {
  const { destinataire_id } = req.params;
  const userId = req.user.id;

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`and(id_emetteur.eq.${userId},id_recepteur.eq.${destinataire_id}),and(id_emetteur.eq.${destinataire_id},id_recepteur.eq.${userId})`)
    .order('date_message', { ascending: true });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({ conversation: data });
});

module.exports = router;