import React from 'react';

const NavigationBar = () => {
  return (
    <div className="w-96 h-24 relative">
      <div className="w-96 absolute inline-flex flex-col items-start">
        <div className="w-96 h-24 absolute border-b-[0.33px] border-[#0F0F0F]/30 overflow-hidden">
          <div className="w-96 h-24 absolute bg-white/75 backdrop-blur-xl" />
        </div>
        <div className="w-96 h-14 pt-5 flex flex-col items-start">
          <div className="w-full flex justify-between items-center">
            <div className="flex-1 pl-4 pr-1.5 flex justify-center items-center gap-2.5">
              <div className="text-base font-semibold text-[#000] font-['Open_Sans'] leading-snug">9:41</div>
            </div>
            <div className="w-32 h-2.5" />
            <div className="flex-1 pl-1.5 pr-4 flex justify-center items-center gap-1.5">
              <div className="w-5 h-3 bg-black" />
              <div className="w-4 h-3 bg-black" />
              <div className="w-6 h-3 opacity-30 rounded border border-black" />
              <div className="w-[1.33px] h-1 opacity-40 bg-black" />
              <div className="w-5 h-2 bg-black rounded-sm" />
            </div>
          </div>
        </div>
        <div className="w-full flex flex-col items-start">
          <div className="h-11 relative w-full" />
        </div>
      </div>
    </div>
  );
};

export default NavigationBar;
