
import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Plus, Trash2, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AdminDepartmentForm from '@/components/admin/AdminDepartmentForm';

export default function DepartmentsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<any>(null);

  useEffect(() => {
    if (!user || user.role !== 'Directrice des études') {
      navigate('/dashboard');
      return;
    }

    fetchDepartments();
  }, [user, navigate]);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('departements')
        .select('*')
        .order('nom');

      if (error) throw error;
      setDepartments(data || []);
    } catch (error: any) {
      toast.error(`Erreur lors du chargement des départements: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce département ?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('departements')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Département supprimé avec succès');
      fetchDepartments();
    } catch (error: any) {
      toast.error(`Erreur lors de la suppression: ${error.message}`);
    }
  };

  const handleEdit = (department: any) => {
    setEditingDepartment(department);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingDepartment(null);
  };

  const handleFormSubmit = async () => {
    await fetchDepartments();
    handleFormClose();
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gestion des Départements</h1>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Ajouter un département
          </Button>
        </div>

        {isFormOpen && (
          <AdminDepartmentForm 
            onClose={handleFormClose} 
            onSubmit={handleFormSubmit} 
            editDepartment={editingDepartment} 
          />
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {departments.map((department) => (
              <Card key={department.id} className="overflow-hidden">
                <CardHeader>
                  <CardTitle>{department.nom}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">ID: {department.id}</p>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(department)}>
                    <Edit className="h-4 w-4 mr-1" /> Modifier
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(department.id)}>
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
