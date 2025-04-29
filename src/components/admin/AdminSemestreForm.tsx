
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { getAllNiveaux } from '@/integrations/supabase/client';

interface AdminSemestreFormProps {
  onClose: () => void;
  onSubmit: () => void;
  editSemestre?: any;
}

const AdminSemestreForm: React.FC<AdminSemestreFormProps> = ({ onClose, onSubmit, editSemestre }) => {
  const [nom, setNom] = useState('');
  const [niveauId, setNiveauId] = useState('');
  const [niveaux, setNiveaux] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchNiveaux = async () => {
      try {
        const niveaux = await getAllNiveaux();
        setNiveaux(niveaux || []);
      } catch (error) {
        console.error('Error fetching niveaux:', error);
      }
    };

    fetchNiveaux();

    if (editSemestre) {
      setNom(editSemestre.nom || '');
      setNiveauId(editSemestre.niveau_id?.toString() || '');
    }
  }, [editSemestre]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!niveauId) {
        throw new Error('Veuillez sélectionner un niveau');
      }

      if (editSemestre) {
        // Update semestre
        const { error } = await supabase
          .from('semestres')
          .update({ 
            nom,
            niveau_id: parseInt(niveauId)
          })
          .eq('id', editSemestre.id);

        if (error) throw error;
        toast.success('Semestre mis à jour avec succès');
      } else {
        // Create new semestre
        const { error } = await supabase
          .from('semestres')
          .insert({ 
            nom,
            niveau_id: parseInt(niveauId)
          });

        if (error) throw error;
        toast.success('Semestre créé avec succès');
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
          <DialogTitle>{editSemestre ? 'Modifier' : 'Ajouter'} un semestre</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nom">Nom du semestre</Label>
            <Input 
              id="nom" 
              value={nom} 
              onChange={(e) => setNom(e.target.value)} 
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="niveau">Niveau</Label>
            <Select value={niveauId} onValueChange={setNiveauId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un niveau" />
              </SelectTrigger>
              <SelectContent>
                {niveaux.map((niveau) => (
                  <SelectItem key={niveau.id} value={niveau.id.toString()}>
                    {niveau.nom}
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
              {loading ? 'Traitement...' : editSemestre ? 'Mettre à jour' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminSemestreForm;
