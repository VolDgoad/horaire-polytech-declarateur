
import { MainLayout } from '@/components/layout/MainLayout';
import { DeclarationForm } from '@/components/declarations/DeclarationForm';

export default function NewDeclarationPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nouvelle déclaration</h1>
          <p className="text-muted-foreground mt-1">
            Déclarez vos heures d'enseignement pour le traitement et la validation
          </p>
        </div>
        
        <DeclarationForm />
      </div>
    </MainLayout>
  );
}
