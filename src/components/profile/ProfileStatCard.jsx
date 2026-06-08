const ProfileStatCard = ({ label, value }) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 text-center transition hover:border-gray-300 md:p-6">
      <p className="text-2xl font-semibold leading-none text-gray-950 md:text-3xl">
        {value}
      </p>

      <p className="mt-3 text-[10px] font-medium uppercase tracking-wide text-gray-400 md:text-xs">
        {label}
      </p>
    </div>
  );
};

export default ProfileStatCard;
