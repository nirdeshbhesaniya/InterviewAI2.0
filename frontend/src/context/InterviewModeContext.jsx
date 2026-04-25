import { createContext, useContext, useState } from 'react';

const InterviewModeContext = createContext();

export const useInterviewMode = () => {
    const context = useContext(InterviewModeContext);
    if (!context) {
        throw new Error('useInterviewMode must be used within InterviewModeProvider');
    }
    return context;
};

export const InterviewModeProvider = ({ children }) => {
    const [isInterviewActive, setIsInterviewActive] = useState(false);

    return (
        <InterviewModeContext.Provider value={{ isInterviewActive, setIsInterviewActive }}>
            {children}
        </InterviewModeContext.Provider>
    );
};
