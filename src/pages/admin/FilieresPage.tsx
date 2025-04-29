
import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Plus, Trash2, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AdminFiliereForm from '@/components/admin/AdminFiliereForm';

export default function FilieresPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filieres, setFilieres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFiliere, setEditingFiliere] = useState<any>(null);

  useEffect(() => {
    if (!user || user.role !== 'Directrice des études') {
      navigate('/dashboard');
      return;
    }

    fetchFilieres();
  }, [user, navigate]);

  const fetchFilieres = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('filieres')
        .select('*, departements(nom)')
        .order('nom');

      if (error) throw error;
      setFilieres(data || []);
    } catch (error: any) {
      toast.error(`Erreur lors du chargement des filières: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette filière ?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('filieres')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Filière supprimée avec succès');
      fetchFilieres();
    } catch (error: any) {
      toast.error(`Erreur lors de la suppression: ${error.message}`);
    }
  };

  const handleEdit = (filiere: any) => {
    setEditingFiliere(filiere);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingFiliere(null);
  };

  const handleFormSubmit = async () => {
    await fetchFilieres();
    handleFormClose();
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gestion des Filières</h1>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Ajouter une filière
          </Button>
        </div>

        {isFormOpen && (
          <AdminFiliereForm 
            onClose={handleFormClose} 
            onSubmit={handleFormSubmit} 
            editFiliere={editingFiliere} 
          />
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filieres.map((filiere) => (
              <Card key={filiere.id} className="overflow-hidden">
                <CardHeader>
                  <CardTitle>{filiere.nom}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Département: {filiere.departements?.nom}</p>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(filiere)}>
                    <Edit className="h-4 w-4 mr-1" /> Modifier
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(filiere.id)}>
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
