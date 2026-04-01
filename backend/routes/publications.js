const express = require('express');
const supabase = require('../supabase');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Créer une publication (protégé)
router.post('/', authenticateToken, async (req, res) => {
  const { description, contenu } = req.body;
  const userId = req.user.id;

  const { data, error } = await supabase
    .from('publications')
    .insert([{
      id_etudiant: userId,
      description: description,
      contenu: contenu
    }])
    .select();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(201).json({ message: 'Publication créée', publication: data[0] });
});

// Lire une publication spécifique
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('publications')
    .select(`
      *,
      etudiants (nom_etudiant, prenom_etudiant)
    `)
    .eq('id_publication', id)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: 'Publication non trouvée' });
  }

  res.json({ publication: data });
});

module.exports = router;