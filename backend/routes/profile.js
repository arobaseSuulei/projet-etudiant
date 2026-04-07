const express = require('express');
const supabase = require('../supabase');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Récupérer son propre profil
router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  const { data, error } = await supabase
    .from('etudiants')
    .select('id_etudiant, mail_etudiant, num_etudiant, photo_profil, date_adhesion, formation, nom_etudiant, prenom_etudiant, date_naissance, en_ligne')
    .eq('id_etudiant', userId)
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({ profil: data });
});

module.exports = router;