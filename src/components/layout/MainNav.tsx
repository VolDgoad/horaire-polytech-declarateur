
import { useAuth } from '@/context/AuthContext';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function MainNav() {
  const { user } = useAuth();

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4 md:px-6">
        <div className="ml-auto flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-polytech-orange"></span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuGroup>
                <div className="p-2">
                  <h3 className="font-medium text-sm mb-1">Notifications</h3>
                  <p className="text-xs text-muted-foreground">Vos alertes récentes</p>
                </div>
                <DropdownMenuItem className="p-3 cursor-pointer">
                  <div>
                    <p className="text-sm font-medium">Nouvelle déclaration à vérifier</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Dr. Amadou Diop a soumis une nouvelle déclaration
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Il y a 1 heure</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="p-3 cursor-pointer">
                  <div>
                    <p className="text-sm font-medium">Déclaration approuvée</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Votre déclaration du 18 avril a été approuvée
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Il y a 3 heures</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="p-3 cursor-pointer">
                  <div>
                    <p className="text-sm font-medium">Limite de quota atteinte</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Vous avez atteint 80% de votre quota annuel
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Il y a 1 jour</p>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <span className="text-sm font-medium">
            {user?.name}
          </span>
        </div>
      </div>
    </div>
  );
}
