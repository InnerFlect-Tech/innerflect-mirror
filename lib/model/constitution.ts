/**
 * Settings is the company constitution: machine-readable boundaries on what the
 * system may know, access and do. Everything here is a limit, which is why each
 * entry names who can change it — a boundary nobody owns is not a boundary.
 */
export type AuthorityLimit = {
  id: string;
  action: string;
  autonomousUpTo: string;
  requiresApproval: string;
  owner: string;
};

export type Integration = {
  id: string;
  name: string;
  purpose: string;
  access: 'read' | 'read-write';
  status: 'connected' | 'degraded' | 'not-connected';
  lastSync: string;
};

export type DataScope = {
  id: string;
  source: string;
  includes: string;
  excluded: string;
};

export type RoleGrant = {
  id: string;
  role: string;
  people: number;
  canApprove: string;
};

export type ModelPermission = {
  id: string;
  capability: string;
  allowed: boolean;
  note: string;
};
