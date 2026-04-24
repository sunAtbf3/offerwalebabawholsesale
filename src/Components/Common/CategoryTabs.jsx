import React, { useState } from 'react';
import { ChevronDown, Tag, Ticket, BadgeCheck } from 'lucide-react';

const tabs = [
  { id: 'all', label: 'All Categories', icon: ChevronDown },
  { id: 'deals', label: "Today's deal", badge: 'HOT', badgeColor: 'bg-red-500' },
  { id: 'new', label: '+ Just arrived', badge: 'NEW', badgeColor: 'bg-green-600' },
  { id: 'sale', label: 'Sale', icon: Tag },
  { id: 'coupons', label: 'Coupons', icon: Ticket },
  { id: 'verified', label: 'Verified manufacturers', icon: BadgeCheck },
];

const CategoryTabs = () => {
  const [activeTab, setActiveTab] = useState('all');

  return (
    <div className="bg-white border-b border-edge">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
        <div className="flex items-center gap-1 overflow-x-auto scroll-hide py-1.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-semibold whitespace-nowrap rounded-lg transition-all duration-200 ${
                activeTab === tab.id
                  ? 'text-navy bg-gold-light border border-gold'
                  : 'text-muted hover:text-navy hover:bg-panel border border-transparent'
              }`}
            >
              {tab.icon && <tab.icon size={13} />}
              {tab.label}
              {tab.badge && (
                <span className={`${tab.badgeColor} text-white text-[8px] font-extrabold px-1.5 py-px rounded-sm leading-tight`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryTabs;
