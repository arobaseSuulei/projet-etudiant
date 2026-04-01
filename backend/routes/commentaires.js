const express = require('express');
const supabase = require('../supabase');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Créer un commentaire (avec possibilité de répondre à un autre commentaire)
router.post('/publication/:id_publication', authenticateToken, async (req, res) => {
  const { id_publication } = req.params;
  const { commentaire, id_commentaire_parent } = req.body;
  const userId = req.user.id;

  const { data, error } = await supabase
    .from('commentaires')
    .insert([{
      id_etudiant: userId,
      id_publication: id_publication,
      commentaire: commentaire,
      id_commentaire_parent: id_commentaire_parent || null
    }])
    .select();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(201).json({ message: 'Commentaire ajouté', commentaire: data[0] });
});

// Lire tous les commentaires d'une publication (version simple)
router.get('/publication/:id_publication', async (req, res) => {
  const { id_publication } = req.params;

  const { data, error } = await supabase
    .from('commentaires')
    .select(`
      *,
      etudiants (nom_etudiant, prenom_etudiant)
    `)
    .eq('id_publication', id_publication)
    .order('date_commentaire', { ascending: true });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({ commentaires: data });
});

// Lire les commentaires d'une publication avec leurs réponses (structure arborescente)
router.get('/publication/:id_publication/arborescence', async (req, res) => {
  const { id_publication } = req.params;

  const { data, error } = await supabase
    .from('commentaires')
    .select(`
      *,
      etudiants (nom_etudiant, prenom_etudiant, photo_profil)
    `)
    .eq('id_publication', id_publication)
    .order('date_commentaire', { ascending: true });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  // Organiser les commentaires en arborescence
  const commentairesMap = {};
  const commentairesArborescence = [];

  data.forEach(commentaire => {
    commentaire.reponses = [];
    commentairesMap[commentaire.id_commentaire] = commentaire;

    if (commentaire.id_commentaire_parent === null) {
      commentairesArborescence.push(commentaire);
    } else {
      if (commentairesMap[commentaire.id_commentaire_parent]) {
        commentairesMap[commentaire.id_commentaire_parent].reponses.push(commentaire);
      }
    }
  });

  res.json({ commentaires: commentairesArborescence });
});

module.exports = router;