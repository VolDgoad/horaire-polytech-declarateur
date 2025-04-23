
import { Link } from 'react-router-dom';
import { useDeclarations } from '@/context/DeclarationContext';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DeclarationStatus } from '@/types';

export function RecentDeclarations() {
  const { user } = useAuth();
  
  try {
    const { userDeclarations, pendingDeclarations } = useDeclarations();
    
    // Enseignant voit ses propres déclarations récentes
    // Admin voit les déclarations en attente récentes
    const declarations = user?.role === 'Enseignant' 
      ? userDeclarations 
      : pendingDeclarations;
    
    const recentDeclarations = declarations
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);
    
    // Fonction pour obtenir le badge approprié pour chaque statut
    const getStatusBadge = (status: DeclarationStatus) => {
      switch (status) {
        case 'en_attente':
          return <Badge variant="outline">En attente</Badge>;
        case 'verifiee':
          return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Vérifiée</Badge>;
        case 'approuvee':
          return <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">Approuvée</Badge>;
        case 'validee':
          return <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">Validée</Badge>;
        case 'refusee':
          return <Badge variant="destructive">Rejetée</Badge>;
        default:
          return <Badge variant="outline">Inconnu</Badge>;
      }
    };
    
    const getTargetUrl = (declaration: any) => {
      if (user?.role === 'Enseignant') {
        return `/declarations/${declaration.id}`;
      } else {
        return `/validations/${declaration.id}`;
      }
    };
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {user?.role === 'Enseignant' ? 'Mes déclarations récentes' : 'Déclarations à traiter'}
          </CardTitle>
          <CardDescription>
            {user?.role === 'Enseignant' 
              ? 'Vos déclarations les plus récentes' 
              : 'Déclarations en attente de traitement'}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2">
          {recentDeclarations.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              {user?.role === 'Enseignant' 
                ? 'Vous n\'avez pas encore de déclaration' 
                : 'Aucune déclaration en attente'}
            </div>
          ) : (
            <div>
              {recentDeclarations.map((declaration) => (
                <div key={declaration.id} className="flex items-center justify-between p-4 hover:bg-accent rounded-md transition-colors">
                  <div>
                    <div className="font-medium">{declaration.course}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(declaration.date).toLocaleDateString()} • {declaration.hours}h
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(declaration.status)}
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={getTargetUrl(declaration)}>
                        {user?.role === 'Enseignant' ? 'Détails' : 'Traiter'}
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
              
              <div className="flex justify-center mt-4">
                <Button variant="outline" asChild>
                  <Link to={user?.role === 'Enseignant' ? '/declarations' : '/validations'}>
                    Voir tout
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  } catch (error) {
    console.error("DeclarationProvider not available:", error);
    
    // Fallback UI when provider is not available
    return (
      <Card>
        <CardHeader>
          <CardTitle>Déclarations</CardTitle>
          <CardDescription>Chargement des données...</CardDescription>
        </CardHeader>
        <CardContent className="px-2">
          <div className="text-center py-6 text-muted-foreground">
            Données indisponibles
          </div>
        </CardContent>
      </Card>
    );
  }
}
