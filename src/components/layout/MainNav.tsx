
import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { ModeToggle } from "./ModeToggle";
import { Button } from "../ui/button";
import { useAuth } from "@/context/AuthContext";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";

export function MainNav() {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex justify-between items-center">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <Link to="/" legacyBehavior passHref>
              <NavigationMenuLink
                className={navigationMenuTriggerStyle()}
                active={isActive("/")}
              >
                Accueil
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          {user && (
            <>
              <NavigationMenuItem>
                <Link to="/declarations" legacyBehavior passHref>
                  <NavigationMenuLink
                    className={navigationMenuTriggerStyle()}
                    active={isActive("/declarations")}
                  >
                    Déclarations
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              {(user.role === 'Scolarité' || 
                user.role === 'Chef de département' || 
                user.role === 'Directrice des études') && (
                <NavigationMenuItem>
                  <Link to="/validations" legacyBehavior passHref>
                    <NavigationMenuLink
                      className={navigationMenuTriggerStyle()}
                      active={isActive("/validations")}
                    >
                      À Traiter
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              )}
            </>
          )}
        </NavigationMenuList>
      </NavigationMenu>
      <div className="flex items-center gap-2">
        {user && <NotificationCenter />}
        <ModeToggle />
        {user ? (
          <Button variant="outline" size="sm" onClick={signOut}>
            Déconnexion
          </Button>
        ) : (
          <Link to="/login">
            <Button variant="default" size="sm">
              Connexion
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
