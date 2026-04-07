const express = require('express');
const supabase = require('../supabase');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Rechercher un utilisateur par nom ou prénom
router.get('/', authenticateToken, async (req, res) => {
  const { q } = req.query; // ?q=François

  if (!q || q.trim() === '') {
    return res.status(400).json({ error: 'Le terme de recherche est requis' });
  }

  const searchTerm = `%${q.trim()}%`;

  const { data, error } = await supabase
    .from('etudiants')
    .select('id_etudiant, nom_etudiant, prenom_etudiant, photo_profil, formation')
    .or(`nom_etudiant.ilike.${searchTerm},prenom_etudiant.ilike.${searchTerm}`)
    .limit(20);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({ resultats: data });
});

module.exports = router;