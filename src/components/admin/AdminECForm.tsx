
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { getAllUEs } from '@/integrations/supabase/client';

interface AdminECFormProps {
  onClose: () => void;
  onSubmit: () => void;
  editEC?: any;
}

const AdminECForm: React.FC<AdminECFormProps> = ({ onClose, onSubmit, editEC }) => {
  const [nomEC, setNomEC] = useState('');
  const [ueId, setUeId] = useState('');
  const [ues, setUEs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUEs = async () => {
      try {
        const ues = await getAllUEs();
        setUEs(ues || []);
      } catch (error) {
        console.error('Error fetching UEs:', error);
      }
    };

    fetchUEs();

    if (editEC) {
      setNomEC(editEC.nom_ec || '');
      setUeId(editEC.ue_id?.toString() || '');
    }
  }, [editEC]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!ueId) {
        throw new Error('Veuillez sélectionner une UE');
      }

      if (editEC) {
        // Update EC
        const { error } = await supabase
          .from('ec')
          .update({ 
            nom_ec: nomEC,
            ue_id: parseInt(ueId)
          })
          .eq('id', editEC.id);

        if (error) throw error;
        toast.success('EC mis à jour avec succès');
      } else {
        // Create new EC
        const { error } = await supabase
          .from('ec')
          .insert({ 
            nom_ec: nomEC,
            ue_id: parseInt(ueId)
          });

        if (error) throw error;
        toast.success('EC créé avec succès');
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
          <DialogTitle>{editEC ? 'Modifier' : 'Ajouter'} un EC</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nomEC">Nom de l'EC</Label>
            <Input 
              id="nomEC" 
              value={nomEC} 
              onChange={(e) => setNomEC(e.target.value)} 
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ue">UE</Label>
            <Select value={ueId} onValueChange={setUeId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une UE" />
              </SelectTrigger>
              <SelectContent>
                {ues.map((ue) => (
                  <SelectItem key={ue.id} value={ue.id.toString()}>
                    {ue.nom}
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
              {loading ? 'Traitement...' : editEC ? 'Mettre à jour' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminECForm;
