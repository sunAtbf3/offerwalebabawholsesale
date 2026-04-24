import React from 'react';

const BestsellerCard = ({ category }) => {
  return (
    <div className="group cursor-pointer overflow-hidden rounded-2xl relative bg-navy">
      <div className="aspect-[3/4] overflow-hidden">
        <img
          src={category.image}
          alt={category.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-90 group-hover:opacity-100"
          loading="lazy"
        />
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-16">
        <h3 className="text-white text-[14px] font-extrabold tracking-wide">{category.name}</h3>
      </div>
    </div>
  );
};

export default BestsellerCard;
