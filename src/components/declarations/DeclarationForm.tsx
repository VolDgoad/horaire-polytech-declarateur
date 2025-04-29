import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeclarations } from '@/context/DeclarationContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { InfoCircled } from '@radix-ui/react-icons';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import { Department, Filiere, Niveau, Semestre, UE, EC } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface DeclarationFormProps {
  existingDeclarationId?: string;
}

export function DeclarationForm({ existingDeclarationId }: DeclarationFormProps) {
  const { user } = useAuth();
  const { 
    createDeclaration, 
    updateDeclaration,
    getDeclarationById,
    departments,
    filieres,
    niveaux,
    semestres,
    ues,
    ecs
  } = useDeclarations();
  const navigate = useNavigate();
  
  // Form state
  const [department, setDepartment] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  
  const [filiere, setFiliere] = useState('');
  const [filiereId, setFiliereId] = useState('');
  
  const [niveau, setNiveau] = useState('');
  const [niveauId, setNiveauId] = useState('');
  
  const [semestre, setSemestre] = useState('');
  const [semestreId, setSemestreId] = useState('');
  
  const [ue, setUe] = useState('');
  const [ueId, setUeId] = useState('');
  
  const [ec, setEc] = useState('');
  const [ecId, setEcId] = useState('');
  
  const [date, setDate] = useState('');
  const [hoursCM, setHoursCM] = useState<number | undefined>(undefined);
  const [hoursTD, setHoursTD] = useState<number | undefined>(undefined);
  const [hoursTP, setHoursTP] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState('');
  
  // Load existing declaration if editing
  useEffect(() => {
    if (existingDeclarationId) {
      const declaration = getDeclarationById(existingDeclarationId);
      if (declaration) {
        // Set department
        const dept = departments.find(d => d.id === declaration.departmentId);
        if (dept) {
          setDepartment(dept.name);
          setDepartmentId(dept.id);
        }
        
        // Set filiere if available
        if (declaration.filiereId) {
          const fil = filieres.find(f => f.id === declaration.filiereId);
          if (fil) {
            setFiliere(fil.name);
            setFiliereId(fil.id);
          }
        }
        
        // Set niveau if available
        if (declaration.niveauId) {
          const niv = niveaux.find(n => n.id === declaration.niveauId);
          if (niv) {
            setNiveau(niv.name);
            setNiveauId(niv.id);
          }
        }
        
        // Set semestre if available
        if (declaration.semestreId) {
          const sem = semestres.find(s => s.id === declaration.semestreId);
          if (sem) {
            setSemestre(sem.name);
            setSemestreId(sem.id);
          }
        }
        
        // Set UE if available
        if (declaration.ueId) {
          const u = ues.find(u => u.id === declaration.ueId);
          if (u) {
            setUe(u.name);
            setUeId(u.id);
          }
        }
        
        // Set EC if available
        if (declaration.ecId) {
          const e = ecs.find(e => e.id === declaration.ecId);
          if (e) {
            setEc(e.name);
            setEcId(e.id);
          }
        }
        
        // Set other fields
        setDate(declaration.date);
        setHoursCM(declaration.hoursCM);
        setHoursTD(declaration.hoursTD);
        setHoursTP(declaration.hoursTP);
        setNotes(declaration.notes || '');
      }
    }
  }, [existingDeclarationId, getDeclarationById, departments, filieres, niveaux, semestres, ues, ecs]);

  // Filtered lists based on selection
  const departmentFilieres = filieres.filter(f => f.departmentId === departmentId);
  const filieresNiveaux = niveaux.filter(n => n.filiereId === filiereId);
  const niveauxSemestres = semestres.filter(s => s.niveauId === niveauId);
  const semestresUEs = ues.filter(u => u.semestreId === semestreId);
  const uesECs = ecs.filter(e => e.ueId === ueId);

  // Reset dependent fields when parent field changes
  useEffect(() => {
    if (department) {
      const dept = departments.find(d => d.name === department);
      setDepartmentId(dept?.id || '');
    } else {
      setDepartmentId('');
    }
    setFiliere('');
    setFiliereId('');
    setNiveau('');
    setNiveauId('');
    setSemestre('');
    setSemestreId('');
    setUe('');
    setUeId('');
    setEc('');
    setEcId('');
  }, [department, departments]);

  useEffect(() => {
    if (filiere) {
      const fil = filieres.find(f => f.name === filiere);
      setFiliereId(fil?.id || '');
    } else {
      setFiliereId('');
    }
    setNiveau('');
    setNiveauId('');
    setSemestre('');
    setSemestreId('');
    setUe('');
    setUeId('');
    setEc('');
    setEcId('');
  }, [filiere, filieres]);

  useEffect(() => {
    if (niveau) {
      const niv = niveaux.find(n => n.name === niveau);
      setNiveauId(niv?.id || '');
    } else {
      setNiveauId('');
    }
    setSemestre('');
    setSemestreId('');
    setUe('');
    setUeId('');
    setEc('');
    setEcId('');
  }, [niveau, niveaux]);

  useEffect(() => {
    if (semestre) {
      const sem = semestres.find(s => s.name === semestre);
      setSemestreId(sem?.id || '');
    } else {
      setSemestreId('');
    }
    setUe('');
    setUeId('');
    setEc('');
    setEcId('');
  }, [semestre, semestres]);

  useEffect(() => {
    if (ue) {
      const u = ues.find(u => u.name === ue);
      setUeId(u?.id || '');
    } else {
      setUeId('');
    }
    setEc('');
    setEcId('');
  }, [ue, ues]);

  useEffect(() => {
    if (ec) {
      const e = ecs.find(e => e.name === ec);
      setEcId(e?.id || '');
    }
  }, [ec, ecs]);

  // Calculate total hours
  const totalHours = (hoursCM || 0) + (hoursTD || 0) + (hoursTP || 0);

  // Check if current user is department head for the selected department
  const isUserDeptHead = user?.role === 'Chef de département' && user?.department === department;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!department || !ec || !date || totalHours <= 0) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    if (totalHours > 8) {
      toast.error('Le nombre d\'heures ne peut pas dépasser 8 heures par jour');
      return;
    }
    
    try {
      const declarationData = {
        department,
        course: ec,
        date,
        hoursCM,
        hoursTD,
        hoursTP,
        hours: totalHours,
        notes,
        departmentId,
        filiereId,
        niveauId,
        semestreId,
        ueId,
        ecId
      };

      if (existingDeclarationId) {
        // Update existing declaration
        await updateDeclaration(existingDeclarationId, declarationData);
        toast.success('Déclaration mise à jour avec succès');
      } else {
        // Create new declaration
        await createDeclaration(declarationData);
        
        if (isUserDeptHead) {
          toast.success('Déclaration créée et automatiquement vérifiée. En attente d\'approbation finale.');
        } else {
          toast.success('Déclaration soumise avec succès');
        }
      }
      
      navigate('/declarations');
    } catch (error) {
      toast.error('Une erreur est survenue');
      console.error(error);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{existingDeclarationId ? 'Modifier la déclaration' : 'Nouvelle déclaration d\'heures'}</CardTitle>
        <CardDescription>
          {existingDeclarationId 
            ? 'Modifiez les détails de votre déclaration d\'heures' 
            : 'Déclarez vos heures d\'enseignement dans n\'importe quel département'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isUserDeptHead && !existingDeclarationId && (
          <Alert className="mb-6 bg-blue-50">
            <InfoCircled className="h-4 w-4" />
            <AlertTitle>Information</AlertTitle>
            <AlertDescription>
              Comme vous êtes Chef de département et que vous déclarez des heures dans votre propre département,
              votre déclaration sera automatiquement vérifiée et transmise à la Directrice des études pour approbation finale.
            </AlertDescription>
          </Alert>
        )}
        <form id="declaration-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Department selection */}
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
            
            {/* Hierarchical selections */}
            <div>
              <Label htmlFor="filiere">Filière</Label>
              <Select 
                value={filiere} 
                onValueChange={setFiliere}
                disabled={!department}
              >
                <SelectTrigger id="filiere">
                  <SelectValue placeholder="Sélectionner une filière" />
                </SelectTrigger>
                <SelectContent>
                  {departmentFilieres.map((fil) => (
                    <SelectItem key={fil.id} value={fil.name}>
                      {fil.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="niveau">Niveau</Label>
              <Select 
                value={niveau} 
                onValueChange={setNiveau}
                disabled={!filiere}
              >
                <SelectTrigger id="niveau">
                  <SelectValue placeholder="Sélectionner un niveau" />
                </SelectTrigger>
                <SelectContent>
                  {filieresNiveaux.map((niv) => (
                    <SelectItem key={niv.id} value={niv.name}>
                      {niv.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="semestre">Semestre</Label>
              <Select 
                value={semestre} 
                onValueChange={setSemestre}
                disabled={!niveau}
              >
                <SelectTrigger id="semestre">
                  <SelectValue placeholder="Sélectionner un semestre" />
                </SelectTrigger>
                <SelectContent>
                  {niveauxSemestres.map((sem) => (
                    <SelectItem key={sem.id} value={sem.name}>
                      {sem.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="ue">UE</Label>
              <Select 
                value={ue} 
                onValueChange={setUe}
                disabled={!semestre}
              >
                <SelectTrigger id="ue">
                  <SelectValue placeholder="Sélectionner une UE" />
                </SelectTrigger>
                <SelectContent>
                  {semestresUEs.map((u) => (
                    <SelectItem key={u.id} value={u.name}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="ec">EC</Label>
              <Select 
                value={ec} 
                onValueChange={setEc}
                disabled={!ue}
              >
                <SelectTrigger id="ec">
                  <SelectValue placeholder="Sélectionner un EC" />
                </SelectTrigger>
                <SelectContent>
                  {uesECs.map((e) => (
                    <SelectItem key={e.id} value={e.name}>
                      {e.name}
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
          onClick={() => navigate('/declarations')}
        >
          Annuler
        </Button>
        <Button 
          type="submit"
          form="declaration-form"
        >
          {existingDeclarationId ? 'Mettre à jour' : 'Soumettre'}
        </Button>
      </CardFooter>
    </Card>
  );
}
