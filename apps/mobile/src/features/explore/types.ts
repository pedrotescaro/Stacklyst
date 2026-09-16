import { Person } from '../../lib/types';
export interface Company {
  id: string;
  name: string;
  owner_id: string;
  description?: string;
  website?: string;
  location?: string;
}
export interface Job {
  id: string;
  title: string;
  description: string;
  status: string;
  company: Company;
  company_id: string;
  level: string;
  modality: string;
  contract_type: string;
  technologies: string[];
  requirements: string[];
  benefits: string[];
  userApplication?: { status: string; feedback?: string };
  stages: { id: string; title: string; order: number }[];
}
export interface Event {
  id: string;
  title: string;
  description: string;
  status: string;
  start_date: string;
  end_date: string;
  creator_id: string;
  xp_reward: number;
  isParticipating?: boolean;
  isParticipant?: boolean;
  participants?: { user: Person; user_id: string }[];
  min_level: number;
}
export interface Community {
  id: string;
  name: string;
  description: string;
  slug: string;
  isMember: boolean;
  memberCount: number;
  userRole?: string;
  ownerId?: string;
  owner?: Person;
  members?: { id: string; user: Person; role: string }[];
}
