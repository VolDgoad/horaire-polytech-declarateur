import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { DeclarationProvider } from "./context/DeclarationContext";

// Pages
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import DeclarationsPage from "./pages/DeclarationsPage";
import NewDeclarationPage from "./pages/NewDeclarationPage";
import DeclarationDetailPage from "./pages/DeclarationDetailPage";
import ValidationsPage from "./pages/ValidationsPage";
import ValidationDetailPage from "./pages/ValidationDetailPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Route protégée avec redirection
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Route qui redirige vers le tableau de bord si l'utilisateur est déjà connecté
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

// Routes réservées aux enseignants
const TeacherRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  
  if (user?.role !== 'Enseignant') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// Routes réservées aux validateurs (scolarité, chefs de département, directrice)
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
        <DeclarationProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Page de connexion - accessible uniquement si non connecté */}
              <Route path="/login" element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              } />
              
              {/* Redirection de la page d'accueil vers la connexion ou le tableau de bord */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* Routes protégées - accessibles uniquement si connecté */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              {/* Routes pour les enseignants */}
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
              
              {/* Routes pour les validateurs */}
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
              
              {/* Route 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </DeclarationProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
