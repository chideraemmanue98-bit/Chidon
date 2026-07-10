import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Simple types for our user role and auth context
export type UserRole = 'buyer' | 'seller';

export interface UserContextType {
  user: {
    uid: string;
    email: string;
    role: UserRole;
    username: string;
  } | null;
  loading: boolean;
  switchRole: (newRole: UserRole) => Promise<void>;
}

// Simple Mock Hook representing the Auth Context state
export const useAuth = (): UserContextType => {
  // In a real application, this context would read from Firebase Auth or a custom Express JWT state.
  return {
    user: {
      uid: 'user_123',
      email: 'creator@chidoniq.com',
      role: 'buyer', // Dynamic default
      username: 'chidon_creator'
    },
    loading: false,
    switchRole: async (newRole: UserRole) => {
      console.log(`Role switched to: ${newRole}`);
    }
  };
};

// ---------------------------------------------------------
// ROLE GUARD ROUTING MIDDLEWARE
// ---------------------------------------------------------

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: UserRole;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  // No authenticated user, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role-based authorization guard
  if (allowedRole && user.role !== allowedRole) {
    // If buyer tries to access /seller, redirect to /buyer. If seller tries /buyer, redirect to /seller.
    return <Navigate to={user.role === 'seller' ? '/seller' : '/buyer'} replace />;
  }

  return <>{children}</>;
};

// ---------------------------------------------------------
// CUSTOM ROLE GUARD HOOK
// ---------------------------------------------------------
export function useRoleGuard() {
  const { user } = useAuth();
  const location = useLocation();

  const checkAccess = (path: string): boolean => {
    if (!user) return false;
    if (path.startsWith('/seller') && user.role !== 'seller') return false;
    if (path.startsWith('/buyer') && user.role !== 'buyer') return false;
    return true;
  };

  return { checkAccess, role: user?.role };
}

// ---------------------------------------------------------
// ROUTE REGISTRATION & COMPONENT DECLARATIONS
// ---------------------------------------------------------

// Layout & Page Placeholders (Imported or declared inline for modularity)
const LoginPlaceholder = () => <div className="text-white p-8">Login Page</div>;
const BuyerLayout = () => <div className="text-white p-8 font-sans">Buyer Experience Layout</div>;
const BuyerHome = () => <div className="text-white p-8">Buyer Dashboard / Search Gigs</div>;
const BuyerSearch = () => <div className="text-white p-8">Search Filters View</div>;
const BuyerGigDetails = () => <div className="text-white p-8">Gig Details Page</div>;
const BuyerOrders = () => <div className="text-white p-8">Buyer Orders History</div>;
const BuyerOrderWorkspace = () => <div className="text-white p-8">Buyer Escrow Active Workspace</div>;
const BuyerFavorites = () => <div className="text-white p-8">Saved Favorites</div>;

const SellerLayout = () => <div className="text-white p-8 font-sans">Seller Business Sidebar Layout</div>;
const SellerDashboard = () => <div className="text-white p-8">Seller Earnings Metrics</div>;
const SellerGigs = () => <div className="text-white p-8">Gigs Manager</div>;
const SellerCreateGig = () => <div className="text-white p-8">Multi-step Gig Composer</div>;
const SellerOrders = () => <div className="text-white p-8">Incoming Orders Queue</div>;
const SellerWorkroom = () => <div className="text-white p-8">Seller Delivery Workroom</div>;
const SellerAnalytics = () => <div className="text-white p-8">Earnings & Views Charts</div>;
const SellerProfile = () => <div className="text-white p-8">Portfolio Builder</div>;

const PublicProfile = () => <div className="text-white p-8">Public Professional Profile</div>;
const GlobalChat = () => <div className="text-white p-8">Real-time Inbox Messenger</div>;

export const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Root redirection according to user role upon successful auth */}
      <Route 
        path="/" 
        element={
          user ? (
            <Navigate to={user.role === 'seller' ? '/seller' : '/buyer'} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />

      <Route path="/login" element={<LoginPlaceholder />} />

      {/* ==========================================
          BUYER EXPERIENCE PANELS (PROTECTED)
          ========================================== */}
      <Route 
        path="/buyer" 
        element={
          <ProtectedRoute allowedRole="buyer">
            <BuyerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<BuyerHome />} />
        <Route path="search" element={<BuyerSearch />} />
        <Route path="gig/:id" element={<BuyerGigDetails />} />
        <Route path="orders" element={<BuyerOrders />} />
        <Route path="order/:id" element={<BuyerOrderWorkspace />} />
        <Route path="favorites" element={<BuyerFavorites />} />
      </Route>

      {/* ==========================================
          SELLER EXPERIENCE PANELS (PROTECTED)
          ========================================== */}
      <Route 
        path="/seller" 
        element={
          <ProtectedRoute allowedRole="seller">
            <SellerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<SellerDashboard />} />
        <Route path="gigs" element={<SellerGigs />} />
        <Route path="gigs/create" element={<SellerCreateGig />} />
        <Route path="orders" element={<SellerOrders />} />
        <Route path="order/:id" element={<SellerWorkroom />} />
        <Route path="analytics" element={<SellerAnalytics />} />
        <Route path="profile" element={<SellerProfile />} />
      </Route>

      {/* ==========================================
          SHARED GLOBAL VIEWS
          ========================================== */}
      <Route path="/profile/:username" element={<PublicProfile />} />
      <Route 
        path="/chat" 
        element={
          <ProtectedRoute>
            <GlobalChat />
          </ProtectedRoute>
        } 
      />

      {/* Wildcard Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
