
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeclarations } from '@/context/DeclarationContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';

export function DeclarationForm() {
  const { user } = useAuth();
  const { createDeclaration, departments, courses } = useDeclarations();
  const navigate = useNavigate();
  
  // Enlever l'initialisation avec le département de l'utilisateur pour permettre la sélection libre
  const [department, setDepartment] = useState('');
  const [course, setCourse] = useState('');
  const [date, setDate] = useState('');
  const [hoursCM, setHoursCM] = useState<number | undefined>(undefined);
  const [hoursTD, setHoursTD] = useState<number | undefined>(undefined);
  const [hoursTP, setHoursTP] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [isDraft, setIsDraft] = useState(true);

  // Filtrer les cours par département sélectionné
  const departmentCourses = courses.filter(c => c.departmentId === departments.find(d => d.name === department)?.id);

  // Calculate total hours
  const totalHours = (hoursCM || 0) + (hoursTD || 0) + (hoursTP || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!department || !course || !date || totalHours <= 0) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    if (totalHours > 8) {
      toast.error('Le nombre d\'heures ne peut pas dépasser 8 heures par jour');
      return;
    }
    
    try {
      createDeclaration({
        department,
        course,
        date,
        hoursCM,
        hoursTD,
        hoursTP,
        hours: totalHours,
        notes
      });
      
      if (!isDraft) {
        toast.success('Déclaration soumise avec succès');
      }
      
      navigate('/declarations');
    } catch (error) {
      toast.error('Une erreur est survenue lors de la création de la déclaration');
    }
  };

  const handleSaveAsDraft = () => {
    setIsDraft(true);
  };

  const handleSubmitDeclaration = () => {
    setIsDraft(false);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Nouvelle déclaration d'heures</CardTitle>
        <CardDescription>
          Déclarez vos heures d'enseignement dans n'importe quel département
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="declaration-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="department">Département</Label>
              <Select 
                value={department} 
                onValueChange={setDepartment}
              >
                <SelectTrigger id="department">
                  <SelectValue placeholder="Sélectionner un département" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.name}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="course">Cours</Label>
              <Select 
                value={course} 
                onValueChange={setCourse}
                disabled={!department}
              >
                <SelectTrigger id="course">
                  <SelectValue placeholder="Sélectionner un cours" />
                </SelectTrigger>
                <SelectContent>
                  {departmentCourses.map((course) => (
                    <SelectItem key={course.id} value={course.name}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="hoursCM">Heures CM</Label>
                <Input
                  id="hoursCM"
                  type="number"
                  min="0"
                  step="0.5"
                  value={hoursCM === undefined ? '' : hoursCM}
                  onChange={(e) => setHoursCM(e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </div>
              <div>
                <Label htmlFor="hoursTD">Heures TD</Label>
                <Input
                  id="hoursTD"
                  type="number"
                  min="0"
                  step="0.5"
                  value={hoursTD === undefined ? '' : hoursTD}
                  onChange={(e) => setHoursTD(e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </div>
              <div>
                <Label htmlFor="hoursTP">Heures TP</Label>
                <Input
                  id="hoursTP"
                  type="number"
                  min="0"
                  step="0.5"
                  value={hoursTP === undefined ? '' : hoursTP}
                  onChange={(e) => setHoursTP(e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="totalHours">Nombre total d'heures</Label>
              <Input
                id="totalHours"
                type="number"
                value={totalHours}
                disabled
              />
              <p className="text-xs text-muted-foreground mt-1">
                Maximum 8 heures par jour
              </p>
            </div>
            
            <div>
              <Label htmlFor="notes">Notes (optionnel)</Label>
              <Textarea
                id="notes"
                placeholder="Ajoutez des détails supplémentaires..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handleSaveAsDraft}
          type="submit"
          form="declaration-form"
        >
          Enregistrer comme brouillon
        </Button>
        <Button 
          onClick={handleSubmitDeclaration}
          type="submit"
          form="declaration-form"
        >
          Soumettre
        </Button>
      </CardFooter>
    </Card>
  );
}
