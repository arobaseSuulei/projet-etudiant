const express = require('express');
const supabase = require('../supabase');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Envoyer un message dans une communauté (avec possibilité de répondre)
router.post('/communautes/:id_communaute', authenticateToken, async (req, res) => {
  const { id_communaute } = req.params;
  const { text_message, id_message_parent } = req.body;
  const userId = req.user.id;

  // Vérifier que l'utilisateur est membre
  const { data: membre, error: memberError } = await supabase
    .from('est_membre')
    .select('*')
    .eq('id_etudiant', userId)
    .eq('id_communaute', id_communaute)
    .maybeSingle();

  if (memberError) {
    return res.status(400).json({ error: memberError.message });
  }

  if (!membre) {
    return res.status(403).json({ error: 'Vous devez être membre pour envoyer des messages' });
  }

  if (!text_message || text_message.trim() === '') {
    return res.status(400).json({ error: 'Le message ne peut pas être vide' });
  }

  const { data, error } = await supabase
    .from('messages')
    .insert([{
      id_emetteur: userId,
      id_communaute: id_communaute,
      text_message: text_message,
      id_message_parent: id_message_parent || null
    }])
    .select();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(201).json({ message: 'Message envoyé dans la communauté', data: data[0] });
});

// Lire tous les messages d'une communauté (avec vérification d'appartenance)
router.get('/communautes/:id_communaute', authenticateToken, async (req, res) => {
  const { id_communaute } = req.params;
  const userId = req.user.id;

  // Vérifier que l'utilisateur est membre
  const { data: membre, error: memberError } = await supabase
    .from('est_membre')
    .select('*')
    .eq('id_etudiant', userId)
    .eq('id_communaute', id_communaute)
    .maybeSingle();

  if (memberError) {
    return res.status(400).json({ error: memberError.message });
  }

  if (!membre) {
    return res.status(403).json({ error: 'Vous devez être membre pour voir les messages' });
  }

  // Récupérer les messages d'abord
  const { data: messages, error } = await supabase
    .from('messages')
    .select('*')
    .eq('id_communaute', id_communaute)
    .order('date_message', { ascending: true });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  // Récupérer les infos des utilisateurs séparément
  const etudiantsIds = [...new Set(messages.map(m => m.id_emetteur))];
  
  const { data: etudiants, error: userError } = await supabase
    .from('etudiants')
    .select('id_etudiant, nom_etudiant, prenom_etudiant, photo_profil')
    .in('id_etudiant', etudiantsIds);

  if (userError) {
    return res.status(400).json({ error: userError.message });
  }

  // Fusionner les données
  const etudiantsMap = {};
  etudiants.forEach(e => { etudiantsMap[e.id_etudiant] = e; });

  const messagesAvecInfos = messages.map(m => ({
    ...m,
    etudiants: etudiantsMap[m.id_emetteur]
  }));

  res.json({ messages: messagesAvecInfos });
});

// Supprimer un message (uniquement si on est l'émetteur)
router.delete('/:id_message', authenticateToken, async (req, res) => {
  const { id_message } = req.params;
  const userId = req.user.id;

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

  const { error: deleteError } = await supabase
    .from('messages')
    .delete()
    .eq('id_message', id_message);

  if (deleteError) {
    return res.status(400).json({ error: deleteError.message });
  }

  res.json({ message: 'Message supprimé' });
});

// Modifier un message (uniquement si on est l'émetteur)
router.put('/:id_message', authenticateToken, async (req, res) => {
  const { id_message } = req.params;
  const { text_message } = req.body;
  const userId = req.user.id;

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

  const { data, error: updateError } = await supabase
    .from('messages')
    .update({ text_message: `✏️\n${text_message}` })
    .eq('id_message', id_message)
    .select();

  if (updateError) {
    return res.status(400).json({ error: updateError.message });
  }

  res.json({ message: 'Message modifié', data: data[0] });
});

module.exports = router;