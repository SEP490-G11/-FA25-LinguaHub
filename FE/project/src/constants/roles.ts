// Backend roles: 'Admin' | 'Tutor' | 'Learner'
export const USER_ROLES = {
    LEARNER: 'Learner',
    TUTOR: 'Tutor',
    ADMIN: 'Admin',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];