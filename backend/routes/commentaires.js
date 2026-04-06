const express = require('express');
const supabase = require('../supabase');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Créer un commentaire (avec possibilité de répondre)
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

// Lire les commentaires d'une publication avec arborescence
router.get('/publication/:id_publication', async (req, res) => {
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

  // Organisation en arborescence
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

// Modifier un commentaire (uniquement si on est l'auteur)
router.put('/:id_commentaire', authenticateToken, async (req, res) => {
  const { id_commentaire } = req.params;
  const { commentaire } = req.body;
  const userId = req.user.id;

  // Vérifier que l'utilisateur est l'auteur
  const { data: comment, error: findError } = await supabase
    .from('commentaires')
    .select('id_etudiant')
    .eq('id_commentaire', id_commentaire)
    .single();

  if (findError || !comment) {
    return res.status(404).json({ error: 'Commentaire non trouvé' });
  }

  if (comment.id_etudiant !== userId) {
    return res.status(403).json({ error: 'Vous ne pouvez modifier que vos propres commentaires' });
  }

  if (!commentaire || commentaire.trim() === '') {
    return res.status(400).json({ error: 'Le commentaire ne peut pas être vide' });
  }

  // Modifier le commentaire
  const { data, error: updateError } = await supabase
    .from('commentaires')
    .update({ commentaire: `(modifié)\n${commentaire}` })
    .eq('id_commentaire', id_commentaire)
    .select();

  if (updateError) {
    return res.status(400).json({ error: updateError.message });
  }

  res.json({ message: 'Commentaire modifié', commentaire: data[0] });
});

// Supprimer un commentaire (uniquement si on est l'auteur)
router.delete('/:id_commentaire', authenticateToken, async (req, res) => {
  const { id_commentaire } = req.params;
  const userId = req.user.id;

  // Vérifier que l'utilisateur est l'auteur
  const { data: comment, error: findError } = await supabase
    .from('commentaires')
    .select('id_etudiant')
    .eq('id_commentaire', id_commentaire)
    .single();

  if (findError || !comment) {
    return res.status(404).json({ error: 'Commentaire non trouvé' });
  }

  if (comment.id_etudiant !== userId) {
    return res.status(403).json({ error: 'Vous ne pouvez supprimer que vos propres commentaires' });
  }

  // Supprimer le commentaire
  const { error: deleteError } = await supabase
    .from('commentaires')
    .delete()
    .eq('id_commentaire', id_commentaire);

  if (deleteError) {
    return res.status(400).json({ error: deleteError.message });
  }

  res.json({ message: 'Commentaire supprimé' });
});

module.exports = router;