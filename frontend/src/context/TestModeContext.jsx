import { createContext, useContext, useState } from 'react';

const TestModeContext = createContext();

export const useTestMode = () => {
    const context = useContext(TestModeContext);
    if (!context) {
        throw new Error('useTestMode must be used within TestModeProvider');
    }
    return context;
};

export const TestModeProvider = ({ children }) => {
    const [isTestActive, setIsTestActive] = useState(false);

    return (
        <TestModeContext.Provider value={{ isTestActive, setIsTestActive }}>
            {children}
        </TestModeContext.Provider>
    );
};
