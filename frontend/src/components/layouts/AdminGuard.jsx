import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

const AdminGuard = ({ children }) => {
    const { user } = useUser();

    if (!user || (user.role !== 'admin' && user.role !== 'owner')) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default AdminGuard;
