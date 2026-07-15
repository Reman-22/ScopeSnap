// Types for ScopeSnap Application

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'freelancer' | 'client';
};

export type Client = {
  id: string;
  name: string;
  email: string;
  company?: string;
  createdAt: string;
};

export type ScopeItem = {
  id: string;
  title: string;
  description?: string;
  status: 'included' | 'excluded' | 'pending';
};

export type ScopeSection = {
  id: string;
  title: string;
  items: ScopeItem[];
};

export type ProjectStatus = 'draft' | 'sent' | 'approved' | 'in-progress' | 'completed';

export type Project = {
  id: string;
  name: string;
  description?: string;
  clientId: string;
  status: ProjectStatus;
  scopeSections: ScopeSection[];
  shareLink: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type ChangeRequestStatus = 'pending' | 'accepted' | 'rejected';

export type ChangeRequest = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  itemId?: string; // Optional: link to specific scope item
  status: ChangeRequestStatus;
  reason?: string; // Reason for acceptance/rejection
  createdAt: string;
  updatedAt: string;
};

export type ActivityType = 
  | 'project_created'
  | 'project_updated'
  | 'item_added'
  | 'item_updated'
  | 'item_deleted'
  | 'scope_sent'
  | 'scope_approved'
  | 'change_requested'
  | 'change_accepted'
  | 'change_rejected';

export type Activity = {
  id: string;
  projectId: string;
  type: ActivityType;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
};
