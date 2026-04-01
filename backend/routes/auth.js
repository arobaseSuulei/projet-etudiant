const express = require('express');
const bcrypt = require('bcrypt');
const supabase = require('../supabase');
const jwt = require('jsonwebtoken');

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

  // Vérifier le mot de passe hashé
  const validPassword = await bcrypt.compare(password, data.password_etudiant);
  
  if (!validPassword) {
    return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
  }

  // Générer un token JWT
  const token = jwt.sign(
    { id: data.id_etudiant, email: data.mail_etudiant },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({ 
    message: 'Connexion réussie', 
    token: token,
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

  // Hasher le mot de passe
  const hashedPassword = await bcrypt.hash(password, 10);

  // Créer le nouvel étudiant avec mot de passe hashé
  const { data, error } = await supabase
    .from('etudiants')
    .insert([{
      mail_etudiant: email,
      password_etudiant: hashedPassword,
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