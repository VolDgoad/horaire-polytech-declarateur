
import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Plus, Trash2, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AdminUEForm from '@/components/admin/AdminUEForm';

export default function UEPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ues, setUEs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUE, setEditingUE] = useState<any>(null);

  useEffect(() => {
    if (!user || user.role !== 'Directrice des études') {
      navigate('/dashboard');
      return;
    }

    fetchUEs();
  }, [user, navigate]);

  const fetchUEs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ue')
        .select('*, semestres(nom, niveaux(nom))')
        .order('nom');

      if (error) throw error;
      setUEs(data || []);
    } catch (error: any) {
      toast.error(`Erreur lors du chargement des UEs: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette UE ?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('ue')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('UE supprimée avec succès');
      fetchUEs();
    } catch (error: any) {
      toast.error(`Erreur lors de la suppression: ${error.message}`);
    }
  };

  const handleEdit = (ue: any) => {
    setEditingUE(ue);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingUE(null);
  };

  const handleFormSubmit = async () => {
    await fetchUEs();
    handleFormClose();
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gestion des UEs</h1>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Ajouter une UE
          </Button>
        </div>

        {isFormOpen && (
          <AdminUEForm 
            onClose={handleFormClose} 
            onSubmit={handleFormSubmit} 
            editUE={editingUE} 
          />
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ues.map((ue) => (
              <Card key={ue.id} className="overflow-hidden">
                <CardHeader>
                  <CardTitle>{ue.nom}</CardTitle>
                </CardHeader>
                <CardContent>
                  {ue.semestres && (
                    <p className="text-sm text-muted-foreground">
                      Semestre: {ue.semestres.nom} 
                      {ue.semestres.niveaux && ` (${ue.semestres.niveaux.nom})`}
                    </p>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(ue)}>
                    <Edit className="h-4 w-4 mr-1" /> Modifier
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(ue.id)}>
                    <Trash2 className="h-4 w-4 mr-1" /> Supprimer
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
