
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { getAllFilieres } from '@/integrations/supabase/client';

interface AdminNiveauFormProps {
  onClose: () => void;
  onSubmit: () => void;
  editNiveau?: any;
}

const AdminNiveauForm: React.FC<AdminNiveauFormProps> = ({ onClose, onSubmit, editNiveau }) => {
  const [nom, setNom] = useState('');
  const [filiereId, setFiliereId] = useState('');
  const [filieres, setFilieres] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFilieres = async () => {
      try {
        const filieres = await getAllFilieres();
        setFilieres(filieres || []);
      } catch (error) {
        console.error('Error fetching filieres:', error);
      }
    };

    fetchFilieres();

    if (editNiveau) {
      setNom(editNiveau.nom || '');
      setFiliereId(editNiveau.filiere_id?.toString() || '');
    }
  }, [editNiveau]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editNiveau) {
        // Update niveau
        const { error } = await supabase
          .from('niveaux')
          .update({ 
            nom,
            filiere_id: filiereId ? parseInt(filiereId) : null
          })
          .eq('id', editNiveau.id);

        if (error) throw error;
        toast.success('Niveau mis à jour avec succès');
      } else {
        // Create new niveau
        const { error } = await supabase
          .from('niveaux')
          .insert({ 
            nom,
            filiere_id: filiereId ? parseInt(filiereId) : null
          });

        if (error) throw error;
        toast.success('Niveau créé avec succès');
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
          <DialogTitle>{editNiveau ? 'Modifier' : 'Ajouter'} un niveau</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nom">Nom du niveau</Label>
            <Input 
              id="nom" 
              value={nom} 
              onChange={(e) => setNom(e.target.value)} 
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="filiere">Filière (optionnelle)</Label>
            <Select value={filiereId} onValueChange={setFiliereId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une filière" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Aucune filière</SelectItem>
                {filieres.map((filiere) => (
                  <SelectItem key={filiere.id} value={filiere.id.toString()}>
                    {filiere.nom}
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
              {loading ? 'Traitement...' : editNiveau ? 'Mettre à jour' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminNiveauForm;
