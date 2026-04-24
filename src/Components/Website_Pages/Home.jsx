import React from 'react';
import HeroBanner from '../HomeComponents/HeroBanner';
import TrendingProducts from '../HomeComponents/TrendingProducts';
import SaleIsLive from '../HomeComponents/SaleIsLive';
import ShopByCategory from '../HomeComponents/ShopByCategory';
import ShopByWholesalePrice from '../HomeComponents/ShopByWholesalePrice';
import ExploreBestsellers from '../HomeComponents/ExploreBestsellers';

const Home = () => {
  return (
    <div className="min-h-screen">
      <HeroBanner />
      <TrendingProducts />
      <SaleIsLive />
      <ShopByCategory />
      <ShopByWholesalePrice />
      <ExploreBestsellers />
    </div>
  );
};

export default Home;