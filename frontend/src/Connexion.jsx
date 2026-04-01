export default function Connexion() {
  return (
    <form className="text-white " action="http://localhost:3000/api" method="POST">
      <input  type="text" name="name" placeholder="Nom" />
      <br />

      <input type="email" name="email" placeholder="Email" />
      <br />

      <input type="password" name="password" placeholder="Mot de passe" />
      <br />

      <button type="submit">Envoyer</button>
    </form>
  );
}