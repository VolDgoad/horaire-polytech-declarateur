
import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { DeclarationStatus } from '@/types';

export function ValidationList() {
  const { user } = useAuth();
  const { pendingDeclarations } = useDeclarations();
  const [search, setSearch] = useState('');
  
  // Filtrer les déclarations
  const filteredDeclarations = pendingDeclarations
    .filter(declaration => 
      declaration.course.toLowerCase().includes(search.toLowerCase()) ||
      declaration.userName.toLowerCase().includes(search.toLowerCase()) ||
      declaration.date.includes(search)
    )
    .sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
  
  const getStatusLabel = () => {
    if (user?.role === 'scolarite') return 'En attente de vérification';
    if (user?.role === 'chef_departement') return 'En attente d\'approbation';
    if (user?.role === 'directrice') return 'En attente de validation finale';
    return 'En attente';
  };
  
  // Fonction pour obtenir le badge approprié pour chaque statut
  const getStatusBadge = (status: DeclarationStatus) => {
    switch (status) {
      case 'submitted':
        return <Badge variant="secondary">Soumise</Badge>;
      case 'verified':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Vérifiée</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">Approuvée</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Validations en attente</CardTitle>
        <CardDescription>Déclarations d'heures {getStatusLabel()}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-6">
          <div className="w-full max-w-sm">
            <Input
              placeholder="Rechercher par nom, cours ou date..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
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
                    Aucune déclaration en attente
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
                          Valider
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
