const NavbarAuth = () => {
  return (
    <nav
      className="
      flex items-center justify-between
      px-4 md:px-10
      py-4
      bg-white border-b border-gray-100
      sticky top-0 z-50
    "
    >
      {/* LOGO */}
      <div className="text-xl md:text-2xl font-bold tracking-tighter">
        Swavy<span className="text-[#1DB954]">.</span>
      </div>
    </nav>
  );
};

export default NavbarAuth;
