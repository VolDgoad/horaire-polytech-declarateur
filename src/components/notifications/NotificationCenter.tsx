
import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Notification as NotificationType } from '@/types';
import { fetchUserNotifications, markNotificationAsRead, deleteNotification } from '@/services/notificationService';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/sonner';
import { Link } from 'react-router-dom';

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user && isOpen) {
      loadNotifications();
    }
  }, [user, isOpen]);

  const loadNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userNotifications = await fetchUserNotifications(user.email);
      setNotifications(userNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Erreur lors de la récupération des notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsRead(id);
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
    setNotifications(notifications.filter(n => n.id !== id));
  };
  
  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.read);
    
    for (const notification of unreadNotifications) {
      await markNotificationAsRead(notification.id);
    }
    
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    toast.success('Toutes les notifications marquées comme lues');
  };
  
  const deleteAllRead = async () => {
    const readNotifications = notifications.filter(n => n.read);
    
    for (const notification of readNotifications) {
      await deleteNotification(notification.id);
    }
    
    setNotifications(notifications.filter(n => !n.read));
    toast.success('Toutes les notifications lues supprimées');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationTypeStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'info':
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 md:w-96" align="end">
        <DropdownMenuLabel className="flex justify-between">
          <span>Notifications</span>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-6 px-1.5 text-xs">
                <Check className="h-3.5 w-3.5 mr-1" /> Tout marquer comme lu
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={deleteAllRead} className="h-6 px-1.5 text-xs">
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Nettoyer
            </Button>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px] overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">
              Chargement des notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              Aucune notification
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem key={notification.id} className="p-0 focus:bg-transparent" onSelect={(e) => e.preventDefault()}>
                <Card className={`mb-2 shadow-none border-l-4 ${notification.read ? 'border-l-gray-200' : `border-l-blue-500`}`}>
                  <CardHeader className="p-3 pb-0">
                    <CardTitle className="text-sm font-medium flex items-center justify-between">
                      <span>{notification.title}</span>
                      <Badge className={`ml-2 ${getNotificationTypeStyles(notification.type)}`}>
                        {notification.type}
                      </Badge>
                    </CardTitle>
                    <div className="text-xs text-gray-500">
                      {new Date(notification.createdAt).toLocaleDateString()} {new Date(notification.createdAt).toLocaleTimeString()}
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 pt-1">
                    <p className="text-sm whitespace-pre-line">{notification.message}</p>
                  </CardContent>
                  <CardFooter className="p-2 flex justify-between gap-2 bg-gray-50">
                    {notification.declarationId && (
                      <Link 
                        to={`/declarations/${notification.declarationId}`}
                        className="text-xs text-blue-600 hover:underline"
                        onClick={() => setIsOpen(false)}
                      >
                        Voir la déclaration
                      </Link>
                    )}
                    <div className="ml-auto flex gap-2">
                      {!notification.read && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 text-xs" 
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          <Check className="h-3.5 w-3.5 mr-1" /> Marquer comme lu
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 text-xs text-red-500" 
                        onClick={() => handleDelete(notification.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" /> Supprimer
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
