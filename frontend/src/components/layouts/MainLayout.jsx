// src/layouts/MainLayout.jsx
// MainLayout.jsx
import Header from '../../pages/InterviewPrep/components/Header';
import { Outlet } from 'react-router-dom';
import Footer from '../../pages/InterviewPrep/components/Footer';
import { useTestMode } from '../../context/TestModeContext';

const MainLayout = () => {
  const { isTestActive } = useTestMode();

  return (
    <>
      {!isTestActive && <Header />}
      <main>
        <Outlet />
      </main>
      {!isTestActive && <Footer />}
    </>
  );
};

export default MainLayout;
