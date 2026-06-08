import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaHeart, FaRegHeart, FaStar } from "react-icons/fa";
import { IoPlayCircleOutline } from "react-icons/io5";
import ReviewModal from "../components/review/ReviewModal";
import { getTrackReviews, toggleReviewLike } from "../services/review";
import { getAlbum } from "../services/spotify";

const AlbumDetail = ({ setCurrentTrack }) => {
  const { id } = useParams();
  const [album, setAlbum] = useState(null);
  const [openReview, setOpenReview] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [trackReviews, setTrackReviews] = useState([]);

  const loadTrackReviews = async (trackId) => {
    if (!trackId) {
      setTrackReviews([]);
      return;
    }

    try {
      const reviews = await getTrackReviews(trackId);
      setTrackReviews(Array.isArray(reviews) ? reviews : []);
    } catch (error) {
      console.error(error);
      setTrackReviews([]);
    }
  };

  const handleSelectTrack = async (track) => {
    setSelectedTrack(track);
    await loadTrackReviews(track.id);
  };

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        const data = await getAlbum(id);
        setAlbum(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAlbum();
  }, [id]);

  if (!album) {
    return <p className="p-6 text-sm text-gray-400 md:p-10">Loading...</p>;
  }

  if (album.error) {
    return <div className="p-6 text-sm text-red-500 md:p-10">Failed to load album</div>;
  }

  const artists = album.artists.map((artist) => artist.name).join(", ");
  const tracks = album.tracks?.items || [];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 md:px-10 md:py-12">
      <div className="flex flex-col gap-8 md:flex-row md:items-start">
        <img
          src={album?.images?.[0]?.url}
          className="h-64 w-64 rounded-2xl object-cover"
          alt=""
        />

        <div className="min-w-0 pt-1">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-green-600">
            {album.album_type || "Album"}
          </p>
          <h1 className="max-w-4xl text-4xl font-bold leading-tight text-gray-950 md:text-6xl">
            {album.name}
          </h1>
          <p className="mt-3 text-lg text-gray-600">{artists}</p>
          <p className="mt-2 text-sm text-gray-400">
            {album.release_date} - {album.total_tracks} tracks
          </p>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="mb-4 text-xl font-semibold text-gray-950">Tracks</h2>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          {tracks.map((track, index) => (
            <div
              key={track.id}
              className={`
                flex items-center gap-4 px-4 py-3 text-sm transition hover:bg-gray-50 sm:px-5
                ${index > 0 ? "border-t border-gray-100" : ""}
              `}
            >
              <button
                type="button"
                onClick={() => handleSelectTrack(track)}
                className="min-w-0 flex-1 text-left"
              >
                <span className="mr-2 text-gray-400">{index + 1}.</span>
                <span className="font-medium text-gray-950">{track.name}</span>
              </button>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    await handleSelectTrack(track);
                    setOpenReview(true);
                  }}
                  className="rounded-full px-3 py-2 text-xs font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                >
                  Review
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleSelectTrack(track);
                    setCurrentTrack(track.id);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-green-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-green-600"
                >
                  <IoPlayCircleOutline size={18} />
                  Play Music
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12">
        <h2 className="mb-4 text-xl font-semibold text-gray-950">
          Reviews ({trackReviews.length})
        </h2>

        {!selectedTrack ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-sm text-gray-400">
            Select a track to see reviews.
          </div>
        ) : trackReviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-sm text-gray-400">
            No reviews yet. Be the first!
          </div>
        ) : (
          <div className="space-y-4">
            {trackReviews.map((review) => (
              <div key={review.id} className="rounded-2xl border border-gray-200 bg-white p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold">
                      @{review.username || "anonymous"}
                    </p>
                    {review.album_type !== "single" && review.album_name ? (
                      <p className="text-xs text-gray-400">{review.album_name}</p>
                    ) : null}
                  </div>
                  <p className="text-xs text-gray-400">
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="mt-2 flex gap-1 text-green-500">
                  {Array.from({ length: review.rating }).map((_, index) => (
                    <FaStar key={`${review.id}-star-${index}`} size={14} />
                  ))}
                </div>

                <p className="mt-2 text-sm leading-relaxed text-gray-700">
                  {review.content || "No comment"}
                </p>

                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const result = await toggleReviewLike(review.id);
                      setTrackReviews((prev) =>
                        prev.map((item) =>
                          item.id === review.id
                            ? {
                                ...item,
                                likes_count: result.likes_count,
                                liked_by_me: result.liked,
                              }
                            : item,
                        ),
                      );
                    } catch (error) {
                      alert(error?.message || "Gagal update like");
                    }
                  }}
                  className={`mt-3 inline-flex items-center gap-1 text-xs transition ${
                    review.liked_by_me
                      ? "text-green-600"
                      : "text-gray-500 hover:text-green-600"
                  }`}
                >
                  {review.liked_by_me ? <FaHeart size={16} /> : <FaRegHeart size={16} />}
                  {review.likes_count || 0}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {openReview && selectedTrack ? (
        <ReviewModal
          track={{
            id: selectedTrack.id,
            title: selectedTrack.name,
            artist: selectedTrack.artists.map((artist) => artist.name).join(", "),
            image: album.images[0]?.url,
            albumId: album.id,
            albumName: album.name,
            albumType: album.album_type,
          }}
          onClose={() => setOpenReview(false)}
        />
      ) : null}
    </div>
  );
};

export default AlbumDetail;
