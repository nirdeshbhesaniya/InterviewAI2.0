// src/layouts/MainLayout.jsx
import React from 'react';
import Header from '../../pages/InterviewPrep/components/Header';
import { Outlet } from 'react-router-dom';
import Footer from '../../pages/InterviewPrep/components/Footer';

const MainLayout = () => {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer/>
    </>
  );
};

export default MainLayout;
