
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
          <p className="text-muted-foreground mt-1">
            Complétez tous les champs du parcours pédagogique (département, filière, niveau, semestre, UE, EC)
          </p>
          <p className="text-sm text-amber-600 mt-4">
            <strong>Note:</strong> Si vous êtes Chef de département et que vous déclarez des heures dans votre propre département, 
            votre déclaration sera automatiquement vérifiée et transmise directement à la Directrice des études pour approbation finale.
          </p>
        </div>
        
        <DeclarationForm />
      </div>
    </MainLayout>
  );
}
