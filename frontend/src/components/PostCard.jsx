export default function PostCard({ post }) {



    const heureDepuis = (date) => {
        const diff = Math.floor((new Date() - new Date(date)) / 1000 / 60 / 60);
        if (diff < 1) return "à l'instant";
        if (diff < 24) return `${diff}h`;
        const jours = Math.floor(diff / 24);
        return `${jours}j`;
    };


    return (
        <div className="w-full md:max-w-2xl bg-[#1c1c1e] rounded-3xl p-5">

            {/* Header */}
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: '#5e5ce6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '500',
                        fontSize: '14px'
                    }}>
                        {post.etudiants?.prenom_etudiant?.[0]}{post.etudiants?.nom_etudiant?.[0]}
                    </div>
                    <div>
                        <p style={{color: 'white', fontWeight: '500', fontSize: '14px', margin: 0}}>
                            {post.etudiants?.prenom_etudiant} {post.etudiants?.nom_etudiant}
                        </p>
                        <p style={{color: '#8e8e93', fontSize: '12px', margin: 0}}>
                            {heureDepuis(post.description)}
                        </p>
                    </div>
                </div>



                <nav className={'flex gap-1 items-center justify-end'}>
                    <p className={'text-xs'} style={{color: '#8e8e93', fontSize: '12px', margin: 0}}>
                        {heureDepuis(post.date_publication)}
                    </p>


                    <p className={'text-xs'} style={{color: '#8e8e93', fontSize: '12px', margin: 0}}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                             stroke="currentColor" className="size-6">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                  d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z"/>
                        </svg>
                    </p>
                </nav>
            </div>

            {/* Divider */}
            <div style={{borderTop: '0.5px solid #3a3a3c', marginBottom: '12px'}}></div>

            {/* Description */}
            <p style={{color: 'white', fontSize: '14px', lineHeight: '1.5', margin: '0 0 14px'}}>
                {post.description}
            </p>

            {/* Image */}
            {post.contenu && (
                <div style={{borderRadius: '16px', overflow: 'hidden'}}>
                    <img
                        src={post.contenu}
                        style={{width: '100%', objectFit: 'cover'}}
                        onError={(e) => e.target.style.display = 'none'}
                    />
                </div>
            )}
        </div>
    );
}