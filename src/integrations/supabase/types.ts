export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      departements: {
        Row: {
          created_at: string
          id: number
          nom: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          nom: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          nom?: string
          updated_at?: string
        }
        Relationships: []
      }
      ec: {
        Row: {
          created_at: string
          id: number
          nom_ec: string
          ue_id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          nom_ec: string
          ue_id: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          nom_ec?: string
          ue_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ec_ue_id_fkey"
            columns: ["ue_id"]
            isOneToOne: false
            referencedRelation: "ue"
            referencedColumns: ["id"]
          },
        ]
      }
      fiches: {
        Row: {
          date: string
          date_approbation_finale: string | null
          date_creation: string
          date_modification: string
          date_rejet: string | null
          date_validation: string | null
          departement_id: number
          ec_id: number
          etat_paiement: string | null
          filiere_id: number | null
          hours_cm: number | null
          hours_td: number | null
          hours_tp: number | null
          id: string
          niveau_id: number | null
          nom_ec: string | null
          semestre_id: number | null
          signature: string | null
          statut: Database["public"]["Enums"]["declaration_status"]
          ue_id: number
          utilisateur_id: string
        }
        Insert: {
          date: string
          date_approbation_finale?: string | null
          date_creation?: string
          date_modification?: string
          date_rejet?: string | null
          date_validation?: string | null
          departement_id: number
          ec_id: number
          etat_paiement?: string | null
          filiere_id?: number | null
          hours_cm?: number | null
          hours_td?: number | null
          hours_tp?: number | null
          id?: string
          niveau_id?: number | null
          nom_ec?: string | null
          semestre_id?: number | null
          signature?: string | null
          statut?: Database["public"]["Enums"]["declaration_status"]
          ue_id: number
          utilisateur_id: string
        }
        Update: {
          date?: string
          date_approbation_finale?: string | null
          date_creation?: string
          date_modification?: string
          date_rejet?: string | null
          date_validation?: string | null
          departement_id?: number
          ec_id?: number
          etat_paiement?: string | null
          filiere_id?: number | null
          hours_cm?: number | null
          hours_td?: number | null
          hours_tp?: number | null
          id?: string
          niveau_id?: number | null
          nom_ec?: string | null
          semestre_id?: number | null
          signature?: string | null
          statut?: Database["public"]["Enums"]["declaration_status"]
          ue_id?: number
          utilisateur_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fiches_departement_id_fkey"
            columns: ["departement_id"]
            isOneToOne: false
            referencedRelation: "departements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fiches_ec_id_fkey"
            columns: ["ec_id"]
            isOneToOne: false
            referencedRelation: "ec"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fiches_filiere_id_fkey"
            columns: ["filiere_id"]
            isOneToOne: false
            referencedRelation: "filieres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fiches_niveau_id_fkey"
            columns: ["niveau_id"]
            isOneToOne: false
            referencedRelation: "niveaux"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fiches_semestre_id_fkey"
            columns: ["semestre_id"]
            isOneToOne: false
            referencedRelation: "semestres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fiches_ue_id_fkey"
            columns: ["ue_id"]
            isOneToOne: false
            referencedRelation: "ue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fiches_utilisateur_id_fkey"
            columns: ["utilisateur_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      filieres: {
        Row: {
          created_at: string
          departement_id: number
          id: number
          nom: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          departement_id: number
          id?: number
          nom: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          departement_id?: number
          id?: number
          nom?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "filieres_departement_id_fkey"
            columns: ["departement_id"]
            isOneToOne: false
            referencedRelation: "departements"
            referencedColumns: ["id"]
          },
        ]
      }
      niveaux: {
        Row: {
          created_at: string
          filiere_id: number | null
          id: number
          nom: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          filiere_id?: number | null
          id?: number
          nom: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          filiere_id?: number | null
          id?: number
          nom?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "niveaux_filiere_id_fkey"
            columns: ["filiere_id"]
            isOneToOne: false
            referencedRelation: "filieres"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          departement_id: number | null
          email: string
          grade: Database["public"]["Enums"]["teacher_grade"] | null
          id: string
          nom: string
          photo: string | null
          prenom: string
          reset_expiry: string | null
          reset_token: string | null
          role: Database["public"]["Enums"]["user_role"]
          signature: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          departement_id?: number | null
          email: string
          grade?: Database["public"]["Enums"]["teacher_grade"] | null
          id: string
          nom: string
          photo?: string | null
          prenom: string
          reset_expiry?: string | null
          reset_token?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          signature?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          departement_id?: number | null
          email?: string
          grade?: Database["public"]["Enums"]["teacher_grade"] | null
          id?: string
          nom?: string
          photo?: string | null
          prenom?: string
          reset_expiry?: string | null
          reset_token?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          signature?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_departement_id_fkey"
            columns: ["departement_id"]
            isOneToOne: false
            referencedRelation: "departements"
            referencedColumns: ["id"]
          },
        ]
      }
      semestres: {
        Row: {
          created_at: string
          id: number
          niveau_id: number
          nom: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          niveau_id: number
          nom: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          niveau_id?: number
          nom?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "semestres_niveau_id_fkey"
            columns: ["niveau_id"]
            isOneToOne: false
            referencedRelation: "niveaux"
            referencedColumns: ["id"]
          },
        ]
      }
      ue: {
        Row: {
          created_at: string
          id: number
          nom: string
          semestre_id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          nom: string
          semestre_id: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          nom?: string
          semestre_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ue_semestre_id_fkey"
            columns: ["semestre_id"]
            isOneToOne: false
            referencedRelation: "semestres"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      declaration_status:
        | "en_attente"
        | "verifiee"
        | "validee"
        | "refusee"
        | "approuvee"
      teacher_grade:
        | "Professeur Titulaire des Universités"
        | "Maitre de Conférences Assimilé"
        | "Maitre de Conférences Assimilé Stagiaire"
        | "Maitre de Conférences Titulaire"
        | "Maitre-assistant"
        | "Assistant de Deuxième Classe"
        | "Assistant dispensant des Cours Magistraux"
        | "Assistant ne dispensant pas de Cours Magistraux"
      user_role:
        | "Enseignant"
        | "Admin"
        | "Chef de département"
        | "Directrice des études"
        | "Scolarité"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      declaration_status: [
        "en_attente",
        "verifiee",
        "validee",
        "refusee",
        "approuvee",
      ],
      teacher_grade: [
        "Professeur Titulaire des Universités",
        "Maitre de Conférences Assimilé",
        "Maitre de Conférences Assimilé Stagiaire",
        "Maitre de Conférences Titulaire",
        "Maitre-assistant",
        "Assistant de Deuxième Classe",
        "Assistant dispensant des Cours Magistraux",
        "Assistant ne dispensant pas de Cours Magistraux",
      ],
      user_role: [
        "Enseignant",
        "Admin",
        "Chef de département",
        "Directrice des études",
        "Scolarité",
      ],
    },
  },
} as const
