import { useParams, useNavigate } from 'react-router-dom';
import { useDeclarations } from '@/context/DeclarationContext';
import { useAuth } from '@/context/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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
import { useState } from 'react';

export default function DeclarationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getDeclarationById, updateDeclaration, deleteDeclaration, updateStatus } = useDeclarations();
  const { user } = useAuth();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  
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
  
  const canEdit = declaration.status === 'en_attente' && user?.id === declaration.userId;
  const canDelete = (declaration.status === 'en_attente' || declaration.status === 'refusee') && user?.id === declaration.userId;
  const canSubmit = declaration.status === 'en_attente' && user?.id === declaration.userId;
  
  const handleEdit = () => {
    toast.info('Fonctionnalité d\'édition à implémenter');
  };
  
  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    deleteDeclaration(declaration.id);
    navigate('/declarations');
  };
  
  const handleSubmit = () => {
    setIsSubmitDialogOpen(true);
  };
  
  const confirmSubmit = () => {
    updateStatus(declaration.id, 'submitted');
    toast.success('Déclaration soumise avec succès');
  };
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Détails de la déclaration</h1>
            <p className="text-muted-foreground mt-1">
              Consultez les informations détaillées de votre déclaration
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
                  {declaration.validatedBy && (
                    <div className="flex justify-between py-1">
                      <dt className="text-sm font-medium">Validée par</dt>
                      <dd>{declaration.validatedBy}</dd>
                    </div>
                  )}
                  {declaration.rejectedBy && (
                    <div className="flex justify-between py-1">
                      <dt className="text-sm font-medium">Rejetée par</dt>
                      <dd>{declaration.rejectedBy}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
            
            {declaration.rejectionReason && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Motif de rejet</h3>
                <Separator className="my-2" />
                <p className="text-sm">{declaration.rejectionReason}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <div>
              {canDelete && (
                <Button variant="destructive" onClick={handleDelete}>
                  Supprimer
                </Button>
              )}
            </div>
            <div className="space-x-2">
              {canEdit && (
                <Button variant="outline" onClick={handleEdit}>
                  Modifier
                </Button>
              )}
              {canSubmit && (
                <Button onClick={handleSubmit}>
                  Soumettre
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cette déclaration ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. La déclaration sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Soumettre la déclaration</AlertDialogTitle>
            <AlertDialogDescription>
              Voulez-vous soumettre cette déclaration pour validation ? Vous ne pourrez plus la modifier après soumission.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSubmit}>
              Soumettre
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
