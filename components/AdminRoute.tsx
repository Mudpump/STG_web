
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

/**
 * AdminRoute — 관리자 전용 Route Guard
 * 로그인하지 않았거나 관리자가 아닌 사용자가 /admin에 접근하면 홈으로 리다이렉트합니다.
 */
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAdmin, currentUser } = useStore();

    // 로그인하지 않았거나 관리자가 아니면 홈으로 리다이렉트
    if (!currentUser || !isAdmin) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};
