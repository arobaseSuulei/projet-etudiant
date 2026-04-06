const express = require('express');
const supabase = require('../supabase');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Envoyer une invitation
router.post('/envoyer/:recepteur_id', authenticateToken, async (req, res) => {
  const { recepteur_id } = req.params;
  const emetteur_id = req.user.id;

  if (emetteur_id == recepteur_id) {
    return res.status(400).json({ error : 'Vous ne pouvez pas vous inviter vous-même' });
  }

  // Vérifier si une invitation existe déjà
  const { data: existing } = await supabase
    .from('invitations')
    .select('*')
    .or(`and(id_emetteur.eq.${emetteur_id},id_recepteur.eq.${recepteur_id}),and(id_emetteur.eq.${recepteur_id},id_recepteur.eq.${emetteur_id})`)
    .maybeSingle();

  if (existing) {
    return res.status(400).json({ error: 'Une invitation existe déjà' });
  }

  // Insérer l'invitation (les valeurs par défaut s'appliquent)
  const { error } = await supabase
    .from('invitations')
    .insert([{
      id_emetteur: emetteur_id,
      id_recepteur: recepteur_id
    }]);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(201).json({ message: 'Invitation envoyée' });
});

// Annuler une invitation envoyée
router.delete('/:recepteur_id', authenticateToken, async (req, res) => {
  const { recepteur_id } = req.params;
  const emetteur_id = req.user.id;

  const { data, error } = await supabase
    .from('invitations')
    .delete()
    .eq('id_emetteur', emetteur_id)
    .eq('id_recepteur', recepteur_id)
    .select();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  if (!data || data.length === 0) {
    return res.status(404).json({ error: 'Invitation non trouvée' });
  }

  res.json({ message: 'Invitation supprimée' });
});

// Afficher les invitations reçues (en attente)
router.get('/requetes', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  const { data, error } = await supabase
    .from('invitations')
    .select(`
      id_emetteur,
      id_recepteur,
      en_attente,
      etudiants!fk_emetteur (nom_etudiant, prenom_etudiant)
    `)
    .eq('id_recepteur', userId)
    .eq('en_attente', true);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({ invitations: data });
});

// Accepter une invitation
router.put('/accepter/:emetteur_id', authenticateToken, async (req, res) => {
  const { emetteur_id } = req.params;
  const recepteur_id = req.user.id;

  const { data, error } = await supabase
    .from('invitations')
    .update({ 
      en_attente: false,
      sont_amis: true 
    })
    .eq('id_emetteur', emetteur_id)
    .eq('id_recepteur', recepteur_id)
    .eq('en_attente', true)
    .select();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  if (!data || data.length === 0) {
    return res.status(404).json({ error: 'Invitation non trouvée ou déjà traitée' });
  }

  res.json({ message: 'Invitation acceptée', ami: data[0] });
});

// Refuser une invitation
router.put('/refuser/:emetteur_id', authenticateToken, async (req, res) => {
  const { emetteur_id } = req.params;
  const recepteur_id = req.user.id;

  const { data, error } = await supabase
    .from('invitations')
    .update({ 
      en_attente: false,
      sont_amis: false
    })
    .eq('id_emetteur', emetteur_id)
    .eq('id_recepteur', recepteur_id)
    .eq('en_attente', true)
    .select();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  if (!data || data.length === 0) {
    return res.status(404).json({ error: 'Invitation non trouvée ou déjà traitée' });
  }

  res.json({ message: 'Invitation refusée' });
});

// Bloquer un utilisateur
router.put('/bloquer/:cible_id', authenticateToken, async (req, res) => {
  const { cible_id } = req.params;
  const userId = req.user.id;

  // Vérifier si une relation existe déjà
  const { data: existing, error: findError } = await supabase
    .from('invitations')
    .select('*')
    .or(`and(id_emetteur.eq.${userId},id_recepteur.eq.${cible_id}),and(id_emetteur.eq.${cible_id},id_recepteur.eq.${userId})`)
    .maybeSingle();

  if (findError) {
    return res.status(400).json({ error: findError.message });
  }

  if (existing) {
    // Mise à jour selon qui bloque qui
    let updateData = {};
    if (existing.id_emetteur === userId) {
      updateData = { emetteur_bloque_recepteur: true, sont_amis: false, en_attente: false };
    } else {
      updateData = { recepteur_bloque_emetteur: true, sont_amis: false, en_attente: false };
    }

    const { error: updateError } = await supabase
      .from('invitations')
      .update(updateData)
      .eq('id_emetteur', existing.id_emetteur)
      .eq('id_recepteur', existing.id_recepteur);

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }
  } else {
    // Créer une nouvelle entrée avec blocage
    const { error: insertError } = await supabase
      .from('invitations')
      .insert([{
        id_emetteur: userId,
        id_recepteur: cible_id,
        en_attente: false,
        sont_amis: false,
        emetteur_bloque_recepteur: true
      }]);

    if (insertError) {
      return res.status(400).json({ error: insertError.message });
    }
  }

  res.json({ message: 'Utilisateur bloqué' });
});

module.exports = router;