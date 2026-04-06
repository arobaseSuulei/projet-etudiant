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

// Lire toutes les publications
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('publications')
    .select(`
      *,
      etudiants (nom_etudiant, prenom_etudiant)
    `)
    .order('date_publication', { ascending: false });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({ publications: data });
});

// Supprimer une publication (uniquement si on est l'auteur)
router.delete('/:id_publication', authenticateToken, async (req, res) => {
  const { id_publication } = req.params;
  const userId = req.user.id;

  // Vérifier que l'utilisateur est l'auteur
  const { data: publication, error: findError } = await supabase
    .from('publications')
    .select('id_etudiant')
    .eq('id_publication', id_publication)
    .single();

  if (findError || !publication) {
    return res.status(404).json({ error: 'Publication non trouvée' });
  }

  if (publication.id_etudiant !== userId) {
    return res.status(403).json({ error: 'Vous ne pouvez supprimer que vos propres publications' });
  }

  // Supprimer la publication
  const { error: deleteError } = await supabase
    .from('publications')
    .delete()
    .eq('id_publication', id_publication);

  if (deleteError) {
    return res.status(400).json({ error: deleteError.message });
  }

  res.json({ message: 'Publication supprimée' });
}); 

module.exports = router;