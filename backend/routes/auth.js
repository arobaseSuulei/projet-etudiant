const express = require('express');
const supabase = require('../supabase');

const router = express.Router();

router.post('/connexion', async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase
    .from('etudiants')
    .select('*')
    .eq('mail_etudiant', email)
    .single();

  if (error || !data) {
    return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
  }

  if (data.password_etudiant !== password) {
    return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
  }

  res.json({ 
    message: 'Connexion réussie', 
    user: { 
      id: data.id_etudiant, 
      nom: data.nom_etudiant, 
      email: data.mail_etudiant 
    } 
  });
});

router.post('/inscription', async (req, res) => {
  const { email, password, num_etudiant, nom, prenom, date_naissance, formation } = req.body;

  // Vérifier si l'email existe déjà
  const { data: existingUser } = await supabase
    .from('etudiants')
    .select('mail_etudiant')
    .eq('mail_etudiant', email)
    .single();

  if (existingUser) {
    return res.status(400).json({ error: 'Cet email est déjà utilisé' });
  }

  // Créer le nouvel étudiant
  const { data, error } = await supabase
    .from('etudiants')
    .insert([{
      mail_etudiant: email,
      password_etudiant: password,
      num_etudiant: num_etudiant,
      nom_etudiant: nom,
      prenom_etudiant: prenom,
      date_naissance: date_naissance,
      formation: formation
    }])
    .select();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(201).json({ 
    message: 'Inscription réussie', 
    user: { 
      id: data[0].id_etudiant, 
      nom: data[0].nom_etudiant, 
      email: data[0].mail_etudiant 
    } 
  });
});

module.exports = router;