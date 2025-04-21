
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-polytech-light p-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-polytech-blue">404</h1>
        <p className="text-2xl font-semibold mt-4 mb-6">Page non trouvée</p>
        <p className="text-polytech-gray mb-8">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <Button onClick={() => navigate('/')}>
          Retour à l'accueil
        </Button>
      </div>
    </div>
  );
}
