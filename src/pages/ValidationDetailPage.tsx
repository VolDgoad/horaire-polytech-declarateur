
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDeclarations } from '@/context/DeclarationContext';
import { useAuth } from '@/context/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { DeclarationStatus } from '@/types';
import { toast } from '@/components/ui/sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ValidationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getDeclarationById, updateStatus } = useDeclarations();
  const { user } = useAuth();
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const declaration = getDeclarationById(id || '');
  
  if (!declaration) {
    return (
      <MainLayout>
        <div className="text-center py-10">
          <h1 className="text-2xl font-bold">Déclaration non trouvée</h1>
          <p className="text-muted-foreground mt-2">La déclaration que vous cherchez n'existe pas ou a été supprimée.</p>
          <Button onClick={() => navigate(-1)} className="mt-4">Retour</Button>
        </div>
      </MainLayout>
    );
  }
  
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

  const getNextStatus = () => {
    if (user?.role === 'scolarite' && declaration.status === 'submitted') {
      return 'verified';
    } else if (user?.role === 'chef_departement' && declaration.status === 'verified') {
      return 'approved';
    } else if (user?.role === 'directrice' && declaration.status === 'approved') {
      return 'validated';
    }
    return null;
  };
  
  const getValidationButtonText = () => {
    if (user?.role === 'scolarite') {
      return 'Vérifier';
    } else if (user?.role === 'chef_departement') {
      return 'Approuver';
    } else if (user?.role === 'directrice') {
      return 'Valider';
    }
    return 'Valider';
  };

  const canValidate = !!getNextStatus();
  
  const handleValidate = () => {
    const nextStatus = getNextStatus();
    if (nextStatus) {
      updateStatus(declaration.id, nextStatus);
      navigate('/validations');
    }
  };
  
  const handleReject = () => {
    setIsRejectDialogOpen(true);
  };
  
  const confirmReject = () => {
    if (!rejectionReason.trim()) {
      toast.error('Veuillez fournir un motif de rejet');
      return;
    }
    
    updateStatus(declaration.id, 'rejected', rejectionReason);
    setIsRejectDialogOpen(false);
    navigate('/validations');
  };
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Validation de déclaration</h1>
            <p className="text-muted-foreground mt-1">
              Vérifiez et validez cette déclaration
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate(-1)}>Retour</Button>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Déclaration - {declaration.course}</CardTitle>
              {getStatusBadge(declaration.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Informations générales</h3>
                <Separator className="my-2" />
                <dl className="space-y-2">
                  <div className="flex justify-between py-1">
                    <dt className="text-sm font-medium">Enseignant</dt>
                    <dd>{declaration.userName}</dd>
                  </div>
                  <div className="flex justify-between py-1">
                    <dt className="text-sm font-medium">Cours</dt>
                    <dd>{declaration.course}</dd>
                  </div>
                  <div className="flex justify-between py-1">
                    <dt className="text-sm font-medium">Département</dt>
                    <dd>{declaration.department}</dd>
                  </div>
                  <div className="flex justify-between py-1">
                    <dt className="text-sm font-medium">Date</dt>
                    <dd>{new Date(declaration.date).toLocaleDateString()}</dd>
                  </div>
                  <div className="flex justify-between py-1">
                    <dt className="text-sm font-medium">Heures</dt>
                    <dd>{declaration.hours}h</dd>
                  </div>
                </dl>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Suivi de validation</h3>
                <Separator className="my-2" />
                <dl className="space-y-2">
                  <div className="flex justify-between py-1">
                    <dt className="text-sm font-medium">Créée le</dt>
                    <dd>{new Date(declaration.createdAt).toLocaleDateString()}</dd>
                  </div>
                  <div className="flex justify-between py-1">
                    <dt className="text-sm font-medium">Dernière mise à jour</dt>
                    <dd>{new Date(declaration.updatedAt).toLocaleDateString()}</dd>
                  </div>
                  {declaration.verifiedBy && (
                    <div className="flex justify-between py-1">
                      <dt className="text-sm font-medium">Vérifiée par</dt>
                      <dd>{declaration.verifiedBy}</dd>
                    </div>
                  )}
                  {declaration.approvedBy && (
                    <div className="flex justify-between py-1">
                      <dt className="text-sm font-medium">Approuvée par</dt>
                      <dd>{declaration.approvedBy}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div>
              {canValidate && (
                <Button variant="destructive" onClick={handleReject}>
                  Rejeter
                </Button>
              )}
            </div>
            <div>
              {canValidate && (
                <Button onClick={handleValidate}>
                  {getValidationButtonText()}
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
      
      <AlertDialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rejeter la déclaration</AlertDialogTitle>
            <AlertDialogDescription>
              Veuillez fournir un motif de rejet pour cette déclaration.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="rejectionReason" className="mb-2 block">Motif du rejet</Label>
            <Textarea
              id="rejectionReason"
              placeholder="Entrez le motif du rejet..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmReject} className="bg-destructive text-destructive-foreground">
              Rejeter la déclaration
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
