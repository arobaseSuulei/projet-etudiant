export default function Connexion() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <form
                action="http://localhost:3000/api"
                method="POST"
                className="bg-zinc-900 p-6 rounded-2xl shadow-lg w-80 flex flex-col gap-4"
            >
                <h2 className="text-white text-xl font-semibold text-center">
                    Connexion
                </h2>

                <input
                    type="text"
                    name="name"
                    placeholder="Nom"
                    className="p-2 rounded bg-zinc-800 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
                />

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    className="p-2 rounded bg-zinc-800 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Mot de passe"
                    className="p-2 rounded bg-zinc-800 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
                />

                <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded font-medium"
                >
                    Envoyer
                </button>
            </form>
        </div>
    );
}