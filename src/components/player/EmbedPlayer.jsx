import { IoClose } from "react-icons/io5";

const EmbedPlayer = ({ trackId, onClose }) => {
  if (!trackId) return null;

  return (
    <div
      className="
      fixed bottom-0 left-0 w-full
      bg-black p-2 z-50
    "
    >
      <div className="text-white flex justify-end mb-2">
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-full hover:bg-white/10"
          aria-label="Close player"
        >
          <IoClose size={25} />
        </button>
      </div>

      <iframe
        src={`https://open.spotify.com/embed/track/${trackId}?autoplay=1`}
        width="100%"
        height="100"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      ></iframe>
    </div>
  );
};

export default EmbedPlayer;
