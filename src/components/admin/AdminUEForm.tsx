
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { getAllSemestres } from '@/integrations/supabase/client';

interface AdminUEFormProps {
  onClose: () => void;
  onSubmit: () => void;
  editUE?: any;
}

const AdminUEForm: React.FC<AdminUEFormProps> = ({ onClose, onSubmit, editUE }) => {
  const [nom, setNom] = useState('');
  const [semestreId, setSemestreId] = useState('');
  const [semestres, setSemestres] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSemestres = async () => {
      try {
        const semestres = await getAllSemestres();
        setSemestres(semestres || []);
      } catch (error) {
        console.error('Error fetching semestres:', error);
      }
    };

    fetchSemestres();

    if (editUE) {
      setNom(editUE.nom || '');
      setSemestreId(editUE.semestre_id?.toString() || '');
    }
  }, [editUE]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!semestreId) {
        throw new Error('Veuillez sélectionner un semestre');
      }

      if (editUE) {
        // Update UE
        const { error } = await supabase
          .from('ue')
          .update({ 
            nom,
            semestre_id: parseInt(semestreId)
          })
          .eq('id', editUE.id);

        if (error) throw error;
        toast.success('UE mise à jour avec succès');
      } else {
        // Create new UE
        const { error } = await supabase
          .from('ue')
          .insert({ 
            nom,
            semestre_id: parseInt(semestreId)
          });

        if (error) throw error;
        toast.success('UE créée avec succès');
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
          <DialogTitle>{editUE ? 'Modifier' : 'Ajouter'} une UE</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nom">Nom de l'UE</Label>
            <Input 
              id="nom" 
              value={nom} 
              onChange={(e) => setNom(e.target.value)} 
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="semestre">Semestre</Label>
            <Select value={semestreId} onValueChange={setSemestreId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un semestre" />
              </SelectTrigger>
              <SelectContent>
                {semestres.map((semestre) => (
                  <SelectItem key={semestre.id} value={semestre.id.toString()}>
                    {semestre.nom}
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
              {loading ? 'Traitement...' : editUE ? 'Mettre à jour' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminUEForm;
