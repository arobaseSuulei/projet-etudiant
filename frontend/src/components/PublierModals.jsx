import { useState } from "react";

export default function PublierModal({ onClose, onPublished }) {
    const [description, setDescription] = useState('');
    const [contenu, setContenu] = useState('');
    const [erreur, setErreur] = useState('');
    const [loading, setLoading] = useState(false);
    const token = localStorage.getItem("token");

    const handlePublier = async () => {
        if (!description.trim()) {
            setErreur('La description est obligatoire');
            return;
        }

        setLoading(true);

        const res = await fetch("http://localhost:3000/publications", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ description, contenu })
        });

        const data = await res.json();
        setLoading(false);

        if (!res.ok) {
            setErreur(data.error);
            return;
        }

        onPublished(data.publication);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
            <div className="bg-[#2c2c2e] w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl p-5 flex flex-col gap-4" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="flex items-center justify-between">
                    <button onClick={onClose} className="text-gray-400 text-sm">Annuler</button>
                    <p className="text-white font-semibold">Nouvelle publication</p>
                    <button
                        onClick={handlePublier}
                        disabled={loading}
                        className="text-purple-400 font-semibold text-sm disabled:opacity-50"
                    >
                        {loading ? '...' : 'Publier'}
                    </button>
                </div>

                <hr className="border-[#3a3a3c]" />

                {erreur && <p className="text-red-400 text-sm">{erreur}</p>}

                {/* Description */}
                <textarea
                    placeholder="Quoi de neuf ?"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={4}
                    className="bg-transparent text-white text-sm outline-none placeholder-gray-500 resize-none w-full"
                />

                {/* URL image optionnelle */}
                <input
                    type="text"
                    placeholder="Lien d'une image (optionnel)"
                    value={contenu}
                    onChange={e => setContenu(e.target.value)}
                    className="bg-[#1c1c1e] text-white text-sm rounded-xl px-4 py-3 outline-none placeholder-gray-500"
                />

                {/* Preview image */}
                {contenu && (
                    <div className="rounded-2xl overflow-hidden">
                        <img
                            src={contenu}
                            className="w-full object-cover max-h-48"
                            onError={(e) => e.target.style.display = 'none'}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}