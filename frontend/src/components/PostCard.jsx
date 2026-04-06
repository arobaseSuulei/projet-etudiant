export default function PostCard({ post, onCommentClick }) {

    const heureDepuis = (date) => {
        const diff = Math.floor((new Date() - new Date(date)) / 1000 / 60 / 60);
        if (diff < 1) return "à l'instant";
        if (diff < 24) return `${diff}h`;
        const jours = Math.floor(diff / 24);
        return `${jours}j`;
    };

    console.log(post.etudiants);

    return (
        <div className="w-full md:max-w-2xl bg-[#2c2c2e] rounded-3xl p-5">

            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    {post.etudiants?.photo_profil ? (
                        <img
                            src={post.etudiants.photo_profil}
                            alt="photo profil"
                            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                        />
                        
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-[#5e5ce6] flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                            {post.etudiants?.prenom_etudiant?.[0]}{post.etudiants?.nom_etudiant?.[0]}
                        </div>
                    )}
                    <p className="text-white font-medium text-sm">
                        {post.etudiants?.prenom_etudiant} {post.etudiants?.nom_etudiant}
                    </p>
                </div>

                <div className="flex items-center gap-2 text-gray-400">
                    <span className="text-xs">{heureDepuis(post.date_publication)}</span>
                    <button onClick={() => onCommentClick(post)} className="text-gray-400 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z"/>
                        </svg>
                    </button>
                </div>
            </div>

            {/* Divider */}
            <hr className="border-[#3a3a3c] mb-3" />

            {/* Description */}
            <p className="text-white text-sm leading-relaxed mb-3">
                {post.description}
            </p>

            {/* Image */}
            {post.contenu && (
                <div className="rounded-2xl overflow-hidden">
                    <img
                        src={post.contenu}
                        className="w-full object-cover"
                        onError={(e) => e.target.style.display = 'none'}
                    />
                </div>
            )}
        </div>
    );
}