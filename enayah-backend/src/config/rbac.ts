import { update } from '../modules/employees/employees.controller'

export const RBAC = {
  employees: {
    read: ['admin', 'hr', 'director', 'manager', 'employee'],
    //readOwn: ['employee'],

    create: ['admin', 'hr'],
    update: ['admin', 'hr', 'director', 'manager'],
    delete: ['admin', 'hr'],
  },
  anomalies: {
    read: ['admin', 'hr', 'director'],
    update: ['admin', 'hr'],
  },
  legalHold: {
    read: ['admin', 'hr'],
    update: ['admin', 'hr'],
    create: ['admin', 'hr'],
  },
} as const

/*

anomalies: {
  admin: ['read', 'update'],
  hr: ['read', 'update'],
  director: ['read'],
  manager: [],
  employee: [],
},

*/
