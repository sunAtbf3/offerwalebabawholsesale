import React from 'react';
import HeroBanner from '../HomeComponents/HeroBanner';
import TrendingProducts from '../HomeComponents/TrendingProducts';
import SaleIsLive from '../HomeComponents/SaleIsLive';
import ExploreBestsellers from '../HomeComponents/ExploreBestsellers';
import CategoryProducts from '../HomeComponents/Categories/Categories';
import { useGetAllCategoriesQuery } from '../REDUX_FEATURES/REDUX_SLICES/SHOP_BY_CATEGORY/categoriesApi';
import CategorySection from '../HomeComponents/Categories/Categories';

const Home = () => {
  const { data: categories = [], isLoading, isError } = useGetAllCategoriesQuery();

  return (
    <div className="min-h-screen overflow-hidden">
      <HeroBanner />
      <TrendingProducts />
      <SaleIsLive />
      <ExploreBestsellers />
      {categories.map((cat) => (
        <CategorySection
          key={cat.slug}
          slug={cat.slug}
          title={cat.name}
        />
      ))}
    </div>
  );
};

export default Home;