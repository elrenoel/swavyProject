import leftArrow from "../../../assets/images/btn-left.svg";
import rightArrow from "../../../assets/images/btn-right.svg";

const SectionHeader = ({ onScrollLeft, onScrollRight }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      {/* LEFT */}
      <div>
        <h2 className="font-['Liberation_Serif'] text-[30px] leading-9 font-normal text-[#1A1C1C]">
          New Releases
        </h2>

        <p className="font-['Manrope'] text-[12px] font-normal tracking-[1.2px] text-[#71717A]">
          Fresh experimental sounds this week
        </p>
      </div>

      {/* RIGHT */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onScrollLeft}
          className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100 transition"
        >
          <img src={leftArrow} alt="left arrow" />
        </button>

        <button
          type="button"
          onClick={onScrollRight}
          className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100 transition"
        >
          <img src={rightArrow} alt="right arrow" />
        </button>
      </div>
    </div>
  );
};

export default SectionHeader;
