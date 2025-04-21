
import { useAuth } from '@/context/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { RecentDeclarations } from '@/components/dashboard/RecentDeclarations';

export default function Dashboard() {
  const { user } = useAuth();
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="text-muted-foreground mt-1">
            Bienvenue, {user?.name}. Voici un aperçu de vos activités.
          </p>
        </div>
        
        <StatsCards />
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="col-span-2">
            <RecentDeclarations />
          </div>
          
          <div className="space-y-4">
            <div className="rounded-xl border bg-card text-card-foreground shadow">
              <div className="p-6 flex flex-col items-center text-center">
                <div className="rounded-full bg-primary/10 p-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-polytech-blue text-white flex items-center justify-center font-semibold">
                    {user?.role === 'Enseignant' ? 'E' : user?.role === 'Scolarité' ? 'S' : user?.role === 'Chef de département' ? 'C' : 'D'}
                  </div>
                </div>
                <h3 className="text-xl font-medium">{user?.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {user?.role === 'Enseignant' && 'Enseignant'}
                  {user?.role === 'Scolarité' && 'Service Scolarité'}
                  {user?.role === 'Chef de département' && 'Chef de Département'}
                  {user?.role === 'Directrice des études' && 'Directrice des Études'}
                </p>
                {user?.department && (
                  <p className="text-sm mt-1">Département: {user.department}</p>
                )}
                <div className="mt-4 text-sm">
                  <p className="text-muted-foreground">
                    {user?.role === 'Enseignant' && 'Vous pouvez déclarer jusqu\'à 325 heures par an.'}
                    {user?.role === 'Scolarité' && 'Vous vérifiez les déclarations avant validation.'}
                    {user?.role === 'Chef de département' && 'Vous approuvez les déclarations de votre département.'}
                    {user?.role === 'Directrice des études' && 'Vous validez finalement toutes les déclarations.'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="rounded-xl border bg-card text-card-foreground shadow">
              <div className="p-6 space-y-2">
                <h3 className="font-medium">Guide d'utilisation</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Consultez vos déclarations en cours</li>
                  <li>• Soumettez de nouvelles déclarations</li>
                  <li>• Suivez le processus de validation</li>
                  <li>• Accédez à l'historique des déclarations</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
