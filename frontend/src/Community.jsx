// frontend/src/Community.jsx
import { useState, useEffect } from "react";

export default function Community() {
    const [communautes, setCommunautes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [nom, setNom] = useState("");
    const [description, setDescription] = useState("");
    const [photo, setPhoto] = useState("");
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    const fetchCommunautes = () => {
        fetch("http://localhost:3000/communautes")
            .then(res => res.json())
            .then(data => {
                setCommunautes(data.communautes ?? []);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchCommunautes();
    }, []);

    const creerCommunaute = async () => {
        if (!nom.trim()) return;

        const res = await fetch("http://localhost:3000/communautes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                nom_communaute: nom,
                description_communaute: description,
                photo_groupe: photo || null
            })
        });

        if (res.ok) {
            setShowModal(false);
            setNom("");
            setDescription("");
            setPhoto("");
            fetchCommunautes();
        }
    };

    const rejoindreCommunaute = async (id_communaute) => {
        const res = await fetch(`http://localhost:3000/communautes/${id_communaute}/rejoindre`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (res.ok) {
            fetchCommunautes();
        }
    };

    const quitterCommunaute = async (id_communaute) => {
        const res = await fetch(`http://localhost:3000/communautes/${id_communaute}/quitter`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (res.ok) {
            fetchCommunautes();
        }
    };

    // Supprimer une communauté (uniquement si créateur)
    const supprimerCommunaute = async (id_communaute) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette communauté ? Cette action est irréversible.")) return;

        const res = await fetch(`http://localhost:3000/communautes/${id_communaute}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (res.ok) {
            fetchCommunautes();
        } else {
            const data = await res.json();
            alert(data.error || "Erreur lors de la suppression");
        }
    };

    const estCreateur = (communaute) => {
        return communaute.id_createur === user?.id;
    };

    if (loading) return <p className="text-white text-center py-8">Chargement...</p>;

    return (
        <div className="flex flex-col items-center py-8 px-4 min-h-screen">
            <div className="w-full md:max-w-2xl">
                <div className="flex justify-between items-center mb-6">
                    <p className="text-white font-semibold text-xl">Communautés</p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-full px-4 py-2 transition-colors"
                    >
                        + Créer
                    </button>
                </div>

                {communautes.length === 0 && (
                    <p className="text-gray-400 text-center py-8">Aucune communauté</p>
                )}

                <div className="flex flex-col gap-4">
                    {communautes.map(communaute => (
                        <div key={communaute.id_communaute} className="bg-[#2c2c2e] rounded-2xl p-5">
                            <div className="flex items-start gap-4">
                                {/* Photo de la communauté */}
                                {communaute.photo_groupe ? (
                                    <img
                                        src={communaute.photo_groupe}
                                        className="w-16 h-16 rounded-xl object-cover"
                                        onError={e => e.target.style.display = 'none'}
                                        alt="Photo groupe"
                                    />
                                ) : (
                                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-semibold">
                                        {communaute.nom_communaute?.[0]?.toUpperCase()}
                                    </div>
                                )}

                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-white font-semibold">{communaute.nom_communaute}</p>
                                            <p className="text-gray-400 text-sm mt-1">{communaute.description_communaute}</p>
                                            <p className="text-gray-500 text-xs mt-2">
                                                Créée le {new Date(communaute.date_creation).toLocaleDateString('fr-FR')}
                                            </p>
                                            {estCreateur(communaute) && (
                                                <p className="text-purple-400 text-xs mt-1">👑 Vous êtes le créateur</p>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            {estCreateur(communaute) && (
                                                <button
                                                    onClick={() => supprimerCommunaute(communaute.id_communaute)}
                                                    className="text-red-500 hover:text-red-400 transition-colors p-2"
                                                    title="Supprimer la communauté"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/>
                                                    </svg>
                                                </button>
                                            )}
                                            <button
                                                onClick={() => rejoindreCommunaute(communaute.id_communaute)}
                                                className="bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-full px-4 py-2 transition-colors"
                                            >
                                                Rejoindre
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal création communauté */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#2c2c2e] rounded-2xl w-full max-w-md p-6">
                        <h2 className="text-white text-xl font-semibold mb-4">Créer une communauté</h2>
                        
                        <input
                            type="text"
                            placeholder="Nom de la communauté"
                            value={nom}
                            onChange={e => setNom(e.target.value)}
                            className="w-full bg-[#3a3a3c] text-white rounded-xl px-4 py-2 mb-3 outline-none"
                        />
                        
                        <textarea
                            placeholder="Description"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="w-full bg-[#3a3a3c] text-white rounded-xl px-4 py-2 mb-3 outline-none resize-none"
                            rows="3"
                        />
                        
                        <input
                            type="text"
                            placeholder="URL de la photo (optionnel)"
                            value={photo}
                            onChange={e => setPhoto(e.target.value)}
                            className="w-full bg-[#3a3a3c] text-white rounded-xl px-4 py-2 mb-4 outline-none"
                        />
                        
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white rounded-xl py-2 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={creerCommunaute}
                                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-xl py-2 transition-colors"
                            >
                                Créer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}