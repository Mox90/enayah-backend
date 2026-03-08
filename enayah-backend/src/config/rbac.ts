export const RBAC = {
  employees: {
    read: ['admin', 'hr', 'director', 'manager', 'employee'],
    //readOwn: ['employee'],

    create: ['admin', 'hr', 'director'],
    update: ['admin', 'hr', 'director', 'manager'],
    delete: ['admin', 'hr'],
  },
} as const
