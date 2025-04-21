
import React from 'react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { MainNav } from './MainNav';
import { SideNav } from './SideNav';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user, logout } = useAuth();

  if (!user) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar className="border-r">
          <SidebarHeader>
            <div className="p-4">
              <h2 className="text-lg font-semibold text-white">Polytech Diamniadio</h2>
              <p className="text-xs text-sidebar-accent mt-1">Gestion des Charges Horaires</p>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SideNav />
          </SidebarContent>
          <SidebarFooter>
            <div className="p-4 border-t border-sidebar-accent">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center">
                  <User className="h-4 w-4 text-sidebar-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <p className="text-xs text-sidebar-accent">
                    {user.role === 'enseignant' && 'Enseignant'}
                    {user.role === 'scolarite' && 'Service Scolarité'}
                    {user.role === 'chef_departement' && 'Chef de Département'}
                    {user.role === 'directrice' && 'Directrice des Études'}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full text-white border-sidebar-accent hover:bg-sidebar-accent hover:text-white" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
        <div className="flex-1 flex flex-col min-h-screen">
          <MainNav />
          <div className="p-4 md:p-6 lg:p-8 flex-1">
            <SidebarTrigger className="mb-4 lg:hidden" />
            {children}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
