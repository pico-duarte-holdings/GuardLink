/*
Copyright 2026 Pico Duarte Holdings LLC. All rights reserved.
This code, design, and associated assets may not be reproduced, distributed, or transmitted in any form or by any means without prior written permission.
*/
export interface Interaction {
  element: string;
  timestamp: string;
  type: 'click' | 'view';
}

export interface Lead {
  id?: string;
  timestamp: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  age: string;
  education: string;
  interest: string;
  mos: string;
  source: string;
  message: string;
  status: 'New' | 'Contacted' | 'Appointment' | 'ASVAB' | 'Physical' | 'Waiver' | 'Qualified' | 'Enlisted';
  notes?: any[] | string;
  interactions?: Interaction[];
  platoon?: string;
  recruiterId?: string;
  pipelineStage?: number;
  totalXP?: number;
  slug?: string;
  referralCount?: number;
}

export interface Subscription {
  id?: string;
  timestamp: string;
  name: string;
  email: string;
  phone: string;
  optIn: boolean;
}

export const MOS_DATA = [
  { 
    code: '11B', 
    title: 'Infantryman', 
    category: 'Combat',
    asvab: 'CO: 87',
    physical: 'Heavy',
    location: 'Orlando, Miami, Tampa, Jacksonville, Tallahassee, Pensacola, Fort Myers', 
    description: 'The backbone of the Army; responsible for defending our country against any threat.' 
  },
  { 
    code: '12B', 
    title: 'Combat Engineer', 
    category: 'Combat',
    asvab: 'CO: 87',
    physical: 'Heavy',
    location: 'Jacksonville, Tallahassee, Brooksville, Palatka', 
    description: 'Construct bridges, clear obstacles, and use explosives to support combat operations.' 
  },
  { 
    code: '17C', 
    title: 'Cyber Operations Specialist', 
    category: 'Cyber',
    asvab: 'GT: 110, ST: 112',
    physical: 'Moderate',
    location: 'Miami, Tampa, Orlando', 
    description: 'Defend the nation against cyber threats and conduct offensive cyberspace operations.' 
  },
  { 
    code: '25B', 
    title: 'Information Technology Specialist', 
    category: 'Technology',
    asvab: 'ST: 95',
    physical: 'Moderate',
    location: 'St. Augustine, Tampa, Orlando, Miami, Jacksonville', 
    description: 'Maintain, process, and troubleshoot military computer systems and networks.' 
  },
  { 
    code: '31B', 
    title: 'Military Police', 
    category: 'Law Enforcement',
    asvab: 'ST: 91',
    physical: 'Significant',
    location: 'Miami, Orlando, Tampa, Tallahassee', 
    description: 'Protect lives and property on Army installations by enforcing military laws.' 
  },
  { 
    code: '68W', 
    title: 'Combat Medic Specialist', 
    category: 'Medical',
    asvab: 'ST: 101',
    physical: 'Significant',
    location: 'Tampa, St. Augustine, Miami, Orlando, Jacksonville', 
    description: 'Provide emergency medical treatment on the battlefield and in clinics.' 
  },
  { 
    code: '88M', 
    title: 'Motor Transport Operator', 
    category: 'Logistics',
    asvab: 'OF: 85',
    physical: 'Heavy',
    location: 'Various Locations (Statewide)', 
    description: 'Operate wheel vehicles to transport personnel and cargo.' 
  },
  { 
    code: '92Y', 
    title: 'Unit Supply Specialist', 
    category: 'Logistics',
    asvab: 'CL: 90',
    physical: 'Moderate',
    location: 'Various Locations (Statewide)', 
    description: 'Manage and maintain all Army equipment and supplies.' 
  },
];

export const RANKS = ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8', 'E9'];
