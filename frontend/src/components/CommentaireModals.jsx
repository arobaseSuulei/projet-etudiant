import { useState, useEffect } from "react";

export default function CommentaireModal({ post, onClose }) {
    const [commentaires, setCommentaires] = useState([]);
    const [loading, setLoading] = useState(true);
    const [texte, setTexte] = useState('');
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetch(`http://localhost:3000/commentaires/publication/${post.id_publication}`)
            .then(res => res.json())
            .then(data => {
                setCommentaires(data.commentaires ?? []);
                setLoading(false);
            })
            .catch(err => {
                console.error("erreur :", err);
                setLoading(false);
            });
    }, [post.id_publication]);

    const envoyerCommentaire = async () => {
        if (!texte.trim()) return;

        const res = await fetch(`http://localhost:3000/commentaires/publication/${post.id_publication}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ commentaire: texte })
        });

        const data = await res.json();
        if (res.ok) {
            setCommentaires(prev => [...prev, data.commentaire]);
            setTexte('');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
            <div className="bg-[#2c2c2e] w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl p-5 max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <p className="text-white font-semibold">Commentaires</p>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                {/* Post résumé */}
                <div className="bg-[#1c1c1e] rounded-2xl p-3 mb-4">
                    <p className="text-white text-sm font-medium">{post.etudiants?.prenom_etudiant} {post.etudiants?.nom_etudiant}</p>
                    <p className="text-gray-400 text-sm">{post.description}</p>
                </div>

                {/* Liste commentaires */}
                <div className="flex-1 overflow-y-auto flex flex-col gap-3 mb-4">
                    {loading && <p className="text-gray-400 text-sm">Chargement...</p>}
                    {!loading && commentaires.length === 0 && (
                        <p className="text-gray-400 text-sm text-center">Aucun commentaire pour l'instant</p>
                    )}
                    {commentaires.map(c => (
                        <div key={c.id_commentaire} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#5e5ce6] flex items-center justify-center text-white text-xs flex-shrink-0">
                                {c.etudiants?.prenom_etudiant?.[0]}{c.etudiants?.nom_etudiant?.[0]}
                            </div>
                            <div>
                                <p className="text-white text-xs font-medium">{c.etudiants?.prenom_etudiant} {c.etudiants?.nom_etudiant}</p>
                                <p className="text-gray-300 text-sm">{c.commentaire}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input nouveau commentaire */}
                <div className="flex items-center gap-3 border-t border-[#3a3a3c] pt-4">
                    <div className="w-8 h-8 rounded-full bg-[#5e5ce6] flex items-center justify-center text-white text-xs flex-shrink-0">
                        {user?.nom?.[0]}
                    </div>
                    <input
                        type="text"
                        placeholder="Ajouter un commentaire..."
                        value={texte}
                        onChange={e => setTexte(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && envoyerCommentaire()}
                        className="flex-1 bg-transparent text-white text-sm outline-none placeholder-gray-500"
                    />
                    <button onClick={envoyerCommentaire} className="text-purple-400 text-sm font-semibold">
                        Publier
                    </button>
                </div>
            </div>
        </div>
    );
}