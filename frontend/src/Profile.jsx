import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem("user"));
    const navigate = useNavigate();

    useEffect(() => {
        fetch("http://localhost:3000/publications")
            .then(res => res.json())
            .then(data => {
                const mesPosts = (data.publications ?? []).filter(p => p.id_etudiant === user.id);
                setPosts(mesPosts);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const seDeconnecter = () => {
        localStorage.clear();
        navigate("/connexion");
    };

    return (
        <div className="flex flex-col items-center py-8 px-4 min-h-screen">

            {/* Header profil */}
            <div className="w-full md:max-w-2xl flex flex-col items-center gap-4 mb-8">
                <div className="w-24 h-24 rounded-full bg-[#5e5ce6] flex items-center justify-center text-white text-3xl font-semibold">
                    {user?.nom?.[0]?.toUpperCase()}
                </div>
                <div className="text-center">
                    <p className="text-white text-xl font-semibold">{user?.nom}</p>
                    <p className="text-gray-400 text-sm">{user?.email}</p>
                </div>

                {/* Stats */}
                <div className="flex gap-8">
                    <div className="text-center">
                        <p className="text-white font-semibold text-lg">{posts.length}</p>
                        <p className="text-gray-400 text-xs">Publications</p>
                    </div>
                </div>

                {/* Bouton déconnexion */}
                <button
                    onClick={seDeconnecter}
                    className="border border-gray-600 text-gray-400 text-sm rounded-full px-6 py-2"
                >
                    Se déconnecter
                </button>
            </div>

            <hr className="border-[#3a3a3c] w-full md:max-w-2xl mb-6" />

            {/* Mes publications */}
            <div className="w-full md:max-w-2xl">
                <p className="text-white font-semibold mb-4">Mes publications</p>
                {loading && <p className="text-gray-400 text-sm">Chargement...</p>}
                {!loading && posts.length === 0 && (
                    <p className="text-gray-400 text-sm text-center">Aucune publication</p>
                )}
                <div className="flex flex-col gap-4">
                    {posts.map(post => (
                        <div key={post.id_publication} className="bg-[#2c2c2e] rounded-3xl p-5">
                            <p className="text-white text-sm leading-relaxed">{post.description}</p>
                            {post.contenu && (
                                <div className="rounded-2xl overflow-hidden mt-3">
                                    <img
                                        src={post.contenu}
                                        className="w-full object-cover"
                                        onError={(e) => e.target.style.display = 'none'}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}