import React from 'react';

const ScoreDisplay = ({ scores }) => {
  return (
    <div className="w-60 h-5 relative">
      {scores?.[0] && (
        <div className="absolute left-0 top-0 text-black text-3xl font-bold font-['Open_Sans'] leading-none">
          {scores[0]}
        </div>
      )}
      {scores?.[1] && (
        <div className="absolute left-[114px] top-0 text-black text-3xl font-bold font-['Open_Sans'] leading-none">
          {scores[1]}
        </div>
      )}
      {scores?.[2] && (
        <div className="absolute left-[226px] top-[1px] text-black text-3xl font-bold font-['Open_Sans'] leading-none">
          {scores[2]}
        </div>
      )}
    </div>
  );
};

export default ScoreDisplay;
