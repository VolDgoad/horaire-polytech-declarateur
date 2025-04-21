
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDeclarations } from '@/context/DeclarationContext';
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

export function DeclarationList() {
  const { userDeclarations } = useDeclarations();
  const [statusFilter, setStatusFilter] = useState<DeclarationStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  
  // Filtrer les déclarations
  const filteredDeclarations = userDeclarations
    .filter(declaration => 
      statusFilter === 'all' || declaration.status === statusFilter
    )
    .filter(declaration => 
      declaration.course.toLowerCase().includes(search.toLowerCase()) ||
      declaration.date.includes(search)
    )
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  
  // Fonction pour obtenir le badge approprié pour chaque statut
  const getStatusBadge = (status: DeclarationStatus) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Brouillon</Badge>;
      case 'submitted':
        return <Badge variant="secondary">Soumise</Badge>;
      case 'verified':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Vérifiée</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">Approuvée</Badge>;
      case 'validated':
        return <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">Validée</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejetée</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mes déclarations</CardTitle>
        <CardDescription>Historique et statut de vos déclarations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <div className="w-full sm:w-64">
              <Select 
                value={statusFilter} 
                onValueChange={(value) => setStatusFilter(value as DeclarationStatus | 'all')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="submitted">Soumise</SelectItem>
                  <SelectItem value="verified">Vérifiée</SelectItem>
                  <SelectItem value="approved">Approuvée</SelectItem>
                  <SelectItem value="validated">Validée</SelectItem>
                  <SelectItem value="rejected">Rejetée</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full">
              <Input
                placeholder="Rechercher par cours ou date..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <Button asChild className="whitespace-nowrap">
            <Link to="/declarations/new">Nouvelle déclaration</Link>
          </Button>
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cours</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Heures</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeclarations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    Aucune déclaration trouvée
                  </TableCell>
                </TableRow>
              ) : (
                filteredDeclarations.map((declaration) => (
                  <TableRow key={declaration.id}>
                    <TableCell className="font-medium">{declaration.course}</TableCell>
                    <TableCell>{new Date(declaration.date).toLocaleDateString()}</TableCell>
                    <TableCell>{declaration.hours}h</TableCell>
                    <TableCell>{getStatusBadge(declaration.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        asChild
                      >
                        <Link to={`/declarations/${declaration.id}`}>
                          Détails
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
