
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';

interface AdminDepartmentFormProps {
  onClose: () => void;
  onSubmit: () => void;
  editDepartment?: any;
}

const AdminDepartmentForm: React.FC<AdminDepartmentFormProps> = ({ onClose, onSubmit, editDepartment }) => {
  const [nom, setNom] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editDepartment) {
      setNom(editDepartment.nom || '');
    }
  }, [editDepartment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editDepartment) {
        // Update department
        const { error } = await supabase
          .from('departements')
          .update({ nom })
          .eq('id', editDepartment.id);

        if (error) throw error;
        toast.success('Département mis à jour avec succès');
      } else {
        // Create new department
        const { error } = await supabase
          .from('departements')
          .insert({ nom });

        if (error) throw error;
        toast.success('Département créé avec succès');
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
          <DialogTitle>{editDepartment ? 'Modifier' : 'Ajouter'} un département</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nom">Nom du département</Label>
            <Input 
              id="nom" 
              value={nom} 
              onChange={(e) => setNom(e.target.value)} 
              required 
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose} type="button">
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Traitement...' : editDepartment ? 'Mettre à jour' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminDepartmentForm;
