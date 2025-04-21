import React from 'react';

const HeaderSection = () => {
  return (
    <div className="w-96 h-11 relative">
      <div className="w-96 h-11 absolute inline-flex flex-col items-start">
        <div className="w-full h-11 relative">
          {/* Back Button */}
          <div className="pl-2 py-2.5 absolute left-0 top-0 inline-flex items-center gap-1.5">
            <div className="text-base text-[#007AFF] font-['SF_Pro'] leading-snug">􀆉</div>
            <div className="text-base text-[#007AFF] font-['Open_Sans'] font-normal leading-snug">Back</div>
          </div>

          {/* Logo (Placeholder) */}
          <img
            className="w-20 h-9 absolute left-[159px] top-[3px]"
            src="https://placehold.co/84x38"
            alt="Logo"
          />

          {/* Trailing icon button placeholder */}
          <div className="pr-4 py-2.5 absolute left-[362px] top-0 inline-flex justify-end items-center gap-4" />

          {/* Help Icon (blue dot/placeholder) */}
          <div className="w-5 h-5 absolute left-[366px] top-[11px] overflow-hidden">
            <div className="w-5 h-5 absolute left-[1px] top-[1px] bg-blue-600 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderSection;
