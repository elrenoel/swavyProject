const users = ["Marcus Thorne", "Aria Chen", "Lydia Fox"];

const CommunityTopUsers = () => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <h3 className="text-xs font-semibold tracking-wide text-gray-400 mb-4">
        TOP REVIEWERS
      </h3>

      <div className="space-y-3">
        {users.map((user, i) => (
          <div key={i} className="flex items-center gap-3">
            <img
              src="https://i.pravatar.cc/40"
              className="w-8 h-8 rounded-full"
              alt=""
            />
            <p className="text-sm font-medium text-gray-700">{user}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommunityTopUsers;
