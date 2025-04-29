
import React, { useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, Building, Layers, List, Book, FileText, Settings } from 'lucide-react';

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'Directrice des études') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const adminSections = [
    {
      title: 'Utilisateurs',
      description: 'Gérer les comptes utilisateurs',
      icon: <Users className="h-6 w-6" />,
      path: '/admin/users'
    },
    {
      title: 'Départements',
      description: 'Gérer les départements',
      icon: <Building className="h-6 w-6" />,
      path: '/admin/departments'
    },
    {
      title: 'Filières',
      description: 'Gérer les filières',
      icon: <Layers className="h-6 w-6" />,
      path: '/admin/filieres'
    },
    {
      title: 'Niveaux',
      description: 'Gérer les niveaux',
      icon: <List className="h-6 w-6" />,
      path: '/admin/niveaux'
    },
    {
      title: 'Semestres',
      description: 'Gérer les semestres',
      icon: <Book className="h-6 w-6" />,
      path: '/admin/semestres'
    },
    {
      title: 'UEs',
      description: 'Gérer les unités d\'enseignement',
      icon: <FileText className="h-6 w-6" />,
      path: '/admin/ues'
    },
    {
      title: 'ECs',
      description: 'Gérer les éléments constitutifs',
      icon: <FileText className="h-6 w-6" />,
      path: '/admin/ecs'
    },
    {
      title: 'Paramètres',
      description: 'Configuration du système',
      icon: <Settings className="h-6 w-6" />,
      path: '/settings'
    }
  ];

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Administration</h1>
          <p className="text-muted-foreground">Gérer les données du système</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {adminSections.map((section, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {section.icon}
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{section.description}</p>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => navigate(section.path)}>
                  Accéder
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
