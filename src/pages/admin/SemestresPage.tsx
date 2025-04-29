
import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Plus, Trash2, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AdminSemestreForm from '@/components/admin/AdminSemestreForm';

export default function SemestresPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [semestres, setSemestres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSemestre, setEditingSemestre] = useState<any>(null);

  useEffect(() => {
    if (!user || user.role !== 'Directrice des études') {
      navigate('/dashboard');
      return;
    }

    fetchSemestres();
  }, [user, navigate]);

  const fetchSemestres = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('semestres')
        .select('*, niveaux(nom, filieres(nom))')
        .order('nom');

      if (error) throw error;
      setSemestres(data || []);
    } catch (error: any) {
      toast.error(`Erreur lors du chargement des semestres: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce semestre ?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('semestres')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Semestre supprimé avec succès');
      fetchSemestres();
    } catch (error: any) {
      toast.error(`Erreur lors de la suppression: ${error.message}`);
    }
  };

  const handleEdit = (semestre: any) => {
    setEditingSemestre(semestre);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingSemestre(null);
  };

  const handleFormSubmit = async () => {
    await fetchSemestres();
    handleFormClose();
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gestion des Semestres</h1>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Ajouter un semestre
          </Button>
        </div>

        {isFormOpen && (
          <AdminSemestreForm 
            onClose={handleFormClose} 
            onSubmit={handleFormSubmit} 
            editSemestre={editingSemestre} 
          />
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {semestres.map((semestre) => (
              <Card key={semestre.id} className="overflow-hidden">
                <CardHeader>
                  <CardTitle>{semestre.nom}</CardTitle>
                </CardHeader>
                <CardContent>
                  {semestre.niveaux && (
                    <p className="text-sm text-muted-foreground">
                      Niveau: {semestre.niveaux.nom} 
                      {semestre.niveaux.filieres && ` (${semestre.niveaux.filieres.nom})`}
                    </p>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(semestre)}>
                    <Edit className="h-4 w-4 mr-1" /> Modifier
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(semestre.id)}>
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
