import { IoClose } from "react-icons/io5";

const EmbedPlayer = ({ trackId, onClose }) => {
  if (!trackId) return null;

  return (
    <div
      className="
        fixed inset-x-0 bottom-0 z-50
        px-3 pb-3 sm:px-5 sm:pb-5
      "
    >
      <div
        className="
          relative mx-auto max-w-4xl overflow-hidden
          rounded-2xl border border-black/10 bg-black
          p-2
        "
      >
        <button
          type="button"
          onClick={onClose}
          className="
            absolute right-3 top-3 z-10
            inline-flex h-8 w-8 items-center justify-center
            rounded-full bg-black/65 text-white backdrop-blur
            transition hover:bg-black
          "
          aria-label="Close player"
        >
          <IoClose size={20} />
        </button>

        <iframe
          title="Spotify player"
          src={`https://open.spotify.com/embed/track/${trackId}?autoplay=1`}
          className="block h-20 w-full rounded-xl sm:h-24"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        ></iframe>
      </div>
    </div>
  );
};

export default EmbedPlayer;
