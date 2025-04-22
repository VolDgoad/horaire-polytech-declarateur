
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { Link } from 'react-router-dom';
import { TeacherGrade, UserRole } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { GraduationCap, Building2 } from 'lucide-react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<UserRole>('Enseignant');
  const [grade, setGrade] = useState<TeacherGrade | ''>('');
  const [departmentId, setDepartmentId] = useState<string>('');
  const [departments, setDepartments] = useState<Array<{ id: number; nom: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDepartments = async () => {
      const { data, error } = await supabase
        .from('departements')
        .select('id, nom');
      
      if (error) {
        console.error('Error fetching departments:', error);
        toast.error('Erreur lors de la récupération des départements');
        return;
      }

      setDepartments(data || []);
    };

    fetchDepartments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Prepare user metadata based on role
      const metadata: Record<string, any> = {
        prenom: firstName,
        nom: lastName,
        role: role
      };

      // Add grade for teachers
      if (role === 'Enseignant' && grade) {
        metadata.grade = grade;
      }

      // Add department for department heads
      if (role === 'Chef de département' && departmentId) {
        metadata.departement_id = parseInt(departmentId);
      }

      await signup(email, password, metadata);
      navigate('/dashboard');
      toast.success('Inscription réussie');
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Une erreur est survenue lors de l\'inscription');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const roles: UserRole[] = ['Enseignant', 'Chef de département', 'Directrice des études', 'Scolarité', 'Admin'];
  
  const grades: TeacherGrade[] = [
    'Professeur Titulaire des Universités',
    'Maitre de Conférences Assimilé',
    'Maitre de Conférences Assimilé Stagiaire',
    'Maitre de Conférences Titulaire',
    'Maitre-assistant',
    'Assistant de Deuxième Classe',
    'Assistant dispensant des Cours Magistraux',
    'Assistant ne dispensant pas de Cours Magistraux'
  ];

  // Function to handle grade change with correct typing
  const handleGradeChange = (value: string) => {
    setGrade(value as TeacherGrade);
  };

  // Function to handle role change with correct typing
  const handleRoleChange = (value: string) => {
    setRole(value as UserRole);
  };

  // Function to handle department change
  const handleDepartmentChange = (value: string) => {
    setDepartmentId(value);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-polytech-light p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-polytech-blue mb-2">Polytech Diamniadio</h1>
          <p className="text-polytech-gray">Plateforme de gestion des charges horaires</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Inscription</CardTitle>
            <CardDescription>
              Créez votre compte pour accéder à la plateforme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Rôle</Label>
                <Select value={role} onValueChange={handleRoleChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez votre rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {role === 'Enseignant' && (
                <div className="space-y-2">
                  <Label htmlFor="grade">Grade</Label>
                  <Select value={grade} onValueChange={handleGradeChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionnez votre grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {grades.map((g) => (
                        <SelectItem key={g} value={g}>
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {role === 'Chef de département' && (
                <div className="space-y-2">
                  <Label htmlFor="department">Département</Label>
                  <Select value={departmentId} onValueChange={handleDepartmentChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionnez votre département" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Inscription...' : 'S\'inscrire'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Déjà inscrit?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Se connecter
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
