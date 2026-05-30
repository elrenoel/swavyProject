const Footer = () => {
  return (
    <footer className="bg-[#F9F9F9] pt-12 md:pt-16 pb-10 mt-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* TOP */}
        <div
          className="
          flex flex-col md:flex-row
          justify-between
          gap-8 mb-12
        "
        >
          {/* LEFT */}
          <div>
            <h2 className="text-2xl md:text-3xl font-serif italic mb-3">
              Swavy
            </h2>

            <p className="text-sm text-gray-500 max-w-sm">
              Elevating music discovery through surgical curation.
            </p>
          </div>

          {/* ACTIONS */}
          <div className="flex gap-5 text-gray-400">
            <button className="hover:text-black">Link</button>
            <button className="hover:text-black">Updates</button>
            <button className="hover:text-black">Contact</button>
          </div>
        </div>

        {/* BOTTOM */}
        <div
          className="
          flex flex-col md:flex-row
          justify-between items-center
          gap-6
          text-xs text-gray-400
        "
        >
          {/* LINKS */}
          <div
            className="
            flex flex-wrap justify-center md:justify-start
            gap-4 md:gap-8
          "
          >
            <a href="#">About</a>
            <a href="#">Editorial</a>
            <a href="#">Privacy</a>
            <a href="#">Contact</a>
          </div>

          {/* COPYRIGHT */}
          <p className="text-center md:text-right">
            Copyright 2024 SWAVY. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
