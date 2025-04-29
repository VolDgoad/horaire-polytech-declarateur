
import { supabase } from '@/integrations/supabase/client';
import { Declaration, Notification, NotificationType, User } from '@/types';
import { EmailTemplate, emailTemplates } from '@/types/declaration';
import { toast } from '@/components/ui/sonner';

interface SendEmailParams {
  recipient: string;
  subject: string;
  message: string;
  declarationId?: string;
  status?: string;
  type?: NotificationType;
}

export const sendEmail = async ({
  recipient,
  subject,
  message,
  declarationId,
  status,
  type = 'info'
}: SendEmailParams): Promise<boolean> => {
  try {
    const { error } = await supabase.functions.invoke('send-notification', {
      body: {
        recipientEmail: recipient,
        subject,
        message,
        declarationId,
        status,
        declarationType: type
      }
    });

    if (error) {
      console.error('Error sending notification:', error);
      toast.error('Erreur lors de l\'envoi de la notification');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception sending notification:', error);
    toast.error('Erreur lors de l\'envoi de la notification');
    return false;
  }
};

export const sendDeclarationNotification = async (
  template: keyof typeof emailTemplates,
  declaration: Declaration,
  recipient: string,
  params: Record<string, string> = {},
  status?: string,
  type: NotificationType = 'info'
): Promise<boolean> => {
  const emailTemplate = emailTemplates[template];
  
  if (!emailTemplate) {
    console.error(`Email template "${template}" not found`);
    return false;
  }

  // Prepare template parameters
  const templateParams = {
    userName: declaration.userName,
    course: declaration.course,
    date: new Date(declaration.date).toLocaleDateString(),
    department: declaration.department,
    rejectionReason: declaration.rejectionReason || 'Non spécifié',
    ...params
  };

  return await sendEmail({
    recipient,
    subject: emailTemplate.subject,
    message: emailTemplate.message(templateParams),
    declarationId: status ? declaration.id : undefined,
    status,
    type
  });
};

export const fetchUserNotifications = async (userEmail: string): Promise<Notification[]> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_email', userEmail)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }

    return data.map((notification: any): Notification => ({
      id: notification.id,
      userId: notification.user_id,
      userEmail: notification.user_email,
      title: notification.title,
      message: notification.message,
      read: notification.read || false,
      createdAt: notification.created_at,
      type: notification.type || 'info',
      declarationId: notification.fiche_id
    }));
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
};

export const deleteNotification = async (notificationId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      console.error('Error deleting notification:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting notification:', error);
    return false;
  }
};
