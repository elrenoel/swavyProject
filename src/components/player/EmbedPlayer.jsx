const EmbedPlayer = ({ trackId, onClose }) => {
  if (!trackId) return null;

  return (
    <div className="
      fixed bottom-0 left-0 w-full
      bg-black p-2 z-50
    ">

      <button
        onClick={onClose}
        className="absolute top-2 right-4 text-black text-lg"
      >
        X
      </button>

      <iframe
        src={`https://open.spotify.com/embed/track/${trackId}`}
        width="100%"
        height="80"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      ></iframe>
    </div>
  );
};

export default EmbedPlayer;