
import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Plus, Trash2, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AdminECForm from '@/components/admin/AdminECForm';

export default function ECPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ecs, setECs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEC, setEditingEC] = useState<any>(null);

  useEffect(() => {
    if (!user || user.role !== 'Directrice des études') {
      navigate('/dashboard');
      return;
    }

    fetchECs();
  }, [user, navigate]);

  const fetchECs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ec')
        .select('*, ue(nom, semestres(nom))')
        .order('nom_ec');

      if (error) throw error;
      setECs(data || []);
    } catch (error: any) {
      toast.error(`Erreur lors du chargement des ECs: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet EC ?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('ec')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('EC supprimé avec succès');
      fetchECs();
    } catch (error: any) {
      toast.error(`Erreur lors de la suppression: ${error.message}`);
    }
  };

  const handleEdit = (ec: any) => {
    setEditingEC(ec);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingEC(null);
  };

  const handleFormSubmit = async () => {
    await fetchECs();
    handleFormClose();
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gestion des ECs</h1>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Ajouter un EC
          </Button>
        </div>

        {isFormOpen && (
          <AdminECForm 
            onClose={handleFormClose} 
            onSubmit={handleFormSubmit} 
            editEC={editingEC} 
          />
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ecs.map((ec) => (
              <Card key={ec.id} className="overflow-hidden">
                <CardHeader>
                  <CardTitle>{ec.nom_ec}</CardTitle>
                </CardHeader>
                <CardContent>
                  {ec.ue && (
                    <p className="text-sm text-muted-foreground">
                      UE: {ec.ue.nom} 
                      {ec.ue.semestres && ` (${ec.ue.semestres.nom})`}
                    </p>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(ec)}>
                    <Edit className="h-4 w-4 mr-1" /> Modifier
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(ec.id)}>
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
