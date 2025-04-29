
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { getAllDepartments } from '@/integrations/supabase/client';

interface AdminFiliereFormProps {
  onClose: () => void;
  onSubmit: () => void;
  editFiliere?: any;
}

const AdminFiliereForm: React.FC<AdminFiliereFormProps> = ({ onClose, onSubmit, editFiliere }) => {
  const [nom, setNom] = useState('');
  const [departementId, setDepartementId] = useState('');
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

    if (editFiliere) {
      setNom(editFiliere.nom || '');
      setDepartementId(editFiliere.departement_id?.toString() || '');
    }
  }, [editFiliere]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!departementId) {
        throw new Error('Veuillez sélectionner un département');
      }

      if (editFiliere) {
        // Update filiere
        const { error } = await supabase
          .from('filieres')
          .update({ 
            nom,
            departement_id: parseInt(departementId)
          })
          .eq('id', editFiliere.id);

        if (error) throw error;
        toast.success('Filière mise à jour avec succès');
      } else {
        // Create new filiere
        const { error } = await supabase
          .from('filieres')
          .insert({ 
            nom,
            departement_id: parseInt(departementId)
          });

        if (error) throw error;
        toast.success('Filière créée avec succès');
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
          <DialogTitle>{editFiliere ? 'Modifier' : 'Ajouter'} une filière</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nom">Nom de la filière</Label>
            <Input 
              id="nom" 
              value={nom} 
              onChange={(e) => setNom(e.target.value)} 
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="departement">Département</Label>
            <Select value={departementId} onValueChange={setDepartementId}>
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

          <DialogFooter>
            <Button variant="outline" onClick={onClose} type="button">
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Traitement...' : editFiliere ? 'Mettre à jour' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminFiliereForm;
