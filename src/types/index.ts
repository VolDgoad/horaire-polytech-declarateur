
// Our application's type definitions

// Map to Supabase user_role enum
export type UserRole = 'Enseignant' | 'Admin' | 'Chef de département' | 'Directrice des études' | 'Scolarité';

// Map to Supabase teacher_grade enum
export type TeacherGrade = 
  | 'Professeur Titulaire des Universités'
  | 'Maitre de Conférences Assimilé'
  | 'Maitre de Conférences Assimilé Stagiaire'
  | 'Maitre de Conférences Titulaire'
  | 'Maitre-assistant'
  | 'Assistant de Deuxième Classe'
  | 'Assistant dispensant des Cours Magistraux'
  | 'Assistant ne dispensant pas de Cours Magistraux';

// Map to Supabase declaration_status enum
export type DeclarationStatus = 'en_attente' | 'verifiee' | 'validee' | 'refusee' | 'approuvee';

export interface User {
  id: string;
  name: string; // This will combine prenom + nom
  email: string;
  role: UserRole;
  department?: string; // Will map to departement_id
  grade?: TeacherGrade;
}

export interface Department {
  id: string;
  name: string;
}

export interface Filiere {
  id: string;
  name: string;
  departmentId: string;
}

export interface Niveau {
  id: string;
  name: string;
  filiereId?: string;
}

export interface Semestre {
  id: string;
  name: string;
  niveauId: string;
}

export interface UE {
  id: string;
  name: string;
  semestreId: string;
}

export interface EC {
  id: string;
  name: string;
  ueId: string;
}

export interface Declaration {
  id: string;
  userId: string;
  userName: string;
  department: string;
  course: string;      // This will map to EC
  date: string;        // Date of the declaration
  hoursCM?: number;    // Cours magistraux
  hoursTD?: number;    // Travaux dirigés
  hoursTP?: number;    // Travaux pratiques
  hours: number;       // Total hours (sum of CM, TD, TP)
  notes?: string;      // Additional notes
  status: DeclarationStatus;
  verifiedBy?: string;
  approvedBy?: string;
  validatedBy?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  paymentStatus?: string; // Will map to etat_paiement
  createdAt: string;
  updatedAt: string;
  departmentId?: string;  // Reference to Department
  filiereId?: string;     // Reference to Filiere 
  niveauId?: string;      // Reference to Niveau
  semestreId?: string;    // Reference to Semestre
  ueId?: string;          // Reference to UE
  ecId?: string;          // Reference to EC
}

export interface Course {
  id: string;
  name: string;
  departmentId: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface Stats {
  totalHours: number;
  pendingDeclarations: number;
  approvedDeclarations: number;
  rejectedDeclarations: number;
}

// Helper mapping for UI purposes
export const statusDisplayMap = {
  'en_attente': 'En attente',
  'verifiee': 'Vérifiée',
  'validee': 'Validée',
  'refusee': 'Refusée',
  'approuvee': 'Approuvée'
};

// Helper internal status mapping for the application
export const legacyStatusMap = {
  'draft': 'en_attente',
  'submitted': 'en_attente', // Map submitted to en_attente
  'verified': 'verifiee',
  'approved': 'approuvee',
  'validated': 'validee',
  'rejected': 'refusee'
} as const;

// Helper for legacy role mapping
export const legacyRoleMap = {
  'enseignant': 'Enseignant',
  'admin': 'Admin',
  'chef_departement': 'Chef de département',
  'directrice': 'Directrice des études',
  'scolarite': 'Scolarité'
} as const;
