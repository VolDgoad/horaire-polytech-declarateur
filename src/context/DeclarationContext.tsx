import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Declaration, DeclarationStatus, Stats, Department, Course } from '@/types';
import { useAuth } from './AuthContext';
import { toast } from '@/components/ui/sonner';
import { 
  supabase, 
  getProfilesByIds, 
  getAllDepartments, 
  getAllECs, 
  getAllFiches,
  getAllUEs,
  getAllSemestres,
  getAllNiveaux,
  getAllFilieres 
} from '@/integrations/supabase/client';

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
      fetchECs();
    }
  }, [user]);

  const fetchDeclarations = async () => {
    try {
      // Fetch declarations using our safe function
      const rawDeclarations = await getAllFiches();
      if (!rawDeclarations || !Array.isArray(rawDeclarations) || rawDeclarations.length === 0) {
        setDeclarations([]);
        return;
      }
      
      // Then get profiles data separately using our security definer function
      const userIds = [...new Set(rawDeclarations.map(d => d.utilisateur_id))];
      const profiles = await getProfilesByIds(userIds);
      
      // Get departments data separately
      const deptsData = await getAllDepartments();
      
      // Get EC (courses) data separately
      const ecsData = await getAllECs();
      
      // Get additional relationship data
      const uesData = await getAllUEs();
      const semestresData = await getAllSemestres();
      const niveauxData = await getAllNiveaux();
      const filieresData = await getAllFilieres();
      
      // Create maps for efficient lookups
      const profilesMap = new Map(
        Array.isArray(profiles) 
          ? profiles.map(p => [p.id, { prenom: p.prenom, nom: p.nom }])
          : []
      );
      
      const deptsMap = new Map(
        deptsData.map(d => [d.id, d.nom])
      );
      
      const ecsMap = new Map(
        ecsData.map(e => [e.id, e.nom_ec])
      );
      
      const uesMap = new Map(
        uesData.map(ue => [ue.id, { nom: ue.nom, semestre_id: ue.semestre_id }])
      );
      
      const semestresMap = new Map(
        semestresData.map(s => [s.id, { nom: s.nom, niveau_id: s.niveau_id }])
      );
      
      const niveauxMap = new Map(
        niveauxData.map(n => [n.id, { nom: n.nom, filiere_id: n.filiere_id }])
      );
      
      const filieresMap = new Map(
        filieresData.map(f => [f.id, { nom: f.nom, departement_id: f.departement_id }])
      );
      
      const mappedDeclarations: Declaration[] = rawDeclarations.map(fiche => {
        const profile = profilesMap.get(fiche.utilisateur_id);
        const userName = profile ? `${profile.prenom} ${profile.nom}` : 'Utilisateur inconnu';
        const department = deptsMap.get(fiche.departement_id) || 'Département inconnu';
        const course = ecsMap.get(fiche.ec_id) || 'Cours inconnu';
        
        // Calculate total hours with fallbacks to 0
        const hoursCM = fiche.hours_cm ? Number(fiche.hours_cm) : 0;
        const hoursTD = fiche.hours_td ? Number(fiche.hours_td) : 0;
        const hoursTP = fiche.hours_tp ? Number(fiche.hours_tp) : 0;
        const totalHours = hoursCM + hoursTD + hoursTP;

        return {
          id: String(fiche.id),
          userId: String(fiche.utilisateur_id),
          userName: userName,
          department: String(department),
          course: String(course),
          date: String(fiche.date),
          hoursCM: hoursCM,
          hoursTD: hoursTD,
          hoursTP: hoursTP,
          hours: totalHours,
          status: fiche.statut as DeclarationStatus,
          verifiedBy: fiche.date_validation ? 'Vérifié' : undefined,
          approvedBy: fiche.date_approbation_finale ? 'Approuvé' : undefined,
          validatedBy: fiche.date_validation ? 'Validé' : undefined,
          rejectedBy: fiche.date_rejet ? 'Rejeté' : undefined,
          rejectionReason: fiche.etat_paiement ? String(fiche.etat_paiement) : undefined,
          createdAt: String(fiche.date_creation),
          updatedAt: String(fiche.date_modification)
        };
      });

      setDeclarations(mappedDeclarations);
    } catch (error) {
      console.error('Error fetching declarations:', error);
      toast.error('Erreur lors de la récupération des déclarations');
    }
  };

  const fetchDepartments = async () => {
    try {
      // Use our safe departments helper function
      const deptsData = await getAllDepartments();
      
      if (!Array.isArray(deptsData)) {
        console.error('Departments data is not an array:', deptsData);
        setDepartments([]);
        return;
      }
      
      const mappedDepartments: Department[] = deptsData.map(dept => ({
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
      // Use our safe ECs helper function
      const ecsData = await getAllECs();
      
      if (!Array.isArray(ecsData)) {
        console.error('ECs data is not an array:', ecsData);
        setCourses([]);
        return;
      }
      
      // We still need to fetch related data to map department IDs
      const { data: ueData, error: ueError } = await supabase
        .from('ue')
        .select('id, nom, semestre_id');
      
      if (ueError) {
        console.error('Error fetching UEs:', ueError);
        // Continue with partial data
      }
      
      // Create a map of UE ID to semestre_id
      const ueMap = new Map();
      (ueData || []).forEach(ue => {
        ueMap.set(ue.id, ue.semestre_id);
      });
      
      // Fetch semestres
      const semestreIds = [...new Set((ueData || []).map(ue => ue.semestre_id))];
      const { data: semestres, error: semestresError } = await supabase
        .from('semestres')
        .select('id, niveau_id');
      
      if (semestresError) {
        console.error('Error fetching semestres:', semestresError);
        // Continue with partial data
      }
      
      // Create map of semestre ID to niveau_id
      const semestreMap = new Map();
      (semestres || []).forEach(semestre => {
        semestreMap.set(semestre.id, semestre.niveau_id);
      });
      
      // Fetch niveaux
      const niveauIds = [...new Set((semestres || []).map(s => s.niveau_id))];
      const { data: niveaux, error: niveauxError } = await supabase
        .from('niveaux')
        .select('id, filiere_id');
      
      if (niveauxError) {
        console.error('Error fetching niveaux:', niveauxError);
        // Continue with partial data
      }
      
      // Create map of niveau ID to filiere_id
      const niveauMap = new Map();
      (niveaux || []).forEach(niveau => {
        niveauMap.set(niveau.id, niveau.filiere_id);
      });
      
      // Fetch filieres
      const filiereIds = [...new Set((niveaux || []).map(n => n.filiere_id))];
      const { data: filieres, error: filieresError } = await supabase
        .from('filieres')
        .select('id, departement_id');
      
      if (filieresError) {
        console.error('Error fetching filieres:', filieresError);
        // Continue with partial data
      }
      
      // Create map of filiere ID to departement_id
      const filiereMap = new Map();
      (filieres || []).forEach(filiere => {
        filiereMap.set(filiere.id, filiere.departement_id);
      });
      
      // Now map all the data together
      const mappedCourses: Course[] = ecsData.map(ec => {
        let departmentId = '';
        
        // Try to find the department ID by following the relationships
        const ueId = ec.ue_id;
        const semestreId = ueMap.get(ueId);
        const niveauId = semestreId ? semestreMap.get(semestreId) : null;
        const filiereId = niveauId ? niveauMap.get(niveauId) : null;
        const deptId = filiereId ? filiereMap.get(filiereId) : null;
        
        if (deptId) {
          departmentId = deptId.toString();
        }
        
        return {
          id: ec.id.toString(),
          name: ec.nom_ec,
          departmentId: departmentId
        };
      });

      setCourses(mappedCourses);
    } catch (error) {
      console.error('Error fetching ECs:', error);
      toast.error('Erreur lors de la récupération des cours');
    }
  };

  const userDeclarations = user ? declarations.filter(d => d.userId === user.id) : [];

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
