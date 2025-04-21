import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import { toast } from '@/components/ui/sonner';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (email: string, password: string, name: string) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo purposes
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Dr. Amadou Diop',
    email: 'enseignant@polytech.edu',
    role: 'Enseignant',
    department: 'Informatique'
  },
  {
    id: '2',
    name: 'Fatou Ndiaye',
    email: 'scolarite@polytech.edu',
    role: 'Scolarité'
  },
  {
    id: '3',
    name: 'Prof. Ibrahima Sall',
    email: 'chef@polytech.edu',
    role: 'Chef de département',
    department: 'Informatique'
  },
  {
    id: '4',
    name: 'Dr. Aïda Mbaye',
    email: 'directrice@polytech.edu',
    role: 'Directrice des études'
  }
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem('polytechUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user = MOCK_USERS.find(u => u.email === email);
      
      if (!user) {
        throw new Error('Identifiants invalides');
      }
      
      // In a real app, you'd validate the password here
      if (password.length < 6) {
        throw new Error('Mot de passe invalide');
      }
      
      setUser(user);
      localStorage.setItem('polytechUser', JSON.stringify(user));
      toast.success('Connexion réussie');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Une erreur est survenue lors de la connexion');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    
    try {
      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user already exists
      if (MOCK_USERS.some(u => u.email === email)) {
        throw new Error('Un utilisateur avec cet email existe déjà');
      }
      
      // Create new user (in a real app, this would be handled by Supabase)
      const newUser: User = {
        id: String(MOCK_USERS.length + 1),
        name,
        email,
        role: 'Enseignant',
        department: 'Informatique'
      };
      
      MOCK_USERS.push(newUser);
      setUser(newUser);
      localStorage.setItem('polytechUser', JSON.stringify(newUser));
      toast.success('Inscription réussie');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Une erreur est survenue lors de l\'inscription');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('polytechUser');
    toast.success('Vous êtes déconnecté');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, signup, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
