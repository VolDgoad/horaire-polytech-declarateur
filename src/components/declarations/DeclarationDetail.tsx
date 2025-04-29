
import { Declaration } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useDeclarations } from '@/context/DeclarationContext';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { toast } from '@/components/ui/sonner';
import { DeclarationStatus } from './DeclarationStatus';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Pencil, Trash2, CheckCircle, XCircle } from 'lucide-react';

interface DeclarationDetailProps {
  declaration: Declaration;
  onRefresh?: () => void;
}

export function DeclarationDetail({ declaration, onRefresh }: DeclarationDetailProps) {
  const { deleteDeclaration, updateStatus, canUserProcessDeclaration, getNextStatus, getRejectStatus } = useDeclarations();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  
  const canProcess = canUserProcessDeclaration(declaration);
  const nextStatus = getNextStatus(declaration);
  const rejectStatus = getRejectStatus(declaration);
  
  const isOwnDeclaration = user?.id === declaration.userId;
  const canEdit = isOwnDeclaration && ['en_attente', 'refusee'].includes(declaration.status);
  const canDelete = isOwnDeclaration && ['en_attente', 'refusee'].includes(declaration.status);
  
  const handleDelete = async () => {
    if (await deleteDeclaration(declaration.id)) {
      navigate('/declarations');
    }
  };
  
  const handleApprove = async () => {
    if (!nextStatus) {
      toast.error("Impossible d'approuver cette déclaration");
      return;
    }
    
    if (await updateStatus(declaration.id, nextStatus)) {
      toast.success('Déclaration traitée avec succès');
      if (onRefresh) onRefresh();
    }
  };
  
  const handleReject = async () => {
    if (!rejectStatus) {
      toast.error("Impossible de refuser cette déclaration");
      return;
    }
    
    if (rejectionReason.trim() === '') {
      toast.error('Veuillez fournir un motif de refus');
      return;
    }
    
    if (await updateStatus(declaration.id, rejectStatus, rejectionReason)) {
      setRejectionReason('');
      setIsRejectDialogOpen(false);
      toast.success('Déclaration refusée');
      if (onRefresh) onRefresh();
    }
  };
  
  // Format dates for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Détails de la déclaration</span>
        </CardTitle>
        <CardDescription>
          {declaration.department} - {declaration.course}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Enseignant</h3>
              <p className="mt-1">{declaration.userName}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Date</h3>
              <p className="mt-1">{formatDate(declaration.date)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Département</h3>
              <p className="mt-1">{declaration.department}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Cours</h3>
              <p className="mt-1">{declaration.course}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Heures CM</h3>
              <p className="mt-1">{declaration.hoursCM || 0}h</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Heures TD</h3>
              <p className="mt-1">{declaration.hoursTD || 0}h</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Heures TP</h3>
              <p className="mt-1">{declaration.hoursTP || 0}h</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total des heures</h3>
              <p className="mt-1 font-semibold">{declaration.hours}h</p>
            </div>
          </div>
        </div>
        
        {declaration.notes && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">Notes</h3>
            <p className="mt-1 text-gray-700">{declaration.notes}</p>
          </div>
        )}
        
        <div className="pt-4">
          <DeclarationStatus declaration={declaration} />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div>
          {canDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action ne peut pas être annulée. Cela supprimera définitivement votre déclaration.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Supprimer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
        
        <div className="flex gap-2">
          {canEdit && (
            <Button variant="outline" onClick={() => navigate(`/declarations/edit/${declaration.id}`)}>
              <Pencil className="mr-2 h-4 w-4" /> Modifier
            </Button>
          )}
          
          {canProcess && nextStatus && (
            <Button onClick={handleApprove}>
              <CheckCircle className="mr-2 h-4 w-4" />
              {declaration.status === 'en_attente' ? 'Vérifier' : 
               declaration.status === 'verifiee' ? 'Valider' : 
               declaration.status === 'approuvee' ? 'Approuver' : 'Traiter'}
            </Button>
          )}
          
          {canProcess && rejectStatus && (
            <Button variant="destructive" onClick={() => setIsRejectDialogOpen(true)}>
              <XCircle className="mr-2 h-4 w-4" /> Refuser
            </Button>
          )}
        </div>
      </CardFooter>
      
      {/* Rejection Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refuser la déclaration</DialogTitle>
            <DialogDescription>
              Veuillez indiquer le motif du refus. Cette information sera communiquée à l'enseignant.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reject-reason">Motif du refus</Label>
              <Textarea
                id="reject-reason"
                placeholder="Indiquez le motif du refus..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Refuser la déclaration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
