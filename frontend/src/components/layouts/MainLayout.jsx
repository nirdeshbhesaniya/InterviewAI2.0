// src/layouts/MainLayout.jsx
// MainLayout.jsx
import Header from '../../pages/InterviewPrep/components/Header';
import { Outlet } from 'react-router-dom';
import Footer from '../../pages/InterviewPrep/components/Footer';
import { useTestMode } from '../../context/TestModeContext';
import { useInterviewMode } from '../../context/InterviewModeContext';

const MainLayout = () => {
  const { isTestActive } = useTestMode();
  const { isInterviewActive } = useInterviewMode();

  // Hide header and footer during tests or interviews
  const shouldHideHeaderFooter = isTestActive || isInterviewActive;

  return (
    <div className="flex flex-col min-h-screen">
      {!shouldHideHeaderFooter && <Header />}
      <main className="flex-1">
        <Outlet />
      </main>
      {!shouldHideHeaderFooter && <Footer />}
    </div>
  );
};

export default MainLayout;
