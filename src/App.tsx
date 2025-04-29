
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { DeclarationProvider } from "./context/DeclarationContext";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import DeclarationsPage from "./pages/DeclarationsPage";
import NewDeclarationPage from "./pages/NewDeclarationPage";
import DeclarationDetailPage from "./pages/DeclarationDetailPage";
import ValidationsPage from "./pages/ValidationsPage";
import ValidationDetailPage from "./pages/ValidationDetailPage";
import NotFound from "./pages/NotFound";
import RegisterPage from "./pages/RegisterPage";

// Import des nouvelles pages d'administration
import AdminPage from "./pages/admin/AdminPage";
import UsersPage from "./pages/admin/UsersPage";
import DepartmentsPage from "./pages/admin/DepartmentsPage";
import FilieresPage from "./pages/admin/FilieresPage";
import NiveauxPage from "./pages/admin/NiveauxPage";
import SemestresPage from "./pages/admin/SemestresPage";
import UEPage from "./pages/admin/UEPage";
import ECPage from "./pages/admin/ECPage";

const queryClient = new QueryClient();

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <DeclarationProvider>
      {children}
    </DeclarationProvider>
  );
}

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  return (
    <RequireAuth>
      {children}
    </RequireAuth>
  );
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// Route pour l'administrateur (Directrice des études)
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  
  if (user?.role !== 'Directrice des études') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// Mise à jour du TeacherRoute pour autoriser aussi les chefs de département et la directrice
const TeacherRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  
  if (!['Enseignant', 'Chef de département', 'Directrice des études'].includes(user?.role || '')) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const ValidatorRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  
  if (!['Scolarité', 'Chef de département', 'Directrice des études'].includes(user?.role || '')) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            } />
            
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/declarations" element={
              <ProtectedRoute>
                <TeacherRoute>
                  <DeclarationsPage />
                </TeacherRoute>
              </ProtectedRoute>
            } />
            
            <Route path="/declarations/new" element={
              <ProtectedRoute>
                <TeacherRoute>
                  <NewDeclarationPage />
                </TeacherRoute>
              </ProtectedRoute>
            } />
            
            <Route path="/declarations/:id" element={
              <ProtectedRoute>
                <TeacherRoute>
                  <DeclarationDetailPage />
                </TeacherRoute>
              </ProtectedRoute>
            } />
            
            <Route path="/validations" element={
              <ProtectedRoute>
                <ValidatorRoute>
                  <ValidationsPage />
                </ValidatorRoute>
              </ProtectedRoute>
            } />
            
            <Route path="/validations/:id" element={
              <ProtectedRoute>
                <ValidatorRoute>
                  <ValidationDetailPage />
                </ValidatorRoute>
              </ProtectedRoute>
            } />
            
            {/* Routes d'administration */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminRoute>
                  <AdminPage />
                </AdminRoute>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/users" element={
              <ProtectedRoute>
                <AdminRoute>
                  <UsersPage />
                </AdminRoute>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/departments" element={
              <ProtectedRoute>
                <AdminRoute>
                  <DepartmentsPage />
                </AdminRoute>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/filieres" element={
              <ProtectedRoute>
                <AdminRoute>
                  <FilieresPage />
                </AdminRoute>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/niveaux" element={
              <ProtectedRoute>
                <AdminRoute>
                  <NiveauxPage />
                </AdminRoute>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/semestres" element={
              <ProtectedRoute>
                <AdminRoute>
                  <SemestresPage />
                </AdminRoute>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/ues" element={
              <ProtectedRoute>
                <AdminRoute>
                  <UEPage />
                </AdminRoute>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/ecs" element={
              <ProtectedRoute>
                <AdminRoute>
                  <ECPage />
                </AdminRoute>
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
