/** 
 * NEXTGEN RECRUITMENT ECOSYSTEM - RBAC SYNCHRONIZATION
 * This file mirrors the permissions and role definitions from the central Access Portal.
 */

export const PERMISSIONS = {
    fullAccess: "full_access",
    manageUsers: "manage_users",
    manageRoles: "manage_roles",
    manageBilling: "manage_billing",
    manageJobs: "manage_jobs",
    manageCandidates: "manage_candidates",
    useDialer: "use_dialer",
    shareProfiles: "share_profiles",
    readOnly: "read_only",
    viewAnalytics: "view_analytics",
    useQrBridgeLogin: "use_qr_bridge_login"
};

export const ROLE_DEFINITIONS = {
    owner: {
        id: "owner",
        label: "Owner",
        permissions: Object.values(PERMISSIONS)
    },
    admin: {
        id: "admin",
        label: "Admin",
        permissions: [
            PERMISSIONS.manageUsers,
            PERMISSIONS.manageRoles,
            PERMISSIONS.manageJobs,
            PERMISSIONS.manageCandidates,
            PERMISSIONS.shareProfiles,
            PERMISSIONS.readOnly,
            PERMISSIONS.viewAnalytics
        ]
    },
    recruiter: {
        id: "recruiter",
        label: "Recruiter",
        permissions: [
            PERMISSIONS.manageCandidates,
            PERMISSIONS.useDialer,
            PERMISSIONS.shareProfiles,
            PERMISSIONS.readOnly
        ]
    },
    viewer: {
        id: "viewer",
        label: "Viewer",
        permissions: [PERMISSIONS.readOnly]
    }
};

/**
 * Checks if a role has a specific permission.
 * @param {string} roleId - The role ID (e.g., 'owner', 'admin').
 * @param {string} permission - The permission key from PERMISSIONS.
 * @returns {boolean}
 */
export function hasPermission(roleId, permission) {
    const role = ROLE_DEFINITIONS[roleId] || ROLE_DEFINITIONS.viewer;
    return role.permissions.includes(PERMISSIONS.fullAccess) || role.permissions.includes(permission);
}

/** Legacy support for old functions while migrating to granular RBAC */
export function isManagerUp(roleId) {
    return roleId === 'owner' || roleId === 'admin' || roleId === 'manager';
}

export function isWriter(roleId) {
    return roleId !== 'viewer';
}

export function canReadOwnedDoc(roleId, doc, uid) {
    if (!doc || !uid) return false;
    if (isManagerUp(roleId)) return true;
    if (doc.ownerId === uid) return true;
    const assigned = doc.assignedTo;
    return Array.isArray(assigned) && assigned.includes(uid);
}

export function canManageUsers(roleId) {
    return hasPermission(roleId, PERMISSIONS.manageUsers);
}

export function canEditSharedData(roleId) {
    return isManagerUp(roleId) || hasPermission(roleId, PERMISSIONS.manageJobs);
}

export function canViewAudit(roleId) {
    return hasPermission(roleId, PERMISSIONS.viewAnalytics) || isManagerUp(roleId);
}

export const ROLES = {
    ADMIN: "admin",
    MANAGER: "manager",
    RECRUITER: "recruiter",
    VIEWER: "viewer"
};
