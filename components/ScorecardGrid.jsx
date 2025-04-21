import React from 'react';

const ScorecardGrid = () => {
  return (
    <div className="w-96 h-[540px] relative">
      {/* Vertical grid lines */}
      <div className="absolute left-0 top-[90px] w-0 h-96 -rotate-90 origin-top-left outline outline-2 outline-offset-[-1px] outline-[#0F0F0F]/25" />
      <div className="absolute left-0 top-[140px] w-0 h-96 -rotate-90 origin-top-left outline outline-1 outline-offset-[-0.5px] outline-zinc-700/20" />
      <div className="absolute left-0 top-[190px] w-0 h-96 -rotate-90 origin-top-left outline outline-1 outline-offset-[-0.5px] outline-zinc-700/20" />
      <div className="absolute left-0 top-[240px] w-0 h-96 -rotate-90 origin-top-left outline outline-1 outline-offset-[-0.5px] outline-zinc-700/20" />
      <div className="absolute left-0 top-[290px] w-0 h-96 -rotate-90 origin-top-left outline outline-1 outline-offset-[-0.5px] outline-zinc-700/20" />
      <div className="absolute left-0 top-[340px] w-0 h-96 -rotate-90 origin-top-left outline outline-1 outline-offset-[-0.5px] outline-zinc-700/20" />
      <div className="absolute left-0 top-[390px] w-0 h-96 -rotate-90 origin-top-left outline outline-1 outline-offset-[-0.5px] outline-zinc-700/20" />
      <div className="absolute left-0 top-[440px] w-0 h-96 -rotate-90 origin-top-left outline outline-1 outline-offset-[-0.5px] outline-zinc-700/20" />
      <div className="absolute left-0 top-[490px] w-0 h-96 -rotate-90 origin-top-left outline outline-1 outline-offset-[-0.5px] outline-zinc-700/20" />

      {/* Top and bottom border lines */}
      <div className="absolute left-0 top-0 w-0 h-96 -rotate-90 origin-top-left outline outline-2 outline-offset-[-1px] outline-[#0F0F0F]/50" />
      <div className="absolute left-0 top-[540px] w-0 h-96 -rotate-90 origin-top-left outline outline-2 outline-offset-[-1px] outline-[#0F0F0F]/25" />
      <div className="absolute left-0 top-[590px] w-0 h-96 -rotate-90 origin-top-left outline outline-2 outline-offset-[-1px] outline-[#0F0F0F]/25" />

      {/* Background fill rows */}
      <div className="absolute left-0 top-[464.16px] w-[464.16px] h-16 -rotate-90 origin-top-left bg-neutral-700/10" />
      <div className="absolute left-0 top-[540px] w-96 h-12 bg-neutral-700/10" />
      <div className="absolute left-0 top-[590px] w-96 h-36 bg-neutral-700/10" />

      {/* Horizontal lines */}
      <div className="absolute left-[176px] top-[1px] w-[724px] h-0 rotate-90 origin-top-left outline outline-1 outline-offset-[-0.5px] outline-zinc-700/20" />
      <div className="absolute left-[289px] top-[1px] w-[724px] h-0 rotate-90 origin-top-left outline outline-1 outline-offset-[-0.5px] outline_zinc-700/20" />
    </div>
  );
};

export default ScorecardGrid;
