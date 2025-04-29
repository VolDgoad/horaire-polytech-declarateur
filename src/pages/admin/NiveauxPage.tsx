
import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Plus, Trash2, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AdminNiveauForm from '@/components/admin/AdminNiveauForm';

export default function NiveauxPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [niveaux, setNiveaux] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNiveau, setEditingNiveau] = useState<any>(null);

  useEffect(() => {
    if (!user || user.role !== 'Directrice des études') {
      navigate('/dashboard');
      return;
    }

    fetchNiveaux();
  }, [user, navigate]);

  const fetchNiveaux = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('niveaux')
        .select('*, filieres(nom, departements(nom))')
        .order('nom');

      if (error) throw error;
      setNiveaux(data || []);
    } catch (error: any) {
      toast.error(`Erreur lors du chargement des niveaux: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce niveau ?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('niveaux')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Niveau supprimé avec succès');
      fetchNiveaux();
    } catch (error: any) {
      toast.error(`Erreur lors de la suppression: ${error.message}`);
    }
  };

  const handleEdit = (niveau: any) => {
    setEditingNiveau(niveau);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingNiveau(null);
  };

  const handleFormSubmit = async () => {
    await fetchNiveaux();
    handleFormClose();
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gestion des Niveaux</h1>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Ajouter un niveau
          </Button>
        </div>

        {isFormOpen && (
          <AdminNiveauForm 
            onClose={handleFormClose} 
            onSubmit={handleFormSubmit} 
            editNiveau={editingNiveau} 
          />
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {niveaux.map((niveau) => (
              <Card key={niveau.id} className="overflow-hidden">
                <CardHeader>
                  <CardTitle>{niveau.nom}</CardTitle>
                </CardHeader>
                <CardContent>
                  {niveau.filieres && (
                    <p className="text-sm text-muted-foreground">
                      Filière: {niveau.filieres.nom} 
                      {niveau.filieres.departements && ` (${niveau.filieres.departements.nom})`}
                    </p>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(niveau)}>
                    <Edit className="h-4 w-4 mr-1" /> Modifier
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(niveau.id)}>
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
