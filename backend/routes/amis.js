const express = require('express');
const supabase = require('../supabase');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Afficher la liste des amis
router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  // Récupérer les invitations où l'utilisateur est impliqué et sont_amis = true
  const { data, error } = await supabase
    .from('invitations')
    .select('*')
    .or(`id_emetteur.eq.${userId},id_recepteur.eq.${userId}`)
    .eq('sont_amis', true);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  // Récupérer les IDs des amis
  const amisIds = data.map(invitation => {
    if (invitation.id_emetteur === userId) {
      return invitation.id_recepteur;
    } else {
      return invitation.id_emetteur;
    }
  });

  if (amisIds.length === 0) {
    return res.json({ amis: [] });
  }

  // Récupérer les infos des amis
  const { data: amis, error: userError } = await supabase
    .from('etudiants')
    .select('id_etudiant, nom_etudiant, prenom_etudiant, photo_profil')
    .in('id_etudiant', amisIds);

  if (userError) {
    return res.status(400).json({ error: userError.message });
  }

  res.json({ amis });
});

module.exports = router;