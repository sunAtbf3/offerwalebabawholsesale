import React from 'react';
import { CheckSquare, Clock, Mail, User } from 'lucide-react';
import data from '../../Data/data.json';

const TopInfoBar = () => {
  const { user } = data;

  return (
    <div className="bg-navy py-1.5">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 flex items-center justify-between gap-3 flex-wrap">
        {/* Left Info */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <User size={11} />
            <span className="font-semibold text-slate-300">Wholesale Portal</span>
          </div>
          <div className="w-px h-3 bg-slate-700" />
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <CheckSquare size={11} className="text-green-400" />
            GST invoicing enabled
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400">
            <Clock size={11} className="text-blue-400" />
            Pan India · 24/7 support
          </div>
          <div className="hidden md:flex items-center gap-1.5 text-[11px] text-slate-400">
            <Mail size={11} />
            support@offerwale.com
          </div>
        </div>

        {/* Right Credit */}
        <div className="hidden md:flex items-center gap-3">
          <span className="bg-gold text-navy text-[10px] font-extrabold px-2.5 py-0.5 rounded">
            {user.tier}
          </span>
          <span className="bg-navy-light text-gold text-[9px] font-bold px-2 py-0.5 rounded border border-slate-700">
            Tier {user.tierLevel}
          </span>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <span>Limit <span className="text-white font-semibold">₹{user.creditLimit.toLocaleString('en-IN')}</span></span>
            <span className="text-slate-600">·</span>
            <span>Used <span className="text-white font-semibold">₹{user.creditUsed.toLocaleString('en-IN')}</span></span>
            <span className="text-slate-600">·</span>
            <span>Free <span className="text-green-400 font-bold">₹{user.creditFree.toLocaleString('en-IN')}</span></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopInfoBar;
