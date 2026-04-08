// frontend/src/Profile.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
    const [posts, setPosts] = useState([]);
    const [profil, setProfil] = useState(null);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    // Récupérer le profil depuis l'API
    useEffect(() => {
        fetch("http://localhost:3000/profile", {
            headers: { "Authorization": `Bearer ${token}` }
        })
            .then(res => {
                if (!res.ok) throw new Error("Erreur chargement profil");
                return res.json();
            })
            .then(data => {
                if (data.profil) {
                    setProfil(data.profil);
                }
            })
            .catch(err => {
                console.error("Erreur:", err);
                // Fallback: utiliser localStorage si l'API échoue
                const user = JSON.parse(localStorage.getItem("user"));
                if (user) setProfil(user);
            });
    }, [token]);

    // Récupérer les publications
    useEffect(() => {
        if (!profil) return;
        
        fetch("http://localhost:3000/publications")
            .then(res => res.json())
            .then(data => {
                const mesPosts = (data.publications ?? []).filter(p => p.id_etudiant === profil.id_etudiant);
                setPosts(mesPosts);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [profil]);

    const seDeconnecter = () => {
        localStorage.clear();
        navigate("/connexion");
    };

    const supprimerPost = async (id_publication) => {
        const res = await fetch(`http://localhost:3000/publications/${id_publication}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (res.ok) {
            setPosts(prev => prev.filter(p => p.id_publication !== id_publication));
        }
    };

    if (!profil) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center py-8 px-4 min-h-screen">

            {/* Header profil */}
            <div className="w-full md:max-w-2xl flex flex-col items-center gap-4 mb-8">
                {/* Photo de profil - maintenant depuis l'API */}
                {profil.photo_profil ? (
                    <img 
                        src={profil.photo_profil} 
                        className="w-24 h-24 rounded-full object-cover border-2 border-purple-500"
                        onError={e => e.target.style.display = 'none'}
                        alt="Photo de profil"
                    />
                ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-semibold">
                        {profil.prenom_etudiant?.[0]?.toUpperCase() || profil.nom_etudiant?.[0]?.toUpperCase()}
                    </div>
                )}
                
                <div className="text-center">
                    <p className="text-white text-xl font-semibold">
                        {profil.prenom_etudiant} {profil.nom_etudiant}
                    </p>
                    <p className="text-gray-400 text-sm">{profil.mail_etudiant}</p>
                    {profil.formation && (
                        <p className="text-purple-400 text-sm mt-1">{profil.formation}</p>
                    )}
                    {profil.num_etudiant && (
                        <p className="text-gray-500 text-xs mt-1">📱 {profil.num_etudiant}</p>
                    )}
                </div>

                <div className="flex gap-8">
                    <div className="text-center">
                        <p className="text-white font-semibold text-lg">{posts.length}</p>
                        <p className="text-gray-400 text-xs">Publications</p>
                    </div>
                    <div className="text-center">
                        <p className="text-white font-semibold text-lg">{profil.en_ligne ? '🟢' : '⚫'}</p>
                        <p className="text-gray-400 text-xs">En ligne</p>
                    </div>
                </div>

                <button
                    onClick={seDeconnecter}
                    className="border border-gray-600 text-gray-400 text-sm rounded-full px-6 py-2 hover:border-red-500 hover:text-red-400 transition-colors"
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
                    <div className="text-center py-12">
                        <p className="text-gray-400 text-sm">Aucune publication</p>
                        <p className="text-gray-500 text-xs mt-1">Partagez quelque chose pour commencer !</p>
                    </div>
                )}
                <div className="flex flex-col gap-4">
                    {posts.map(post => (
                        <div key={post.id_publication} className="bg-[#2c2c2e] rounded-3xl p-5">
                            <div className="flex items-start justify-between mb-2">
                                <p className="text-white text-sm leading-relaxed flex-1">{post.description}</p>
                                <button
                                    onClick={() => supprimerPost(post.id_publication)}
                                    className="text-gray-500 hover:text-red-400 transition-colors ml-3 flex-shrink-0"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/>
                                    </svg>
                                </button>
                            </div>
                            {post.contenu && (
                                <div className="rounded-2xl overflow-hidden mt-3">
                                    <img
                                        src={post.contenu}
                                        className="w-full object-cover"
                                        alt="Publication"
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