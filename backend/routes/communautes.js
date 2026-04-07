const express = require('express');
const supabase = require('../supabase');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Créer une communauté
router.post('/', authenticateToken, async (req, res) => {
  const { nom_communaute, description_communaute, photo_groupe } = req.body;
  const userId = req.user.id;

  // 1. Créer la communauté
  const { data: communaute, error: createError } = await supabase
    .from('communautes')
    .insert([{
      nom_communaute: nom_communaute,
      description_communaute: description_communaute,
      photo_groupe: photo_groupe || null,
      id_createur: userId
    }])
    .select();

  if (createError) {
    return res.status(400).json({ error: createError.message });
  }

  // 2. Ajouter le créateur comme membre
  const { error: memberError } = await supabase
    .from('est_membre')
    .insert([{
      id_etudiant: userId,
      id_communaute: communaute[0].id_communaute
    }]);

  if (memberError) {
    return res.status(400).json({ error: memberError.message });
  }

  res.status(201).json({ message: 'Communauté créée', communaute: communaute[0] });
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

// Supprimer une communauté (uniquement si on est le créateur)
router.delete('/:id_communaute', authenticateToken, async (req, res) => {
  const { id_communaute } = req.params;
  const userId = req.user.id;

  // Vérifier que l'utilisateur est le créateur
  const { data: communaute, error: findError } = await supabase
    .from('communautes')
    .select('id_createur')
    .eq('id_communaute', id_communaute)
    .single();

  if (findError || !communaute) {
    return res.status(404).json({ error: 'Communauté non trouvée' });
  }

  if (communaute.id_createur !== userId) {
    return res.status(403).json({ error: 'Vous ne pouvez supprimer que les communautés que vous avez créées' });
  }

  // Supprimer la communauté
  const { error: deleteError } = await supabase
    .from('communautes')
    .delete()
    .eq('id_communaute', id_communaute);

  if (deleteError) {
    return res.status(400).json({ error: deleteError.message });
  }

  res.json({ message: 'Communauté supprimée' });
});

module.exports = router;