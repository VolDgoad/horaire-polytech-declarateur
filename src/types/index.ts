
export type UserRole = 'enseignant' | 'scolarite' | 'chef_departement' | 'directrice';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
}

export type DeclarationStatus = 'draft' | 'submitted' | 'verified' | 'approved' | 'validated' | 'rejected';

export interface Declaration {
  id: string;
  userId: string;
  userName: string;
  department: string;
  course: string;
  date: string;
  hours: number;
  notes?: string; // Added notes field as optional
  status: DeclarationStatus;
  verifiedBy?: string;
  approvedBy?: string;
  validatedBy?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  name: string;
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
