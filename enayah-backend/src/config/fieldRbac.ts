export const FIELD_RBAC = {
  employees: {
    admin: {
      read: '*',
      write: '*',
    },

    hr: {
      read: '*',
      write: '*',
    },

    director: {
      read: [
        'id',
        'employeeNumber',
        'firstName',
        'familyName',
        'departmentId',
        'positionId',
        'managerId',
        'createdAt',
      ],
      write: ['managerId'],
    },

    manager: {
      read: [
        'id',
        'employeeNumber',
        'firstName',
        'familyName',
        'departmentId',
        'positionId',
        'managerId',
      ],
      write: [],
    },

    employee: {
      read: [
        'id',
        'employeeNumber',
        'firstName',
        'familyName',
        'positionId',
        'departmentId',
      ],
      write: [],
    },
  },
} as const
