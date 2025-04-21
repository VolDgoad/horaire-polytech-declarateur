
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/login');
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-polytech-light">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-polytech-blue mb-2">Polytech Diamniadio</h1>
        <p className="text-polytech-gray">Chargement de la plateforme de gestion des charges horaires...</p>
      </div>
    </div>
  );
};

export default Index;
