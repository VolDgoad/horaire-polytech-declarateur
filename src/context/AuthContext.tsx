import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (email: string, password: string, metadata: Record<string, any>) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      setIsLoading(true);
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const userId = session.user.id;
          
          // Create a minimal user object first to avoid redirects to login page
          const minimalUser: User = {
            id: userId,
            name: session.user.email || 'Utilisateur',
            email: session.user.email || '',
            role: 'Enseignant', // Default role until profile is loaded
          };
          
          setUser(minimalUser);
          
          // Then try to fetch the full profile in the background
          try {
            await fetchUserProfile(userId);
          } catch (profileError) {
            console.error('Error loading user profile:', profileError);
            // Keep the minimal user object even if profile fetch fails
          }
        }
      } catch (error) {
        console.error('Session initialization error:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Create minimal user immediately to avoid login redirect issues
        const minimalUser: User = {
          id: session.user.id,
          name: session.user.email || 'Utilisateur',
          email: session.user.email || '',
          role: 'Enseignant', // Default role until profile is loaded
        };
        
        setUser(minimalUser);
        setIsLoading(false);
        
        // Then fetch full profile asynchronously
        setTimeout(() => {
          fetchUserProfile(session.user.id).catch(err => {
            console.error('Error fetching profile after sign in:', err);
          });
        }, 0);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      // Instead of using RLS directly, use a simple custom query
      const { data: authUser, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authUser.user) {
        throw authError || new Error('User not found');
      }
      
      // Simplified query to avoid RLS policy recursion issues
      const { data, error } = await supabase.rpc('get_current_user_profile');
      
      if (error) {
        console.error('Error fetching user profile:', error);
        throw error;
      }
      
      if (data) {
        // First get department name if department ID exists
        let departmentName;
        if (data.departement_id) {
          try {
            const { data: deptData, error: deptError } = await supabase
              .from('departements')
              .select('nom')
              .eq('id', data.departement_id)
              .single();
              
            if (!deptError && deptData) {
              departmentName = deptData.nom;
            }
          } catch (deptError) {
            console.error('Error fetching department:', deptError);
          }
        }

        const userProfile: User = {
          id: data.id,
          name: `${data.prenom} ${data.nom}`,
          email: data.email,
          role: data.role,
          department: departmentName || undefined,
          grade: data.grade || undefined
        };
        
        setUser(userProfile);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      // Don't clear the user here - keep the minimal user object
      // This way user doesn't get redirected to login
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      if (!data.user) {
        throw new Error('Aucun utilisateur trouvé');
      }
      
      // Create minimal user right away
      const minimalUser: User = {
        id: data.user.id,
        name: data.user.email || 'Utilisateur',
        email: data.user.email || '',
        role: 'Enseignant', // Default role until profile is loaded
      };
      
      setUser(minimalUser);
      toast.success('Connexion réussie');
      
      // The full profile will be loaded by the auth state change listener
    } catch (error: any) {
      toast.error(error.message || 'Une erreur est survenue lors de la connexion');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, metadata: Record<string, any>) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });
      
      if (error) {
        throw error;
      }
      
      toast.success('Inscription réussie');
    } catch (error: any) {
      toast.error(error.message || 'Une erreur est survenue lors de l\'inscription');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      setUser(null);
      toast.success('Vous êtes déconnecté');
    } catch (error: any) {
      toast.error(error.message || 'Une erreur est survenue lors de la déconnexion');
    }
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
