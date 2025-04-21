
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Declaration, DeclarationStatus, Stats, Department, Course } from '@/types';
import { useAuth } from './AuthContext';
import { toast } from '@/components/ui/sonner';

interface DeclarationContextType {
  declarations: Declaration[];
  departments: Department[];
  courses: Course[];
  userDeclarations: Declaration[];
  pendingDeclarations: Declaration[];
  createDeclaration: (declaration: Omit<Declaration, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'userName' | 'status'>) => void;
  updateDeclaration: (id: string, updates: Partial<Declaration>) => void;
  deleteDeclaration: (id: string) => void;
  updateStatus: (id: string, status: DeclarationStatus, reason?: string) => void;
  getDeclarationById: (id: string) => Declaration | undefined;
  getUserStats: () => Stats;
}

// Sample data
const MOCK_DEPARTMENTS: Department[] = [
  { id: '1', name: 'Informatique' },
  { id: '2', name: 'Génie Civil' },
  { id: '3', name: 'Electromécanique' },
  { id: '4', name: 'Gestion' }
];

const MOCK_COURSES: Course[] = [
  { id: '1', name: 'Algorithmique et Programmation', departmentId: '1' },
  { id: '2', name: 'Bases de Données', departmentId: '1' },
  { id: '3', name: 'Réseaux Informatiques', departmentId: '1' },
  { id: '4', name: 'Intelligence Artificielle', departmentId: '1' },
  { id: '5', name: 'Mécanique des Sols', departmentId: '2' },
  { id: '6', name: 'Résistance des Matériaux', departmentId: '2' },
  { id: '7', name: 'Électronique de Puissance', departmentId: '3' },
  { id: '8', name: 'Comptabilité Générale', departmentId: '4' }
];

const MOCK_DECLARATIONS: Declaration[] = [
  {
    id: '1',
    userId: '1',
    userName: 'Dr. Amadou Diop',
    department: 'Informatique',
    course: 'Algorithmique et Programmation',
    date: '2025-04-15',
    hours: 4,
    status: 'submitted',
    createdAt: '2025-04-15T10:00:00.000Z',
    updatedAt: '2025-04-15T10:00:00.000Z'
  },
  {
    id: '2',
    userId: '1',
    userName: 'Dr. Amadou Diop',
    department: 'Informatique',
    course: 'Bases de Données',
    date: '2025-04-16',
    hours: 3,
    status: 'verified',
    verifiedBy: 'Fatou Ndiaye',
    createdAt: '2025-04-16T11:30:00.000Z',
    updatedAt: '2025-04-17T09:15:00.000Z'
  },
  {
    id: '3',
    userId: '1',
    userName: 'Dr. Amadou Diop',
    department: 'Informatique',
    course: 'Réseaux Informatiques',
    date: '2025-04-17',
    hours: 2,
    status: 'approved',
    verifiedBy: 'Fatou Ndiaye',
    approvedBy: 'Prof. Ibrahima Sall',
    createdAt: '2025-04-17T14:00:00.000Z',
    updatedAt: '2025-04-18T10:45:00.000Z'
  },
  {
    id: '4',
    userId: '1',
    userName: 'Dr. Amadou Diop',
    department: 'Informatique',
    course: 'Intelligence Artificielle',
    date: '2025-04-18',
    hours: 6,
    status: 'validated',
    verifiedBy: 'Fatou Ndiaye',
    approvedBy: 'Prof. Ibrahima Sall',
    validatedBy: 'Dr. Aïda Mbaye',
    createdAt: '2025-04-18T16:30:00.000Z',
    updatedAt: '2025-04-20T11:20:00.000Z'
  },
  {
    id: '5',
    userId: '1',
    userName: 'Dr. Amadou Diop',
    department: 'Informatique',
    course: 'Bases de Données',
    date: '2025-04-19',
    hours: 3,
    status: 'rejected',
    verifiedBy: 'Fatou Ndiaye',
    rejectedBy: 'Prof. Ibrahima Sall',
    rejectionReason: 'Incompatibilité avec le calendrier du département',
    createdAt: '2025-04-19T09:45:00.000Z',
    updatedAt: '2025-04-20T14:10:00.000Z'
  },
  {
    id: '6',
    userId: '1',
    userName: 'Dr. Amadou Diop',
    department: 'Informatique',
    course: 'Algorithmique et Programmation',
    date: '2025-04-20',
    hours: 2,
    status: 'draft',
    createdAt: '2025-04-20T08:30:00.000Z',
    updatedAt: '2025-04-20T08:30:00.000Z'
  }
];

const DeclarationContext = createContext<DeclarationContextType | undefined>(undefined);

export function DeclarationProvider({ children }: { children: ReactNode }) {
  const [declarations, setDeclarations] = useState<Declaration[]>(MOCK_DECLARATIONS);
  const { user } = useAuth();

  const userDeclarations = user 
    ? declarations.filter(d => d.userId === user.id) 
    : [];

  const pendingDeclarations = user 
    ? declarations.filter(d => {
        if (user.role === 'scolarite') {
          return d.status === 'submitted';
        } else if (user.role === 'chef_departement' && user.department) {
          return d.status === 'verified' && d.department === user.department;
        } else if (user.role === 'directrice') {
          return d.status === 'approved';
        }
        return false;
      })
    : [];

  const createDeclaration = (newDeclaration: Omit<Declaration, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'userName' | 'status'>) => {
    if (!user) return;
    
    const now = new Date().toISOString();
    const declaration: Declaration = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
      ...newDeclaration
    };
    
    setDeclarations(prev => [declaration, ...prev]);
    toast.success('Déclaration créée avec succès');
  };

  const updateDeclaration = (id: string, updates: Partial<Declaration>) => {
    setDeclarations(prev => 
      prev.map(d => 
        d.id === id 
          ? { 
              ...d, 
              ...updates, 
              updatedAt: new Date().toISOString() 
            } 
          : d
      )
    );
    toast.success('Déclaration mise à jour');
  };

  const deleteDeclaration = (id: string) => {
    setDeclarations(prev => prev.filter(d => d.id !== id));
    toast.success('Déclaration supprimée');
  };

  const updateStatus = (id: string, status: DeclarationStatus, reason?: string) => {
    if (!user) return;
    
    const updates: Partial<Declaration> = { 
      status, 
      updatedAt: new Date().toISOString() 
    };
    
    if (status === 'verified') {
      updates.verifiedBy = user.name;
    } else if (status === 'approved') {
      updates.approvedBy = user.name;
    } else if (status === 'validated') {
      updates.validatedBy = user.name;
    } else if (status === 'rejected') {
      updates.rejectedBy = user.name;
      updates.rejectionReason = reason;
    }
    
    updateDeclaration(id, updates);
    
    const statusMessages = {
      verified: 'vérifiée',
      approved: 'approuvée',
      validated: 'validée',
      rejected: 'rejetée',
      submitted: 'soumise'
    };
    
    toast.success(`Déclaration ${statusMessages[status]} avec succès`);
  };

  const getDeclarationById = (id: string) => {
    return declarations.find(d => d.id === id);
  };

  const getUserStats = (): Stats => {
    if (!user) {
      return { 
        totalHours: 0, 
        pendingDeclarations: 0, 
        approvedDeclarations: 0, 
        rejectedDeclarations: 0 
      };
    }
    
    // For enseignant, return personal stats
    if (user.role === 'enseignant') {
      const userDecs = declarations.filter(d => d.userId === user.id);
      const totalHours = userDecs.reduce((sum, dec) => {
        if (dec.status === 'validated') {
          return sum + dec.hours;
        }
        return sum;
      }, 0);
      
      return {
        totalHours,
        pendingDeclarations: userDecs.filter(d => ['submitted', 'verified', 'approved'].includes(d.status)).length,
        approvedDeclarations: userDecs.filter(d => d.status === 'validated').length,
        rejectedDeclarations: userDecs.filter(d => d.status === 'rejected').length
      };
    }
    
    // For scolarite, return global stats
    if (user.role === 'scolarite') {
      return {
        totalHours: declarations.reduce((sum, dec) => sum + dec.hours, 0),
        pendingDeclarations: declarations.filter(d => d.status === 'submitted').length,
        approvedDeclarations: declarations.filter(d => ['verified', 'approved', 'validated'].includes(d.status)).length,
        rejectedDeclarations: declarations.filter(d => d.status === 'rejected').length
      };
    }
    
    // For chef_departement, return department stats
    if (user.role === 'chef_departement' && user.department) {
      const deptDecs = declarations.filter(d => d.department === user.department);
      return {
        totalHours: deptDecs.reduce((sum, dec) => sum + dec.hours, 0),
        pendingDeclarations: deptDecs.filter(d => d.status === 'verified').length,
        approvedDeclarations: deptDecs.filter(d => ['approved', 'validated'].includes(d.status)).length,
        rejectedDeclarations: deptDecs.filter(d => d.status === 'rejected').length
      };
    }
    
    // For directrice, return all stats
    if (user.role === 'directrice') {
      return {
        totalHours: declarations.reduce((sum, dec) => sum + dec.hours, 0),
        pendingDeclarations: declarations.filter(d => d.status === 'approved').length,
        approvedDeclarations: declarations.filter(d => d.status === 'validated').length,
        rejectedDeclarations: declarations.filter(d => d.status === 'rejected').length
      };
    }
    
    return { 
      totalHours: 0, 
      pendingDeclarations: 0, 
      approvedDeclarations: 0, 
      rejectedDeclarations: 0 
    };
  };

  return (
    <DeclarationContext.Provider value={{
      declarations,
      departments: MOCK_DEPARTMENTS,
      courses: MOCK_COURSES,
      userDeclarations,
      pendingDeclarations,
      createDeclaration,
      updateDeclaration,
      deleteDeclaration,
      updateStatus,
      getDeclarationById,
      getUserStats
    }}>
      {children}
    </DeclarationContext.Provider>
  );
}

export function useDeclarations() {
  const context = useContext(DeclarationContext);
  if (context === undefined) {
    throw new Error('useDeclarations must be used within a DeclarationProvider');
  }
  return context;
}
