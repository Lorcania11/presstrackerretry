import React from 'react';

const PressNotification = ({ presses = [] }) => {
  const dotSize = 10; // tailwind = w-2.5
  const topOffset = 4; // px from top
  const baseLeft = 56; // rightmost dot
  const spacing = 12; // distance between dots

  return (
    <div className="w-60 h-5 relative">
      {presses.map((press, index) => {
        const left = baseLeft - index * spacing;
        const bgColor =
          press.teamId === 1
            ? 'bg-green-500'
            : press.teamId === 2
            ? 'bg-yellow-400'
            : 'bg-red-500';

        return (
          <div
            key={index}
            className={`w-2.5 h-2.5 absolute top-[${topOffset}px] left-[${left}px] ${bgColor} rounded-full`}
          />
        );
      })}
    </div>
  );
};

export default PressNotification;
