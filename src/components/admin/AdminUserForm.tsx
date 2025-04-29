
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { UserRole, TeacherGrade } from '@/types';
import { getAllDepartments } from '@/integrations/supabase/client';

interface AdminUserFormProps {
  onClose: () => void;
  onSubmit: () => void;
  editUser?: any;
}

const AdminUserForm: React.FC<AdminUserFormProps> = ({ onClose, onSubmit, editUser }) => {
  const [email, setEmail] = useState('');
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [role, setRole] = useState<UserRole>('Enseignant');
  const [grade, setGrade] = useState<TeacherGrade | ''>('');
  const [departement, setDepartement] = useState('');
  const [password, setPassword] = useState('');
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const departments = await getAllDepartments();
        setDepartments(departments || []);
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };

    fetchDepartments();

    if (editUser) {
      setEmail(editUser.email || '');
      setPrenom(editUser.prenom || '');
      setNom(editUser.nom || '');
      setRole(editUser.role || 'Enseignant');
      setGrade(editUser.grade || '');
      setDepartement(editUser.departement_id?.toString() || '');
    }
  }, [editUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const metadata: Record<string, any> = {
        prenom,
        nom,
        role,
      };

      if (role === 'Enseignant' && grade) {
        metadata.grade = grade;
      }

      if (['Chef de département', 'Directrice des études'].includes(role) && departement) {
        metadata.departement_id = departement;
      }

      if (editUser) {
        // Update user profile
        const { error } = await supabase
          .from('profiles')
          .update({
            prenom,
            nom,
            role,
            grade: role === 'Enseignant' ? grade : null,
            departement_id: ['Chef de département', 'Directrice des études'].includes(role) ? 
              parseInt(departement) : null
          })
          .eq('id', editUser.id);

        if (error) throw error;
        toast.success('Utilisateur mis à jour avec succès');
      } else {
        // Create new user
        if (!password) {
          throw new Error('Le mot de passe est requis pour créer un utilisateur');
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: metadata
          }
        });

        if (error) throw error;
        toast.success('Utilisateur créé avec succès');
      }

      onSubmit();
    } catch (error: any) {
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editUser ? 'Modifier' : 'Ajouter'} un utilisateur</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prenom">Prénom</Label>
              <Input 
                id="prenom" 
                value={prenom} 
                onChange={(e) => setPrenom(e.target.value)} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nom">Nom</Label>
              <Input 
                id="nom" 
                value={nom} 
                onChange={(e) => setNom(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              disabled={!!editUser}
              required 
            />
          </div>

          {!editUser && (
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required={!editUser}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="role">Rôle</Label>
            <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Enseignant">Enseignant</SelectItem>
                <SelectItem value="Chef de département">Chef de département</SelectItem>
                <SelectItem value="Directrice des études">Directrice des études</SelectItem>
                <SelectItem value="Scolarité">Scolarité</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {role === 'Enseignant' && (
            <div className="space-y-2">
              <Label htmlFor="grade">Grade</Label>
              <Select value={grade} onValueChange={setGrade}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Professeur Titulaire des Universités">Professeur Titulaire des Universités</SelectItem>
                  <SelectItem value="Maitre de Conférences Assimilé">Maitre de Conférences Assimilé</SelectItem>
                  <SelectItem value="Maitre de Conférences Assimilé Stagiaire">Maitre de Conférences Assimilé Stagiaire</SelectItem>
                  <SelectItem value="Maitre de Conférences Titulaire">Maitre de Conférences Titulaire</SelectItem>
                  <SelectItem value="Maitre-assistant">Maitre-assistant</SelectItem>
                  <SelectItem value="Assistant de Deuxième Classe">Assistant de Deuxième Classe</SelectItem>
                  <SelectItem value="Assistant dispensant des Cours Magistraux">Assistant dispensant des Cours Magistraux</SelectItem>
                  <SelectItem value="Assistant ne dispensant pas de Cours Magistraux">Assistant ne dispensant pas de Cours Magistraux</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {['Chef de département', 'Directrice des études'].includes(role) && (
            <div className="space-y-2">
              <Label htmlFor="departement">Département</Label>
              <Select value={departement} onValueChange={setDepartement}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un département" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id.toString()}>
                      {dept.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={onClose} type="button">
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Traitement...' : editUser ? 'Mettre à jour' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminUserForm;
