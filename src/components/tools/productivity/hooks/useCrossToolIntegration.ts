/**
 * useCrossToolIntegration.ts - Hook pour l'intégration inter-outils
 * Gère les liens entre tâches, notifications unifiées, commentaires partagés et timeline d'activité
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Task } from './useTaskManager';

interface CrossReference {
  id: string;
  sourceType: 'task' | 'note' | 'goal' | 'habit';
  sourceId: string;
  targetType: 'task' | 'note' | 'goal' | 'habit';
  targetId: string;
  linkType: 'blocks' | 'depends_on' | 'relates_to' | 'duplicates' | 'references';
  createdAt: Date;
  createdBy?: string;
  metadata?: Record<string, any>;
}

interface Notification {
  id: string;
  type: 'task_update' | 'deadline_approaching' | 'goal_progress' | 'habit_streak' | 'comment_added' | 'link_created';
  title: string;
  message: string;
  sourceType: 'task' | 'note' | 'goal' | 'habit';
  sourceId: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  createdAt: Date;
  expiresAt?: Date;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

interface Comment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  targetType: 'task' | 'note' | 'goal' | 'habit';
  targetId: string;
  createdAt: Date;
  updatedAt?: Date;
  parentId?: string; // Pour les réponses
  attachments?: Attachment[];
  mentions?: string[];
}

interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'document' | 'link' | 'file';
  url: string;
  size?: number;
  mimeType?: string;
}

interface ActivityItem {
  id: string;
  type: 'created' | 'updated' | 'completed' | 'deleted' | 'commented' | 'linked' | 'moved';
  entityType: 'task' | 'note' | 'goal' | 'habit';
  entityId: string;
  entityTitle: string;
  userId: string;
  userName: string;
  description: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface IntegrationConfig {
  enableNotifications: boolean;
  enableCrossReferences: boolean;
  enableComments: boolean;
  enableActivityTimeline: boolean;
  notificationSettings: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
}

export const useCrossToolIntegration = (config: IntegrationConfig) => {
  const [crossReferences, setCrossReferences] = useState<CrossReference[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [activityTimeline, setActivityTimeline] = useState<ActivityItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const notificationTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Charger les données depuis le localStorage
  useEffect(() => {
    if (config.enableCrossReferences) {
      const savedRefs = localStorage.getItem('productivity-cross-references');
      if (savedRefs) {
        try {
          const refs = JSON.parse(savedRefs).map((ref: any) => ({
            ...ref,
            createdAt: new Date(ref.createdAt)
          }));
          setCrossReferences(refs);
        } catch (error) {
          console.error('Erreur lors du chargement des références croisées:', error);
        }
      }
    }

    if (config.enableNotifications) {
      const savedNotifications = localStorage.getItem('productivity-notifications');
      if (savedNotifications) {
        try {
          const notifs = JSON.parse(savedNotifications).map((notif: any) => ({
            ...notif,
            createdAt: new Date(notif.createdAt),
            expiresAt: notif.expiresAt ? new Date(notif.expiresAt) : undefined
          }));
          setNotifications(notifs);
        } catch (error) {
          console.error('Erreur lors du chargement des notifications:', error);
        }
      }
    }

    if (config.enableComments) {
      const savedComments = localStorage.getItem('productivity-comments');
      if (savedComments) {
        try {
          const cmts = JSON.parse(savedComments).map((comment: any) => ({
            ...comment,
            createdAt: new Date(comment.createdAt),
            updatedAt: comment.updatedAt ? new Date(comment.updatedAt) : undefined
          }));
          setComments(cmts);
        } catch (error) {
          console.error('Erreur lors du chargement des commentaires:', error);
        }
      }
    }

    if (config.enableActivityTimeline) {
      const savedActivity = localStorage.getItem('productivity-activity');
      if (savedActivity) {
        try {
          const activities = JSON.parse(savedActivity).map((activity: any) => ({
            ...activity,
            timestamp: new Date(activity.timestamp)
          }));
          setActivityTimeline(activities);
        } catch (error) {
          console.error('Erreur lors du chargement de l\'activité:', error);
        }
      }
    }
  }, [config]);

  // Calculer le nombre de notifications non lues
  useEffect(() => {
    const count = notifications.filter(n => !n.isRead).length;
    setUnreadCount(count);
  }, [notifications]);

  // Sauvegarder les données
  const saveCrossReferences = useCallback((refs: CrossReference[]) => {
    localStorage.setItem('productivity-cross-references', JSON.stringify(refs));
    setCrossReferences(refs);
  }, []);

  const saveNotifications = useCallback((notifs: Notification[]) => {
    localStorage.setItem('productivity-notifications', JSON.stringify(notifs));
    setNotifications(notifs);
  }, []);

  const saveComments = useCallback((cmts: Comment[]) => {
    localStorage.setItem('productivity-comments', JSON.stringify(cmts));
    setComments(cmts);
  }, []);

  const saveActivity = useCallback((activities: ActivityItem[]) => {
    localStorage.setItem('productivity-activity', JSON.stringify(activities));
    setActivityTimeline(activities);
  }, []);

  // Gestion des références croisées
  const createCrossReference = useCallback((reference: Omit<CrossReference, 'id' | 'createdAt'>) => {
    if (!config.enableCrossReferences) return null;

    const newRef: CrossReference = {
      ...reference,
      id: `ref-${Date.now()}-${Math.random()}`,
      createdAt: new Date()
    };

    const updatedRefs = [...crossReferences, newRef];
    saveCrossReferences(updatedRefs);

    // Ajouter à l'activité
    addActivityItem({
      type: 'linked',
      entityType: reference.sourceType,
      entityId: reference.sourceId,
      entityTitle: `Lien vers ${reference.targetType}`,
      userId: 'current-user',
      userName: 'Utilisateur actuel',
      description: `Lien créé: ${reference.linkType}`,
      metadata: { targetType: reference.targetType, targetId: reference.targetId }
    });

    return newRef;
  }, [config.enableCrossReferences, crossReferences, saveCrossReferences]);

  const removeCrossReference = useCallback((referenceId: string) => {
    const updatedRefs = crossReferences.filter(ref => ref.id !== referenceId);
    saveCrossReferences(updatedRefs);
  }, [crossReferences, saveCrossReferences]);

  const getReferencesForEntity = useCallback((entityType: string, entityId: string) => {
    return crossReferences.filter(ref => 
      (ref.sourceType === entityType && ref.sourceId === entityId) ||
      (ref.targetType === entityType && ref.targetId === entityId)
    );
  }, [crossReferences]);

  // Gestion des notifications
  const createNotification = useCallback((notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
    if (!config.enableNotifications) return null;

    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random()}`,
      createdAt: new Date(),
      isRead: false
    };

    const updatedNotifications = [newNotification, ...notifications].slice(0, 100); // Garder seulement les 100 dernières
    saveNotifications(updatedNotifications);

    // Programmer l'expiration si nécessaire
    if (newNotification.expiresAt) {
      const timeout = setTimeout(() => {
        removeNotification(newNotification.id);
      }, newNotification.expiresAt.getTime() - Date.now());
      
      notificationTimeouts.current.set(newNotification.id, timeout);
    }

    // Notification système si activée
    if (config.notificationSettings.push && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(newNotification.title, {
          body: newNotification.message,
          icon: '/favicon.ico'
        });
      }
    }

    return newNotification;
  }, [config, notifications, saveNotifications]);

  const markNotificationAsRead = useCallback((notificationId: string) => {
    const updatedNotifications = notifications.map(notif => 
      notif.id === notificationId ? { ...notif, isRead: true } : notif
    );
    saveNotifications(updatedNotifications);
  }, [notifications, saveNotifications]);

  const markAllNotificationsAsRead = useCallback(() => {
    const updatedNotifications = notifications.map(notif => ({ ...notif, isRead: true }));
    saveNotifications(updatedNotifications);
  }, [notifications, saveNotifications]);

  const removeNotification = useCallback((notificationId: string) => {
    const timeout = notificationTimeouts.current.get(notificationId);
    if (timeout) {
      clearTimeout(timeout);
      notificationTimeouts.current.delete(notificationId);
    }

    const updatedNotifications = notifications.filter(notif => notif.id !== notificationId);
    saveNotifications(updatedNotifications);
  }, [notifications, saveNotifications]);

  // Gestion des commentaires
  const addComment = useCallback((comment: Omit<Comment, 'id' | 'createdAt'>) => {
    if (!config.enableComments) return null;

    const newComment: Comment = {
      ...comment,
      id: `comment-${Date.now()}-${Math.random()}`,
      createdAt: new Date()
    };

    const updatedComments = [...comments, newComment];
    saveComments(updatedComments);

    // Créer une notification pour les mentions
    if (comment.mentions && comment.mentions.length > 0) {
      createNotification({
        type: 'comment_added',
        title: 'Nouveau commentaire',
        message: `${comment.authorName} vous a mentionné dans un commentaire`,
        sourceType: comment.targetType,
        sourceId: comment.targetId,
        priority: 'medium'
      });
    }

    // Ajouter à l'activité
    addActivityItem({
      type: 'commented',
      entityType: comment.targetType,
      entityId: comment.targetId,
      entityTitle: 'Commentaire ajouté',
      userId: comment.authorId,
      userName: comment.authorName,
      description: comment.content.substring(0, 100) + (comment.content.length > 100 ? '...' : '')
    });

    return newComment;
  }, [config.enableComments, comments, saveComments, createNotification]);

  const updateComment = useCallback((commentId: string, updates: Partial<Comment>) => {
    const updatedComments = comments.map(comment => 
      comment.id === commentId 
        ? { ...comment, ...updates, updatedAt: new Date() }
        : comment
    );
    saveComments(updatedComments);
  }, [comments, saveComments]);

  const deleteComment = useCallback((commentId: string) => {
    const updatedComments = comments.filter(comment => comment.id !== commentId);
    saveComments(updatedComments);
  }, [comments, saveComments]);

  const getCommentsForEntity = useCallback((entityType: string, entityId: string) => {
    return comments
      .filter(comment => comment.targetType === entityType && comment.targetId === entityId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }, [comments]);

  // Gestion de l'activité
  const addActivityItem = useCallback((activity: Omit<ActivityItem, 'id' | 'timestamp'>) => {
    if (!config.enableActivityTimeline) return;

    const newActivity: ActivityItem = {
      ...activity,
      id: `activity-${Date.now()}-${Math.random()}`,
      timestamp: new Date()
    };

    const updatedActivity = [newActivity, ...activityTimeline].slice(0, 500); // Garder seulement les 500 dernières
    saveActivity(updatedActivity);
  }, [config.enableActivityTimeline, activityTimeline, saveActivity]);

  const getActivityForEntity = useCallback((entityType: string, entityId: string) => {
    return activityTimeline
      .filter(activity => activity.entityType === entityType && activity.entityId === entityId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [activityTimeline]);

  const getRecentActivity = useCallback((limit: number = 20) => {
    return activityTimeline
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }, [activityTimeline]);

  // Fonctions utilitaires
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }, []);

  const getEntityTitle = useCallback((entityType: string, entityId: string) => {
    // En production, ceci ferait un appel pour récupérer le titre réel
    return `${entityType} ${entityId}`;
  }, []);

  // Nettoyage des timeouts
  useEffect(() => {
    return () => {
      notificationTimeouts.current.forEach(timeout => clearTimeout(timeout));
      notificationTimeouts.current.clear();
    };
  }, []);

  // Nettoyage automatique des notifications expirées
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const validNotifications = notifications.filter(notif => 
        !notif.expiresAt || notif.expiresAt > now
      );
      
      if (validNotifications.length !== notifications.length) {
        saveNotifications(validNotifications);
      }
    }, 60000); // Vérifier chaque minute

    return () => clearInterval(interval);
  }, [notifications, saveNotifications]);

  return {
    // Références croisées
    crossReferences,
    createCrossReference,
    removeCrossReference,
    getReferencesForEntity,
    
    // Notifications
    notifications,
    unreadCount,
    createNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    removeNotification,
    requestNotificationPermission,
    
    // Commentaires
    comments,
    addComment,
    updateComment,
    deleteComment,
    getCommentsForEntity,
    
    // Activité
    activityTimeline,
    addActivityItem,
    getActivityForEntity,
    getRecentActivity,
    
    // Utilitaires
    getEntityTitle
  };
};

// Hook pour les notifications en temps réel
export const useRealTimeNotifications = () => {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback((url: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket(url);
      
      ws.onopen = () => {
        setIsConnected(true);
        console.log('Connexion WebSocket établie');
      };
      
      ws.onclose = () => {
        setIsConnected(false);
        console.log('Connexion WebSocket fermée');
      };
      
      ws.onerror = (error) => {
        console.error('Erreur WebSocket:', error);
        setIsConnected(false);
      };
      
      wsRef.current = ws;
    } catch (error) {
      console.error('Erreur lors de la connexion WebSocket:', error);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    connect,
    disconnect,
    sendMessage
  };
};