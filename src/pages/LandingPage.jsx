import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import MerchantServices from '../components/sections/MerchantServices';
import UserVisual from '../components/sections/UserVisual';
import '../App.css';

const LandingPage = () => {
  return (
    <div>
      <Navbar />
      <UserVisual />
      <MerchantServices />
      <Footer />
    </div>
  );
};

export default LandingPage;