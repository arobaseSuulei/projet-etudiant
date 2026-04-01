const express = require('express');
const supabase = require('../supabase');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Créer une communauté
router.post('/', authenticateToken, async (req, res) => {
  const { nom_communaute, description_communaute } = req.body;

  const { data, error } = await supabase
    .from('communautes')
    .insert([{
      nom_communaute: nom_communaute,
      description_communaute: description_communaute
    }])
    .select();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(201).json({ message: 'Communauté créée', communaute: data[0] });
});

// Lire toutes les communautés
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('communautes')
    .select('*')
    .order('date_creation', { ascending: false });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({ communautes: data });
});
 
// Rejoindre une communauté
router.post('/:id_communaute/rejoindre', authenticateToken, async (req, res) => {
  const { id_communaute } = req.params;
  const userId = req.user.id;

  const { data, error } = await supabase
    .from('est_membre')
    .insert([{
      id_etudiant: userId,
      id_communaute: id_communaute
    }])
    .select();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({ message: 'Vous avez rejoint la communauté' });
});

// Quitter une communauté
router.delete('/:id_communaute/quitter', authenticateToken, async (req, res) => {
  const { id_communaute } = req.params;
  const userId = req.user.id;

  const { error } = await supabase
    .from('est_membre')
    .delete()
    .eq('id_etudiant', userId)
    .eq('id_communaute', id_communaute);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({ message: 'Vous avez quitté la communauté' });
});

// Lire les membres d'une communauté
router.get('/:id_communaute/membres', async (req, res) => {
  const { id_communaute } = req.params;

  const { data, error } = await supabase
    .from('est_membre')
    .select(`
      id_etudiant,
      etudiants (nom_etudiant, prenom_etudiant, photo_profil)
    `)
    .eq('id_communaute', id_communaute);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({ membres: data });
});

module.exports = router;