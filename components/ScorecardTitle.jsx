import React from 'react';

const ScorecardTitle = () => {
  return (
    <div className="w-96 h-12 relative">
      {/* Press Log Button */}
      <div className="absolute left-[276px] top-[12px] w-28 h-7 bg-[#0F0F0F]/75 rounded-[5px] outline outline-1 outline-[#0F0F0F]/0" />
      <div className="absolute left-[315px] top-[17px] text-stone-50 text-xs font-semibold font-['Open_Sans'] leading-none">
        Press Log
      </div>
      <div className="absolute left-[289px] top-[15px] w-5 h-5 bg-stone-50" />

      {/* Scorecard Title */}
      <div className="absolute left-[20px] top-[17px] text-zinc-700 text-2xl font-extrabold font-['Open_Sans'] leading-none">
        Scorecard
      </div>
    </div>
  );
};

export default ScorecardTitle;
