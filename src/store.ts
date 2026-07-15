import { useState, useEffect } from 'react';
import type { Client, Project, ChangeRequest, Activity, User } from './types';

const STORAGE_KEYS = {
  USER: 'scopesnap_user',
  CLIENTS: 'scopesnap_clients',
  PROJECTS: 'scopesnap_projects',
  CHANGE_REQUESTS: 'scopesnap_change_requests',
  ACTIVITIES: 'scopesnap_activities',
};

// ============ Storage helpers ============
function getItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('localStorage setItem error:', error);
  }
}

function removeItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('localStorage removeItem error:', error);
  }
}

// ============ Global user state (using singleton) ============
let globalUser: User | null = null;
const userListeners: Set<(user: User | null) => void> = new Set();

function notifyUserListeners() {
  userListeners.forEach((listener) => listener(globalUser));
}

function setGlobalUser(user: User | null) {
  globalUser = user;
  if (user) {
    setItem(STORAGE_KEYS.USER, user);
  } else {
    removeItem(STORAGE_KEYS.USER);
  }
  notifyUserListeners();
}

function initGlobalUser() {
  if (globalUser === null) {
    globalUser = getItem<User | null>(STORAGE_KEYS.USER, null);
  }
  return globalUser;
}

initGlobalUser();

// Generate unique ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Generate share link
export function generateShareLink(projectId: string): string {
  return `share-${projectId}-${generateId()}`;
}

// ============ User hook (singleton pattern) ============
export function useUser() {
  const [user, setUser] = useState<User | null>(globalUser);

  useEffect(() => {
    const listener = (newUser: User | null) => {
      setUser(newUser);
    };
    userListeners.add(listener);
    return () => {
      userListeners.delete(listener);
    };
  }, []);

  const login = (userData: User) => {
    setGlobalUser(userData);
  };

  const logout = () => {
    setGlobalUser(null);
  };

  return { user, login, logout };
}

// ============ Clients hook ============
export function useClients() {
  const [clients, setClients] = useState<Client[]>(() => getItem(STORAGE_KEYS.CLIENTS, []));

  useEffect(() => {
    setItem(STORAGE_KEYS.CLIENTS, clients);
  }, [clients]);

  const addClient = (client: Omit<Client, 'id' | 'createdAt'>) => {
    const newClient: Client = {
      ...client,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setClients([...clients, newClient]);
    return newClient;
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    setClients(clients.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteClient = (id: string) => {
    setClients(clients.filter((c) => c.id !== id));
  };

  return { clients, addClient, updateClient, deleteClient };
}

// ============ Projects hook ============
export function useProjects() {
  const [projects, setProjects] = useState<Project[]>(() => getItem(STORAGE_KEYS.PROJECTS, []));

  useEffect(() => {
    setItem(STORAGE_KEYS.PROJECTS, projects);
  }, [projects]);

  const addProject = (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'shareLink'>) => {
    const newProject: Project = {
      ...project,
      id: generateId(),
      shareLink: generateShareLink(generateId()),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjects([...projects, newProject]);
    return newProject;
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(
      projects.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p))
    );
  };

  const deleteProject = (id: string) => {
    setProjects(projects.filter((p) => p.id !== id));
  };

  return { projects, addProject, updateProject, deleteProject };
}

// ============ Change Requests hook ============
export function useChangeRequests() {
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>(() =>
    getItem(STORAGE_KEYS.CHANGE_REQUESTS, [])
  );

  useEffect(() => {
    setItem(STORAGE_KEYS.CHANGE_REQUESTS, changeRequests);
  }, [changeRequests]);

  const addChangeRequest = (request: Omit<ChangeRequest, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newRequest: ChangeRequest = {
      ...request,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setChangeRequests([...changeRequests, newRequest]);
    return newRequest;
  };

  const updateChangeRequest = (id: string, updates: Partial<ChangeRequest>) => {
    setChangeRequests(
      changeRequests.map((cr) => (cr.id === id ? { ...cr, ...updates, updatedAt: new Date().toISOString() } : cr))
    );
  };

  const deleteChangeRequest = (id: string) => {
    setChangeRequests(changeRequests.filter((cr) => cr.id !== id));
  };

  return { changeRequests, addChangeRequest, updateChangeRequest, deleteChangeRequest };
}

// ============ Activities hook ============
export function useActivities() {
  const [activities, setActivities] = useState<Activity[]>(() =>
    getItem(STORAGE_KEYS.ACTIVITIES, [])
  );

  useEffect(() => {
    setItem(STORAGE_KEYS.ACTIVITIES, activities);
  }, [activities]);

  const addActivity = (activity: Omit<Activity, 'id' | 'timestamp'>) => {
    const newActivity: Activity = {
      ...activity,
      id: generateId(),
      timestamp: new Date().toISOString(),
    };
    setActivities([newActivity, ...activities]);
    return newActivity;
  };

  const getProjectActivities = (projectId: string) => {
    return activities.filter((a) => a.projectId === projectId);
  };

  return { activities, addActivity, getProjectActivities };
}

// ============ Helpers ============
export function getClientById(clients: Client[], id: string): Client | undefined {
  return clients.find((c) => c.id === id);
}

export function getProjectByShareLink(projects: Project[], shareLink: string): Project | undefined {
  return projects.find((p) => p.shareLink === shareLink);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'الآن';
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  if (diffDays < 7) return `منذ ${diffDays} يوم`;
  return formatDate(dateString);
}
