
import { MainLayout } from '@/components/layout/MainLayout';
import { DeclarationList } from '@/components/declarations/DeclarationList';

export default function DeclarationsPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mes déclarations</h1>
          <p className="text-muted-foreground mt-1">
            Consultez et gérez l'ensemble de vos déclarations d'heures
          </p>
        </div>
        
        <DeclarationList />
      </div>
    </MainLayout>
  );
}
