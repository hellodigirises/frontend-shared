import { Agent } from '../Lead_CRM/crmTypes';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatarUrl?: string;
  address?: string;
  source?: string;
  projectId?: string;
  unitId?: string;
  bookingDate?: string;
  possessionDate?: string;
  handoverDate?: string;
  transferDate?: string;
  status: string;
  notes?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  agent?: Agent;
  project?: { id: string, name: string };
}

export interface CreateCustomerDto {
  name: string;
  phone: string;
  email?: string;
  avatarUrl?: string;
  address?: string;
  source?: string;
  userId?: string;
  projectId?: string;
  unitId?: string;
  bookingDate?: string;
  possessionDate?: string;
  handoverDate?: string;
  transferDate?: string;
  notes?: string;
}
