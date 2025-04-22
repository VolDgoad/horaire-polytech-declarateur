import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Declaration, DeclarationStatus, Stats, Department, Course } from '@/types';
import { useAuth } from './AuthContext';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';

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

const DeclarationContext = createContext<DeclarationContextType | undefined>(undefined);

export function DeclarationProvider({ children }: { children: ReactNode }) {
  const [declarations, setDeclarations] = useState<Declaration[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchDeclarations();
      fetchDepartments();
      fetchECs(); // courses are called "EC" in the database
    }
  }, [user]);

  const fetchDeclarations = async () => {
    try {
      const { data, error } = await supabase
        .from('fiches')
        .select(`
          *,
          profiles:utilisateur_id (prenom, nom),
          ec:ec_id (nom_ec, ue_id),
          departements:departement_id (nom)
        `);

      if (error) throw error;

      const mappedDeclarations: Declaration[] = data.map(fiche => ({
        id: fiche.id,
        userId: fiche.utilisateur_id,
        userName: `${fiche.profiles.prenom} ${fiche.profiles.nom}`,
        department: fiche.departements.nom,
        course: fiche.ec.nom_ec,
        date: fiche.date,
        hoursCM: fiche.hours_cm,
        hoursTD: fiche.hours_td,
        hoursTP: fiche.hours_tp,
        hours: (fiche.hours_cm || 0) + (fiche.hours_td || 0) + (fiche.hours_tp || 0),
        status: fiche.statut,
        verifiedBy: fiche.date_validation ? 'Vérifié' : undefined,
        approvedBy: fiche.date_approbation_finale ? 'Approuvé' : undefined,
        validatedBy: fiche.date_validation ? 'Validé' : undefined,
        rejectedBy: fiche.date_rejet ? 'Rejeté' : undefined,
        rejectionReason: fiche.etat_paiement,
        createdAt: fiche.date_creation,
        updatedAt: fiche.date_modification
      }));

      setDeclarations(mappedDeclarations);
    } catch (error) {
      console.error('Error fetching declarations:', error);
      toast.error('Erreur lors de la récupération des déclarations');
    }
  };

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departements')
        .select('*');

      if (error) throw error;

      const mappedDepartments: Department[] = data.map(dept => ({
        id: dept.id.toString(),
        name: dept.nom
      }));

      setDepartments(mappedDepartments);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Erreur lors de la récupération des départements');
    }
  };

  const fetchECs = async () => {
    try {
      const { data, error } = await supabase
        .from('ec')
        .select(`
          *,
          ue:ue_id (
            nom,
            semestre:semestre_id (
              niveau:niveau_id (
                filiere:filiere_id (
                  departement:departement_id (*)
                )
              )
            )
          )
        `);

      if (error) throw error;

      const mappedCourses: Course[] = data.map(ec => ({
        id: ec.id.toString(),
        name: ec.nom_ec,
        departmentId: ec.ue.semestre.niveau.filiere.departement.id.toString()
      }));

      setCourses(mappedCourses);
    } catch (error) {
      console.error('Error fetching ECs:', error);
      toast.error('Erreur lors de la récupération des cours');
    }
  };

  const userDeclarations = declarations.filter(d => d.userId === user?.id);

  const pendingDeclarations = user 
    ? declarations.filter(d => {
        if (user.role === 'Scolarité') {
          return d.status === 'en_attente';
        } else if (user.role === 'Chef de département' && user.department) {
          return d.status === 'verifiee' && d.department === user.department;
        } else if (user.role === 'Directrice des études') {
          return d.status === 'approuvee';
        }
        return false;
      })
    : [];

  const createDeclaration = async (newDeclaration: Omit<Declaration, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'userName' | 'status'>) => {
    if (!user) return;
    
    try {
      const courseObj = courses.find(c => c.name === newDeclaration.course);
      if (!courseObj) {
        toast.error('Cours non trouvé');
        return;
      }
      
      const { data: ecData, error: ecError } = await supabase
        .from('ec')
        .select('ue_id')
        .eq('id', parseInt(courseObj.id))
        .single();
        
      if (ecError) throw ecError;
      
      if (!ecData || !ecData.ue_id) {
        toast.error('Données du cours incomplètes');
        return;
      }

      const { error } = await supabase
        .from('fiches')
        .insert({
          utilisateur_id: user.id,
          departement_id: parseInt(departments.find(d => d.name === newDeclaration.department)?.id || '1'),
          ec_id: parseInt(courseObj.id),
          ue_id: ecData.ue_id,
          date: newDeclaration.date,
          hours_cm: newDeclaration.hoursCM,
          hours_td: newDeclaration.hoursTD,
          hours_tp: newDeclaration.hoursTP,
          statut: 'en_attente'
        });

      if (error) throw error;
      
      fetchDeclarations(); // Refresh declarations list
      toast.success('Déclaration créée avec succès');
    } catch (error) {
      console.error('Error creating declaration:', error);
      toast.error('Erreur lors de la création de la déclaration');
    }
  };

  const updateDeclaration = async (id: string, updates: Partial<Declaration>) => {
    try {
      const { error } = await supabase
        .from('fiches')
        .update({
          date: updates.date,
          hours_cm: updates.hoursCM,
          hours_td: updates.hoursTD,
          hours_tp: updates.hoursTP,
          date_modification: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      
      fetchDeclarations(); // Refresh declarations list
      toast.success('Déclaration mise à jour');
    } catch (error) {
      console.error('Error updating declaration:', error);
      toast.error('Erreur lors de la mise à jour de la déclaration');
    }
  };

  const updateStatus = async (id: string, status: DeclarationStatus, reason?: string) => {
    if (!user) return;
    
    try {
      const updates: any = {
        statut: status,
        date_modification: new Date().toISOString()
      };

      if (status === 'verifiee') {
        updates.date_validation = new Date().toISOString();
      } else if (status === 'approuvee') {
        updates.date_approbation_finale = new Date().toISOString();
      } else if (status === 'validee') {
        updates.date_validation = new Date().toISOString();
      } else if (status === 'refusee') {
        updates.date_rejet = new Date().toISOString();
        updates.etat_paiement = reason;
      }

      const { error } = await supabase
        .from('fiches')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      fetchDeclarations(); // Refresh declarations list
      
      const statusMessages = {
        verifiee: 'vérifiée',
        approuvee: 'approuvée',
        validee: 'validée',
        refusee: 'rejetée',
        en_attente: 'soumise'
      };
      
      toast.success(`Déclaration ${statusMessages[status]} avec succès`);
    } catch (error) {
      console.error('Error updating declaration status:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  const deleteDeclaration = async (id: string) => {
    try {
      const { error } = await supabase
        .from('fiches')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      fetchDeclarations(); // Refresh declarations list
      toast.success('Déclaration supprimée');
    } catch (error) {
      console.error('Error deleting declaration:', error);
      toast.error('Erreur lors de la suppression de la déclaration');
    }
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
    
    if (user.role === 'Enseignant') {
      const userDecs = declarations.filter(d => d.userId === user.id);
      const totalHours = userDecs.reduce((sum, dec) => {
        if (dec.status === 'validee') {
          return sum + dec.hours;
        }
        return sum;
      }, 0);
      
      return {
        totalHours,
        pendingDeclarations: userDecs.filter(d => ['en_attente', 'verifiee', 'approuvee'].includes(d.status)).length,
        approvedDeclarations: userDecs.filter(d => d.status === 'validee').length,
        rejectedDeclarations: userDecs.filter(d => d.status === 'refusee').length
      };
    }
    
    if (user.role === 'Scolarité') {
      return {
        totalHours: declarations.reduce((sum, dec) => sum + dec.hours, 0),
        pendingDeclarations: declarations.filter(d => d.status === 'en_attente').length,
        approvedDeclarations: declarations.filter(d => ['verifiee', 'approuvee', 'validee'].includes(d.status)).length,
        rejectedDeclarations: declarations.filter(d => d.status === 'refusee').length
      };
    }
    
    if (user.role === 'Chef de département' && user.department) {
      const deptDecs = declarations.filter(d => d.department === user.department);
      return {
        totalHours: deptDecs.reduce((sum, dec) => sum + dec.hours, 0),
        pendingDeclarations: deptDecs.filter(d => d.status === 'verifiee').length,
        approvedDeclarations: deptDecs.filter(d => ['approuvee', 'validee'].includes(d.status)).length,
        rejectedDeclarations: deptDecs.filter(d => d.status === 'refusee').length
      };
    }
    
    if (user.role === 'Directrice des études') {
      return {
        totalHours: declarations.reduce((sum, dec) => sum + dec.hours, 0),
        pendingDeclarations: declarations.filter(d => d.status === 'approuvee').length,
        approvedDeclarations: declarations.filter(d => d.status === 'validee').length,
        rejectedDeclarations: declarations.filter(d => d.status === 'refusee').length
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
      departments,
      courses,
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
