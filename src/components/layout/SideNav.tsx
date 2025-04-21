
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar';
import { 
  LayoutDashboard, 
  FileText, 
  Clock, 
  CheckCircle,
  Settings,
  FileBarChart,
  User,
  Users
} from 'lucide-react';

export function SideNav() {
  const { user } = useAuth();
  const location = useLocation();
  
  if (!user) return null;

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Navigation</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem className={isActive('/dashboard') ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''}>
              <SidebarMenuButton asChild>
                <Link to="/dashboard">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  <span>Tableau de bord</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            {user.role === 'Enseignant' && (
              <>
                <SidebarMenuItem className={isActive('/declarations/new') ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''}>
                  <SidebarMenuButton asChild>
                    <Link to="/declarations/new">
                      <FileText className="h-4 w-4 mr-2" />
                      <span>Nouvelle déclaration</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem className={isActive('/declarations') ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''}>
                  <SidebarMenuButton asChild>
                    <Link to="/declarations">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>Mes déclarations</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </>
            )}
            
            {(user.role === 'Scolarité' || user.role === 'Chef de département' || user.role === 'Directrice des études') && (
              <SidebarMenuItem className={isActive('/validations') ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''}>
                <SidebarMenuButton asChild>
                  <Link to="/validations">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span>Validations</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
            
            {(user.role === 'Chef de département' || user.role === 'Directrice des études') && (
              <SidebarMenuItem className={isActive('/reports') ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''}>
                <SidebarMenuButton asChild>
                  <Link to="/reports">
                    <FileBarChart className="h-4 w-4 mr-2" />
                    <span>Rapports</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      
      {user.role === 'Directrice des études' && (
        <SidebarGroup>
          <SidebarGroupLabel>Administration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem className={isActive('/users') ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''}>
                <SidebarMenuButton asChild>
                  <Link to="/users">
                    <Users className="h-4 w-4 mr-2" />
                    <span>Utilisateurs</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem className={isActive('/settings') ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''}>
                <SidebarMenuButton asChild>
                  <Link to="/settings">
                    <Settings className="h-4 w-4 mr-2" />
                    <span>Paramètres</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}
      
      {user.role !== 'Directrice des études' && (
        <SidebarGroup>
          <SidebarGroupLabel>Paramètres</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem className={isActive('/profile') ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''}>
                <SidebarMenuButton asChild>
                  <Link to="/profile">
                    <User className="h-4 w-4 mr-2" />
                    <span>Mon profil</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}
    </>
  );
}
