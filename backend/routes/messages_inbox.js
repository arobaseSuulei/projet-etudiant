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

// Supprimer un message (uniquement si on est l'émetteur)
router.delete('/:id_message', authenticateToken, async (req, res) => {
  const { id_message } = req.params;
  const userId = req.user.id;

  // Vérifier que l'utilisateur est l'émetteur
  const { data: message, error: findError } = await supabase
    .from('messages')
    .select('id_emetteur')
    .eq('id_message', id_message)
    .single();

  if (findError || !message) {
    return res.status(404).json({ error: 'Message non trouvé' });
  }

  if (message.id_emetteur !== userId) {
    return res.status(403).json({ error: 'Vous ne pouvez supprimer que vos propres messages' });
  }

  // Supprimer le message
  const { error: deleteError } = await supabase
    .from('messages')
    .delete()
    .eq('id_message', id_message);

  if (deleteError) {
    return res.status(400).json({ error: deleteError.message });
  }

  res.json({ message: 'Message supprimé' });
});

router.put('/:id_message', authenticateToken, async (req, res) => {
  const { id_message } = req.params;
  const { text_message } = req.body;
  const userId = req.user.id;

  // Vérifier que l'utilisateur est l'émetteur
  const { data: message, error: findError } = await supabase
    .from('messages')
    .select('id_emetteur')
    .eq('id_message', id_message)
    .single();

  if (findError || !message) {
    return res.status(404).json({ error: 'Message non trouvé' });
  }

  if (message.id_emetteur !== userId) {
    return res.status(403).json({ error: 'Vous ne pouvez modifier que vos propres messages' });
  }

  if (!text_message || text_message.trim() === '') {
    return res.status(400).json({ error: 'Le message ne peut pas être vide' });
  }

  // Modifier avec indication (modifié)
  const { data, error: updateError } = await supabase
    .from('messages')
    .update({ text_message: `(modifié)\n${text_message}` })
    .eq('id_message', id_message)
    .select();

  if (updateError) {
    return res.status(400).json({ error: updateError.message });
  }

  res.json({ message: 'Message modifié', data: data[0] });
});


module.exports = router;