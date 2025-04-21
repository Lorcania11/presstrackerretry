import React from 'react';

const teamColors = {
  1: 'bg-green-500',
  2: 'bg-yellow-400',
  3: 'bg-red-500',
};

const TeamsLayout = ({ teams }) => {
  return (
    <div className="w-72 h-16 relative">
      {teams.map((team, index) => (
        <div
          key={team.id}
          className={`absolute ${index === 0 ? 'left-0 top-[1px]' : index === 1 ? 'left-[122px] top-[1px]' : 'left-[221px] top-0'} ${
            team.id === 2 ? 'w-11 h-16' : 'w-16 h-16'
          }`}
        >
          <div
            className={`w-11 h-11 absolute rounded-full ${
              team.id === 1 ? 'left-[9px] top-0' : team.id === 2 ? 'left-0 top-0' : 'left-[14px] top-0'
            } ${teamColors[team.id]}`}
          />
          <div
            className={`absolute top-[52px] text-black text-xs font-semibold font-['Open_Sans'] leading-none ${
              team.id === 2 ? 'left-[7px]' : 'left-0'
            }`}
          >
            {team.name}
          </div>
          <div
            className={`absolute text-black text-xs font-semibold font-['Open_Sans'] leading-none ${
              team.id === 1 ? 'left-[27px] top-[13px]' : team.id === 2 ? 'left-[18px] top-[13px]' : 'left-[33px] top-[14px]'
            }`}
          >
            {team.name?.[0] || ''}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TeamsLayout;
