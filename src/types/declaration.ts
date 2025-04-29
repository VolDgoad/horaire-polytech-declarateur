
// Declaration types and workflow related types
import { DeclarationStatus, UserRole } from './index';
import type { Declaration } from './index';

export interface WorkflowRule {
  role: UserRole;
  canProcess: (declaration: Declaration) => boolean;
  nextStatus: DeclarationStatus;
  rejectStatus: DeclarationStatus;
  fromStatus: DeclarationStatus;
}

export const workflowRules: Record<string, WorkflowRule> = {
  verification: {
    role: 'Scolarité',
    canProcess: (declaration) => declaration.status === 'en_attente',
    nextStatus: 'verifiee',
    rejectStatus: 'refusee',
    fromStatus: 'en_attente'
  },
  validation: {
    role: 'Chef de département',
    canProcess: (declaration) => declaration.status === 'verifiee',
    nextStatus: 'approuvee',
    rejectStatus: 'refusee',
    fromStatus: 'verifiee'
  },
  approbation: {
    role: 'Directrice des études',
    canProcess: (declaration) => declaration.status === 'approuvee',
    nextStatus: 'validee',
    rejectStatus: 'refusee',
    fromStatus: 'approuvee'
  }
};

export const statusTranslations: Record<DeclarationStatus, string> = {
  'en_attente': 'En attente de vérification',
  'verifiee': 'Vérifiée, en attente de validation',
  'validee': 'Validée et approuvée',
  'refusee': 'Refusée',
  'approuvee': 'Approuvée, en attente de validation finale'
};

export interface EmailTemplate {
  subject: string;
  message: (params: Record<string, string>) => string;
}

export const emailTemplates: Record<string, EmailTemplate> = {
  declarationSubmitted: {
    subject: 'Déclaration d\'heures soumise',
    message: (params) => `Bonjour ${params.userName},

Votre déclaration d'heures pour le cours ${params.course} du ${params.date} a été soumise avec succès.

Elle est maintenant en attente de vérification par la scolarité.

Cordialement,
L'équipe de gestion des heures`
  },
  declarationVerified: {
    subject: 'Déclaration d\'heures vérifiée',
    message: (params) => `Bonjour ${params.userName},

Votre déclaration d'heures pour le cours ${params.course} du ${params.date} a été vérifiée par la scolarité.

Elle est maintenant en attente de validation par le chef du département ${params.department}.

Cordialement,
L'équipe de gestion des heures`
  },
  declarationRejectedByScolarite: {
    subject: 'Déclaration d\'heures refusée',
    message: (params) => `Bonjour ${params.userName},

Votre déclaration d'heures pour le cours ${params.course} du ${params.date} a été refusée par la scolarité.

Motif du refus: ${params.rejectionReason || "Non spécifié"}

Vous pouvez la modifier ou la supprimer dans votre espace personnel.

Cordialement,
L'équipe de gestion des heures`
  },
  declarationValidated: {
    subject: 'Déclaration d\'heures validée',
    message: (params) => `Bonjour ${params.userName},

Votre déclaration d'heures pour le cours ${params.course} du ${params.date} a été validée par le chef du département ${params.department}.

Elle est maintenant en attente d'approbation finale par la directrice des études.

Cordialement,
L'équipe de gestion des heures`
  },
  declarationRejectedByChef: {
    subject: 'Déclaration d\'heures refusée',
    message: (params) => `Bonjour ${params.userName},

Votre déclaration d'heures pour le cours ${params.course} du ${params.date} a été refusée par le chef du département ${params.department}.

Motif du refus: ${params.rejectionReason || "Non spécifié"}

Vous pouvez la modifier ou la supprimer dans votre espace personnel.

Cordialement,
L'équipe de gestion des heures`
  },
  declarationApproved: {
    subject: 'Déclaration d\'heures approuvée',
    message: (params) => `Bonjour ${params.userName},

Votre déclaration d'heures pour le cours ${params.course} du ${params.date} a été approuvée par la directrice des études.

Le paiement sera traité selon les procédures en vigueur.

Cordialement,
L'équipe de gestion des heures`
  },
  declarationRejectedByDirectrice: {
    subject: 'Déclaration d\'heures refusée',
    message: (params) => `Bonjour ${params.userName},

Votre déclaration d'heures pour le cours ${params.course} du ${params.date} a été refusée par la directrice des études.

Motif du refus: ${params.rejectionReason || "Non spécifié"}

Vous pouvez la modifier ou la supprimer dans votre espace personnel.

Cordialement,
L'équipe de gestion des heures`
  },
  pendingVerification: {
    subject: 'Nouvelle déclaration à vérifier',
    message: (params) => `Bonjour,

Une nouvelle déclaration d'heures a été soumise par ${params.userName} pour le cours ${params.course} du ${params.date}.

Elle est en attente de vérification par la scolarité.

Cordialement,
L'équipe de gestion des heures`
  },
  pendingValidation: {
    subject: 'Déclaration à valider',
    message: (params) => `Bonjour,

Une déclaration d'heures a été vérifiée et est maintenant en attente de votre validation.

Enseignant: ${params.userName}
Cours: ${params.course}
Date: ${params.date}

Cordialement,
L'équipe de gestion des heures`
  },
  pendingApproval: {
    subject: 'Déclaration à approuver',
    message: (params) => `Bonjour,

Une déclaration d'heures a été validée et est maintenant en attente de votre approbation finale.

Enseignant: ${params.userName}
Cours: ${params.course}
Date: ${params.date}

Cordialement,
L'équipe de gestion des heures`
  }
};
