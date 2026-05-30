const CommunityPost = ({ user, content, likes }) => {
  return (
    <div
      className="border rounded-xl
  p-3 md:p-4
  bg-white
  space-y-2"
    >
      <p className="font-semibold text-sm md:text-base">{user}</p>

      <p className="text-gray-600 text-xs md:text-sm">{content}</p>

      <p className="text-[10px] md:text-xs text-gray-400">Likes: {likes}</p>
    </div>
  );
};

export default CommunityPost;
