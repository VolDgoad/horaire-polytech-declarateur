
import { Link } from 'react-router-dom';
import { useDeclarations } from '@/context/DeclarationContext';
import { useAuth } from '@/context/AuthContext';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { DeclarationStatus } from '@/types';
import { useState } from 'react';

export function ValidationList() {
  const { pendingDeclarations } = useDeclarations();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  
  // Déterminer le statut que nous filtrons en fonction du rôle de l'utilisateur
  let pendingStatus: DeclarationStatus | null = null;
  
  if (user?.role === 'Scolarité') {
    pendingStatus = 'en_attente';
  } else if (user?.role === 'Chef de département') {
    pendingStatus = 'verifiee';
  } else if (user?.role === 'Directrice des études') {
    pendingStatus = 'approuvee';
  }
  
  // Obtenir le badge approprié pour le statut
  const getStatusBadge = (status: DeclarationStatus) => {
    switch (status) {
      case 'en_attente':
        return <Badge variant="secondary">En attente</Badge>;
      case 'verifiee':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Vérifiée</Badge>;
      case 'approuvee':
        return <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">Approuvée</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };
  
  // Filtrer les déclarations par recherche
  const filteredDeclarations = pendingDeclarations
    .filter(declaration => 
      declaration.course.toLowerCase().includes(search.toLowerCase()) ||
      declaration.userName.toLowerCase().includes(search.toLowerCase()) ||
      declaration.department.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Déclarations en attente</CardTitle>
        <CardDescription>
          {pendingStatus === 'en_attente' ? 'Déclarations en attente de vérification' : 
           pendingStatus === 'verifiee' ? 'Déclarations vérifiées en attente d\'approbation' : 
           pendingStatus === 'approuvee' ? 'Déclarations approuvées en attente de validation finale' : 
           'Déclarations à traiter'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <Input
            placeholder="Rechercher par enseignant, cours ou département..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Enseignant</TableHead>
                <TableHead>Cours</TableHead>
                <TableHead>Département</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Heures</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeclarations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                    Aucune déclaration en attente de traitement
                  </TableCell>
                </TableRow>
              ) : (
                filteredDeclarations.map((declaration) => (
                  <TableRow key={declaration.id}>
                    <TableCell className="font-medium">{declaration.userName}</TableCell>
                    <TableCell>{declaration.course}</TableCell>
                    <TableCell>{declaration.department}</TableCell>
                    <TableCell>{new Date(declaration.date).toLocaleDateString()}</TableCell>
                    <TableCell>{declaration.hours}h</TableCell>
                    <TableCell>{getStatusBadge(declaration.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        asChild
                      >
                        <Link to={`/validations/${declaration.id}`}>
                          Traiter
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
