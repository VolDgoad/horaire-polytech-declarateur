
import { useDeclarations } from '@/context/DeclarationContext';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, CheckCircle, XCircle, FileBarChart } from 'lucide-react';

export function StatsCards() {
  const { getUserStats } = useDeclarations();
  const { user } = useAuth();
  const stats = getUserStats();
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total des heures</CardTitle>
          <FileBarChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalHours}h</div>
          <p className="text-xs text-muted-foreground mt-1">
            {user?.role === 'enseignant' ? 'Validées sur 325h annuelles' : 'Déclarées'}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">En attente</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pendingDeclarations}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {user?.role === 'enseignant' ? 'Vos déclarations en attente' : 'Déclarations à traiter'}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Approuvées</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.approvedDeclarations}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {user?.role === 'enseignant' ? 'Vos déclarations validées' : 'Déclarations validées'}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Rejetées</CardTitle>
          <XCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.rejectedDeclarations}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {user?.role === 'enseignant' ? 'Vos déclarations rejetées' : 'Déclarations rejetées'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
