import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Declaration, DeclarationStatus, Stats, Department, Course, Filiere, Niveau, Semestre, UE, EC, User } from '@/types';
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
import { sendDeclarationNotification } from '@/services/notificationService';
import { workflowRules } from '@/types/declaration';

interface DeclarationContextType {
  declarations: Declaration[];
  departments: Department[];
  courses: Course[];
  filieres: Filiere[];
  niveaux: Niveau[];
  semestres: Semestre[];
  ues: UE[];
  ecs: EC[];
  userDeclarations: Declaration[];
  pendingDeclarations: Declaration[];
  createDeclaration: (declaration: Omit<Declaration, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'userName' | 'status'>) => Promise<string | undefined>;
  updateDeclaration: (id: string, updates: Partial<Declaration>) => Promise<boolean>;
  deleteDeclaration: (id: string) => Promise<boolean>;
  updateStatus: (id: string, status: DeclarationStatus, reason?: string) => Promise<boolean>;
  getDeclarationById: (id: string) => Declaration | undefined;
  getUserStats: () => Stats;
  canUserProcessDeclaration: (declaration: Declaration) => boolean;
  getNextStatus: (declaration: Declaration) => DeclarationStatus | undefined;
  getRejectStatus: (declaration: Declaration) => DeclarationStatus | undefined;
  refreshDeclarations: () => Promise<void>;
  isDeclarationAutoProcessed: (declaration: Declaration, userDept?: string) => boolean;
}

const DeclarationContext = createContext<DeclarationContextType | undefined>(undefined);

export function DeclarationProvider({ children }: { children: ReactNode }) {
  const [declarations, setDeclarations] = useState<Declaration[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filieres, setFilieres] = useState<Filiere[]>([]);
  const [niveaux, setNiveaux] = useState<Niveau[]>([]);
  const [semestres, setSemestres] = useState<Semestre[]>([]);
  const [ues, setUEs] = useState<UE[]>([]);
  const [ecs, setECs] = useState<EC[]>([]);
  
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchDeclarations();
      fetchDepartments();
      fetchFilieres();
      fetchNiveaux();
      fetchSemestres();
      fetchUEs();
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
          ? profiles.map(p => [p.id, { prenom: p.prenom, nom: p.nom, email: p.email }])
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
          userName: String(userName),
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
          updatedAt: String(fiche.date_modification),
          departmentId: String(fiche.departement_id),
          filiereId: fiche.filiere_id ? String(fiche.filiere_id) : undefined,
          niveauId: fiche.niveau_id ? String(fiche.niveau_id) : undefined,
          semestreId: fiche.semestre_id ? String(fiche.semestre_id) : undefined,
          ueId: String(fiche.ue_id),
          ecId: String(fiche.ec_id)
        };
      });

      setDeclarations(mappedDeclarations);
    } catch (error) {
      console.error('Error fetching declarations:', error);
      toast.error('Erreur lors de la récupération des déclarations');
    }
  };
  
  // Function to refresh declarations
  const refreshDeclarations = async (): Promise<void> => {
    await fetchDeclarations();
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

  const fetchFilieres = async () => {
    try {
      const filieresData = await getAllFilieres();
      
      if (!Array.isArray(filieresData)) {
        console.error('Filieres data is not an array:', filieresData);
        setFilieres([]);
        return;
      }
      
      const mappedFilieres: Filiere[] = filieresData.map(filiere => ({
        id: filiere.id.toString(),
        name: filiere.nom,
        departmentId: filiere.departement_id.toString()
      }));

      setFilieres(mappedFilieres);
    } catch (error) {
      console.error('Error fetching filieres:', error);
      toast.error('Erreur lors de la récupération des filières');
    }
  };

  const fetchNiveaux = async () => {
    try {
      const niveauxData = await getAllNiveaux();
      
      if (!Array.isArray(niveauxData)) {
        console.error('Niveaux data is not an array:', niveauxData);
        setNiveaux([]);
        return;
      }
      
      const mappedNiveaux: Niveau[] = niveauxData.map(niveau => ({
        id: niveau.id.toString(),
        name: niveau.nom,
        filiereId: niveau.filiere_id ? niveau.filiere_id.toString() : undefined
      }));

      setNiveaux(mappedNiveaux);
    } catch (error) {
      console.error('Error fetching niveaux:', error);
      toast.error('Erreur lors de la récupération des niveaux');
    }
  };

  const fetchSemestres = async () => {
    try {
      const semestresData = await getAllSemestres();
      
      if (!Array.isArray(semestresData)) {
        console.error('Semestres data is not an array:', semestresData);
        setSemestres([]);
        return;
      }
      
      const mappedSemestres: Semestre[] = semestresData.map(semestre => ({
        id: semestre.id.toString(),
        name: semestre.nom,
        niveauId: semestre.niveau_id.toString()
      }));

      setSemestres(mappedSemestres);
    } catch (error) {
      console.error('Error fetching semestres:', error);
      toast.error('Erreur lors de la récupération des semestres');
    }
  };

  const fetchUEs = async () => {
    try {
      const uesData = await getAllUEs();
      
      if (!Array.isArray(uesData)) {
        console.error('UEs data is not an array:', uesData);
        setUEs([]);
        return;
      }
      
      const mappedUEs: UE[] = uesData.map(ue => ({
        id: ue.id.toString(),
        name: ue.nom,
        semestreId: ue.semestre_id.toString()
      }));

      setUEs(mappedUEs);
    } catch (error) {
      console.error('Error fetching UEs:', error);
      toast.error('Erreur lors de la récupération des UEs');
    }
  };

  const fetchECs = async () => {
    try {
      const ecsData = await getAllECs();
      
      if (!Array.isArray(ecsData)) {
        console.error('ECs data is not an array:', ecsData);
        setECs([]);
        return;
      }
      
      const mappedECs: EC[] = ecsData.map(ec => ({
        id: ec.id.toString(),
        name: ec.nom_ec,
        ueId: ec.ue_id.toString()
      }));

      setECs(mappedECs);
    } catch (error) {
      console.error('Error fetching ECs:', error);
      toast.error('Erreur lors de la récupération des ECs');
    }
  };

  const userDeclarations = user ? declarations.filter(d => d.userId === user.id) : [];

  // Determine if a user can process a declaration based on their role and the declaration status
  const canUserProcessDeclaration = (declaration: Declaration): boolean => {
    if (!user) return false;

    // Admin can process any declaration
    if (user.role === 'Admin') return true;

    // Directrice des études can process approved declarations
    if (user.role === 'Directrice des études' && declaration.status === 'approuvee') return true;
    
    // Scolarité can process pending declarations
    if (user.role === 'Scolarité' && declaration.status === 'en_attente') return true;
    
    // Chef de département can process verified declarations in their department
    if (
      user.role === 'Chef de département' && 
      declaration.status === 'verifiee' && 
      user.department === declaration.department
    ) return true;

    // Declaration authors can only edit or delete pending or rejected declarations
    if (
      declaration.userId === user.id && 
      ['en_attente', 'refusee'].includes(declaration.status)
    ) return true;

    return false;
  };

  // Get the next status in the workflow based on the current status and user role
  const getNextStatus = (declaration: Declaration): DeclarationStatus | undefined => {
    if (!user) return undefined;

    const userRole = user.role;
    
    for (const ruleName in workflowRules) {
      const rule = workflowRules[ruleName];
      if (rule.role === userRole && rule.canProcess(declaration)) {
        return rule.nextStatus;
      }
    }

    return undefined;
  };

  // Get the rejection status based on the current status and user role
  const getRejectStatus = (declaration: Declaration): DeclarationStatus | undefined => {
    if (!user) return undefined;

    const userRole = user.role;
    
    for (const ruleName in workflowRules) {
      const rule = workflowRules[ruleName];
      if (rule.role === userRole && rule.canProcess(declaration)) {
        return rule.rejectStatus;
      }
    }

    return undefined;
  };

  // Check if a declaration should be auto-processed based on the rules
  const isDeclarationAutoProcessed = (declaration: Declaration, userDept?: string): boolean => {
    // If declaration is submitted by a department head for their own department
    return (
      declaration.status === 'en_attente' && 
      declaration.department === userDept
    );
  };

  // Get declarations pending user action based on role
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

  // Create a new declaration
  const createDeclaration = async (
    newDeclaration: Omit<Declaration, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'userName' | 'status'>
  ): Promise<string | undefined> => {
    if (!user) return undefined;
    
    try {
      // Determine if auto-processing applies (if user is department head and declaration is for their department)
      const isAutoDepartmentHead = user.role === 'Chef de département' && 
                                 user.department === newDeclaration.department;
      
      // Set initial status
      const initialStatus: DeclarationStatus = isAutoDepartmentHead ? 'verifiee' : 'en_attente';
      
      const { data, error } = await supabase
        .from('fiches')
        .insert({
          utilisateur_id: user.id,
          departement_id: parseInt(newDeclaration.departmentId || '0'),
          filiere_id: newDeclaration.filiereId ? parseInt(newDeclaration.filiereId) : null,
          niveau_id: newDeclaration.niveauId ? parseInt(newDeclaration.niveauId) : null,
          semestre_id: newDeclaration.semestreId ? parseInt(newDeclaration.semestreId) : null,
          ue_id: parseInt(newDeclaration.ueId || '0'),
          ec_id: parseInt(newDeclaration.ecId || '0'),
          date: newDeclaration.date,
          hours_cm: newDeclaration.hoursCM,
          hours_td: newDeclaration.hoursTD,
          hours_tp: newDeclaration.hoursTP,
          statut: initialStatus,
          // If auto-processed, set verification date
          date_validation: isAutoDepartmentHead ? new Date().toISOString() : null
        })
        .select();

      if (error) throw error;
      
      if (!data || data.length === 0) {
        throw new Error('No data returned after insert');
      }
      
      const newDeclarationData = data[0];
      
      // Fetch the department name for the notification
      const departmentName = departments.find(d => d.id === newDeclaration.departmentId)?.name || '';
      const ecName = ecs.find(e => e.id === newDeclaration.ecId)?.name || '';
      
      // Get profiles to fetch admin emails
      const admins = await supabase
        .from('profiles')
        .select('email')
        .eq('role', 'Scolarité');
      
      // Send confirmation to the user
      await sendDeclarationNotification(
        'declarationSubmitted',
        {
          ...newDeclaration,
          id: newDeclarationData.id,
          userId: user.id,
          userName: user.name,
          status: initialStatus,
          department: departmentName,
          course: ecName,
          createdAt: newDeclarationData.date_creation,
          updatedAt: newDeclarationData.date_modification
        },
        user.email,
        {},
        undefined,
        'success'
      );
      
      // If auto-processed as department head, also notify the directrice
      if (isAutoDepartmentHead) {
        const directrice = await supabase
          .from('profiles')
          .select('email')
          .eq('role', 'Directrice des études');
          
        if (directrice.data && directrice.data.length > 0) {
          await sendDeclarationNotification(
            'pendingApproval',
            {
              ...newDeclaration,
              id: newDeclarationData.id,
              userId: user.id,
              userName: user.name,
              status: initialStatus,
              department: departmentName,
              course: ecName,
              createdAt: newDeclarationData.date_creation,
              updatedAt: newDeclarationData.date_modification
            },
            directrice.data[0].email,
            {},
            undefined,
            'info'
          );
        }
      } else {
        // Notify scolarité about a new declaration that needs verification
        if (admins.data && admins.data.length > 0) {
          for (const admin of admins.data) {
            await sendDeclarationNotification(
              'pendingVerification',
              {
                ...newDeclaration,
                id: newDeclarationData.id,
                userId: user.id,
                userName: user.name,
                status: initialStatus,
                department: departmentName,
                course: ecName,
                createdAt: newDeclarationData.date_creation,
                updatedAt: newDeclarationData.date_modification
              },
              admin.email,
              {},
              undefined,
              'info'
            );
          }
        }
      }
      
      await fetchDeclarations(); // Refresh declarations list
      toast.success('Déclaration créée avec succès');
      
      return newDeclarationData.id;
    } catch (error) {
      console.error('Error creating declaration:', error);
      toast.error('Erreur lors de la création de la déclaration');
      return undefined;
    }
  };

  // Update an existing declaration
  const updateDeclaration = async (id: string, updates: Partial<Declaration>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('fiches')
        .update({
          date: updates.date,
          hours_cm: updates.hoursCM,
          hours_td: updates.hoursTD,
          hours_tp: updates.hoursTP,
          filiere_id: updates.filiereId ? parseInt(updates.filiereId) : null,
          niveau_id: updates.niveauId ? parseInt(updates.niveauId) : null,
          semestre_id: updates.semestreId ? parseInt(updates.semestreId) : null,
          ue_id: updates.ueId ? parseInt(updates.ueId) : null,
          ec_id: updates.ecId ? parseInt(updates.ecId) : null,
          date_modification: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      
      await fetchDeclarations(); // Refresh declarations list
      toast.success('Déclaration mise à jour');
      return true;
    } catch (error) {
      console.error('Error updating declaration:', error);
      toast.error('Erreur lors de la mise à jour de la déclaration');
      return false;
    }
  };

  // Update the status of a declaration
  const updateStatus = async (id: string, status: DeclarationStatus, reason?: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Get the current declaration
      const declaration = declarations.find(d => d.id === id);
      if (!declaration) {
        toast.error('Déclaration introuvable');
        return false;
      }
      
      // Prepare the updates
      const updates: any = {
        statut: status,
        date_modification: new Date().toISOString()
      };

      // Set appropriate date fields and rejection reason based on status
      if (status === 'verifiee') {
        updates.date_validation = new Date().toISOString();
      } else if (status === 'approuvee') {
        updates.date_approbation_finale = new Date().toISOString();
      } else if (status === 'validee') {
        updates.date_validation = new Date().toISOString();
      } else if (status === 'refusee') {
        updates.date_rejet = new Date().toISOString();
        updates.etat_paiement = reason || 'Refusé sans motif spécifié';
      }

      // Update the database
      const { error } = await supabase
        .from('fiches')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      // Fetch the updated declaration to get fresh data
      await fetchDeclarations();
      
      // Get the declaration author's email
      const authorProfile = await supabase
        .from('profiles')
        .select('email')
        .eq('id', declaration.userId)
        .single();
      
      const authorEmail = authorProfile.data?.email;
      
      if (!authorEmail) {
        console.error('Could not find author email');
        return false;
      }
      
      // Send email notifications based on status change
      if (status === 'verifiee') {
        // Notify author
        await sendDeclarationNotification(
          'declarationVerified',
          declaration,
          authorEmail,
          { rejectionReason: reason || '' },
          undefined,
          'success'
        );
        
        // Notify department head
        const departmentHeads = await supabase
          .from('profiles')
          .select('email')
          .eq('role', 'Chef de département')
          .eq('departement_id', parseInt(declaration.departmentId || '0'));
        
        if (departmentHeads.data && departmentHeads.data.length > 0) {
          for (const head of departmentHeads.data) {
            await sendDeclarationNotification(
              'pendingValidation',
              declaration,
              head.email,
              {},
              undefined,
              'info'
            );
          }
        }
      } else if (status === 'approuvee') {
        // Notify author
        await sendDeclarationNotification(
          'declarationValidated',
          declaration,
          authorEmail,
          { rejectionReason: reason || '' },
          undefined,
          'success'
        );
        
        // Notify directrice
        const directrice = await supabase
          .from('profiles')
          .select('email')
          .eq('role', 'Directrice des études');
          
        if (directrice.data && directrice.data.length > 0) {
          await sendDeclarationNotification(
            'pendingApproval',
            declaration,
            directrice.data[0].email,
            {},
            undefined,
            'info'
          );
        }
      } else if (status === 'validee') {
        // Notify author
        await sendDeclarationNotification(
          'declarationApproved',
          declaration,
          authorEmail,
          { rejectionReason: reason || '' },
          undefined,
          'success'
        );
        
        // Notify department head
        const departmentHeads = await supabase
          .from('profiles')
          .select('email')
          .eq('role', 'Chef de département')
          .eq('departement_id', parseInt(declaration.departmentId || '0'));
        
        if (departmentHeads.data && departmentHeads.data.length > 0) {
          for (const head of departmentHeads.data) {
            await sendDeclarationNotification(
              'declarationApproved',
              declaration,
              head.email,
              {},
              undefined,
              'success'
            );
          }
        }
      } else if (status === 'refusee') {
        // Determine who rejected it based on the user role
        let templateKey = 'declarationRejectedByScolarite';
        
        if (user.role === 'Chef de département') {
          templateKey = 'declarationRejectedByChef';
        } else if (user.role === 'Directrice des études') {
          templateKey = 'declarationRejectedByDirectrice';
        }
        
        // Notify author
        await sendDeclarationNotification(
          templateKey as keyof typeof emailTemplates,
          declaration,
          authorEmail,
          { rejectionReason: reason || 'Non spécifié' },
          undefined,
          'error'
        );
      }
      
      const statusMessages = {
        verifiee: 'vérifiée',
        approuvee: 'approuvée',
        validee: 'validée',
        refusee: 'rejetée',
        en_attente: 'soumise'
      };
      
      toast.success(`Déclaration ${statusMessages[status]} avec succès`);
      return true;
    } catch (error) {
      console.error('Error updating declaration status:', error);
      toast.error('Erreur lors de la mise à jour du statut');
      return false;
    }
  };

  // Delete a declaration
  const deleteDeclaration = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('fiches')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchDeclarations(); // Refresh declarations list
      toast.success('Déclaration supprimée');
      return true;
    } catch (error) {
      console.error('Error deleting declaration:', error);
      toast.error('Erreur lors de la suppression de la déclaration');
      return false;
    }
  };

  // Get a declaration by ID
  const getDeclarationById = (id: string) => {
    return declarations.find(d => d.id === id);
  };

  // Calculate user statistics
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
      filieres,
      niveaux,
      semestres,
      ues,
      ecs,
      userDeclarations,
      pendingDeclarations,
      createDeclaration,
      updateDeclaration,
      deleteDeclaration,
      updateStatus,
      getDeclarationById,
      getUserStats,
      canUserProcessDeclaration,
      getNextStatus,
      getRejectStatus,
      refreshDeclarations,
      isDeclarationAutoProcessed
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
