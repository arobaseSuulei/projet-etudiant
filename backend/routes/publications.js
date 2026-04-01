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

module.exports = router;