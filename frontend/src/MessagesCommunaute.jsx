import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";

export default function MessagesCommunaute() {
    const { id_communaute } = useParams();
    const navigate = useNavigate();
    const [communaute, setCommunaute] = useState(null);
    const [messages, setMessages] = useState([]);
    const [texte, setTexte] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [messageEnCoursModif, setMessageEnCoursModif] = useState(null);
    const [idCreateur, setIdCreateur] = useState(null);
    
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    const messagesEndRef = useRef(null);
    
    // --- ÉTATS POUR LE STOCKAGE ---
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    

    useEffect(() => {
        fetch(`http://localhost:3000/communautes`)
            .then(res => res.json())
            .then(data => {
                const found = (data.communautes ?? []).find(c => c.id_communaute === parseInt(id_communaute));
                setCommunaute(found);
            })
            .catch(err => console.error("Erreur communauté:", err));
    }, [id_communaute]);

    const chargerMessages = async () => {
        try {
            const res = await fetch(`http://localhost:3000/group-chat/communautes/${id_communaute}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            
            if (res.status === 403) {
                setError("Accès refusé");
                setTimeout(() => navigate("/community"), 2000);
                return;
            }
            
            const data = await res.json();
            if (res.ok) {
                setMessages(data.messages || []);
                setIdCreateur(data.id_createur);
            }
            setLoading(false);
        } catch (err) {
            setLoading(false);
        }
    };

    useEffect(() => {
        chargerMessages();
        const interval = setInterval(chargerMessages, 5000);
        return () => clearInterval(interval);
    }, [id_communaute]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        if (selectedFile.size > 50 * 1024 * 1024) {
            alert("Le fichier est trop lourd (max 50 Mo)");
            return;
        }

        setFile(selectedFile);
        const url = URL.createObjectURL(selectedFile);
        setPreviewUrl(url);
    };

    const cancelFile = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setFile(null);
        setPreviewUrl(null);
        setProgress(0);
    };

    const envoyerMessage = async () => {
        if (!texte.trim() && !file) return;

        setUploading(true);
        setProgress(10);

        let mediaUrl = null;
        let mediaType = null;

        try {
            if (file) {
                const fileName = `${Date.now()}_${file.name}`;
                const filePath = `communautes/${id_communaute}/${fileName}`;

                const { data, error } = await supabase.storage
                    .from('nexus_media')
                    .upload(filePath, file, {
                        cacheControl: '3600',
                        upsert: false,
                    });

                if (error) throw error;

                const { data: publicData } = supabase.storage
                    .from('nexus_media')
                    .getPublicUrl(filePath);
                
                mediaUrl = publicData.publicUrl;
                mediaType = file.type.startsWith('video/') ? 'video' : 'image';
                setProgress(70);
            }

            const res = await fetch(`http://localhost:3000/group-chat/communautes/${id_communaute}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    text_message: texte,
                    media_url: mediaUrl,
                    media_type: mediaType
                })
            });

            if (res.ok) {
                setTexte('');
                cancelFile();
                chargerMessages();
                setTimeout(scrollToBottom,100);
            }
        } catch (err) {
            console.error("Erreur lors de l'envoi :", err);
            alert("Impossible d'envoyer le fichier.");
        } finally {
            setUploading(false);
            setProgress(0);
        }
    };

    const supprimerMessage = async (id, mediaUrl) => {
        if (!window.confirm("Supprimer ce message définitivement ?")) return;

        try {
            // 1. Suppression du fichier sur Supabase si présent
            if (mediaUrl) {
                const urlParts = mediaUrl.split('/nexus_media/');
                if (urlParts.length > 1) {
                    const filePath = urlParts[1];
                    await supabase.storage.from('nexus_media').remove([filePath]);
                }
            }

            // 2. Suppression du message dans ton backend
            const res = await fetch(`http://localhost:3000/messages/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (res.ok) {
                chargerMessages();
            }
        } catch (err) {
            console.error("Erreur suppression:", err);
        }
    };

    const modifierMessage = async (id, nouveauTexte) => {
        if (!nouveauTexte.trim()) return;
        const res = await fetch(`http://localhost:3000/messages/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ text_message: nouveauTexte })
        });
        if (res.ok) {
            setMessageEnCoursModif(null);
            chargerMessages();
        }
    };

    const formatTime = (date) => new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    if (loading) return <div className="flex justify-center items-center h-screen bg-[#1c1c1e] text-white">Chargement...</div>;

    return (
        <div className="flex flex-col h-screen bg-[#1c1c1e] text-white">
            <header className="p-4 border-b border-gray-800 flex items-center gap-4">
    <button 
        onClick={() => navigate("/community")} 
        className="hover:text-purple-500 transition-colors text-xl"
    >
        ←
    </button>

    {/* Photo de groupe */}
    {communaute?.photo_groupe && (
        <img 
            src={communaute.photo_groupe} 
            alt={communaute.nom_communaute} 
            className="w-10 h-10 rounded-lg mb-68 object-cover"
            onError={(e) => e.target.style.display = 'none'} // si pas de photo
        />
    )}

    <div>
        <h1 className="font-bold">{communaute?.nom_communaute}</h1>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Discussion</p>
    </div>
</header>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
    {messages.map((m) => {
        const estMoi = Number(m.id_emetteur) === Number(user?.id_etudiant);
        return (
            <div key={m.id_message} className={`flex ${estMoi ? 'justify-end' : 'justify-start'} group animate-fadeIn`}>
                <div className={`relative max-w-[75%] p-3 rounded-2xl shadow-sm ${estMoi ? 'bg-purple-600 rounded-tr-none' : 'bg-gray-800 rounded-tl-none'}`}>
                    
                    {!estMoi && (
                        <div className="flex items-center gap-2 mb-1">
                            <img
                                src={m.etudiants?.photo_profil}
                                className="w-6 h-6 rounded-full object-cover"
                                alt="profil"
                                onError={(e) => e.target.style.display = 'none'}
                            />
                            <p className="text-[10px] font-bold text-purple-400">
                                {m.etudiants?.prenom_etudiant} {m.id_emetteur === idCreateur && "👑"}
                            </p>
                        </div>
                    )}
                    
                    {messageEnCoursModif === m.id_message ? (
                        <input 
                            autoFocus
                            className="bg-black/20 outline-none p-1 rounded w-full border border-purple-400"
                            defaultValue={m.text_message}
                            onKeyDown={e => e.key === 'Enter' && modifierMessage(m.id_message, e.target.value)}
                        />
                    ) : (
                        <div>
                            {m.media_url && (
                                <div className="mb-2 rounded-lg overflow-hidden border border-black/10">
                                    {m.media_type === 'video' ? (
                                        <video src={m.media_url} controls className="max-w-full h-auto" />
                                    ) : (
                                        <img src={m.media_url} className="max-w-full h-auto" alt="contenu" />
                                    )}
                                </div>
                            )}
                            <p className="text-[14px] leading-relaxed">{m.text_message}</p>
                        </div>
                    )}
                    
                    <span className="text-[9px] opacity-40 block mt-1 text-right">
                        {formatTime(m.date_message)}
                    </span>

                    {estMoi && (
                        <div className="absolute -left-14 top-2 hidden group-hover:flex gap-2 bg-gray-900/80 p-1 rounded-lg backdrop-blur-sm">
                            <button onClick={() => setMessageEnCoursModif(m.id_message)} title="Modifier" className="hover:scale-110 transition-transform">✏️</button>
                            <button onClick={() => supprimerMessage(m.id_message, m.media_url)} title="Supprimer" className="hover:scale-110 transition-transform">🗑️</button>
                        </div>
                    )}
                </div>
            </div>
        );
    })}
    <div ref={messagesEndRef} />
</div>

            {previewUrl && (
                <div className="px-4 py-2 bg-gray-900 border-t border-gray-800 flex items-center gap-4 animate-slideUp">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-purple-500 bg-black flex-shrink-0">
                        {file?.type.startsWith('image/') ? (
                            <img src={previewUrl} className="w-full h-full object-cover" alt="preview" />
                        ) : (
                            <video src={previewUrl} className="w-full h-full object-cover" />
                        )}
                        <button onClick={cancelFile} className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-[10px] flex items-center justify-center hover:bg-red-600 shadow-lg">✕</button>
                    </div>
                    <div className="flex-1">
                        <p className="text-xs text-gray-400 truncate">{file?.name}</p>
                        {uploading && (
                            <div className="w-full bg-gray-700 h-1.5 rounded-full mt-2 overflow-hidden">
                                <div className="bg-purple-600 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
                            </div>
                        )}
                    </div>
                </div>
            )}

            <footer className=" p-4 bg-[#1c1c1e] pb-20 border-t border-gray-800">
                <div className="max-w-4xl mx-auto flex items-center gap-3 bg-gray-900 rounded-2xl p-2 px-4 border border-transparent focus-within:border-purple-600 transition-all duration-300 shadow-inner">
                    <input type="file" id="fileInput" className="hidden" onChange={handleFileChange} accept="image/*,video/*,application/pdf" />
                    <button type="button" onClick={() => document.getElementById('fileInput').click()} className="text-gray-400 hover:text-purple-500 transition-colors p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                        </svg>
                    </button>

                    <input className="flex-1 bg-transparent py-2 outline-none text-sm placeholder-gray-500" placeholder="Écris ton message..." value={texte} onChange={e => setTexte(e.target.value)} onKeyDown={e => e.key === 'Enter' && envoyerMessage()} />
                    
                    <button onClick={envoyerMessage} disabled={!texte.trim() && !file} className={`p-2 rounded-xl transition-all duration-300 ${ (texte.trim() || file) ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)] scale-100' : 'text-gray-600 scale-90' }`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                        </svg>
                    </button>
                </div>
            </footer>
        </div>
    );
}
