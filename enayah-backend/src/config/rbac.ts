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
  employeeAppraisals: {
    read: ['admin', 'hr', 'manager', 'director', 'employee'],
    update: ['admin', 'hr', 'manager', 'director', 'employee'],
    create: ['admin', 'hr', 'manager', 'director'],
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
