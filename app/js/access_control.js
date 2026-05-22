import {
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    query,
    where
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { hasPermission, PERMISSIONS } from "./permissions.js";

export const FEATURES = {
    recruitModule: "recruitModule",
    careerPortal: "careerPortal",
    shareProfile: "shareProfile",
    dialer: "dialer",
    qrBridgeLogin: "qrBridgeLogin",
    advancedAnalytics: "advancedAnalytics"
};

export const PLAN_CATALOG = {
    starter: {
        id: "starter",
        name: "Starter",
        priceMonthly: 1499,
        maxUsers: 1,
        features: Object.values(FEATURES),
        customDomain: false
    },
    professional: {
        id: "professional",
        name: "Professional",
        priceMonthly: 2999,
        maxUsers: 3,
        features: Object.values(FEATURES),
        customDomain: false
    },
    enterprise: {
        id: "enterprise",
        name: "Enterprise",
        priceMonthly: 8999,
        maxUsers: 8,
        features: Object.values(FEATURES),
        customDomain: true
    },
    custom: {
        id: "custom",
        name: "Custom",
        priceMonthly: null,
        maxUsers: null,
        features: Object.values(FEATURES),
        configurable: true,
        customDomain: true
    }
};

const ACTIVE_STATUSES = new Set(["trialing", "active", "grace"]);
const RESERVED_HOSTS = new Set([
    "anchan31",
    "access",
    "app",
    "candidate",
    "careers",
    "dialer",
    "share",
    "nextgenudaan",
    "www",
    "localhost",
    "127"
]);

const MODULE_PERMISSIONS = {
    [FEATURES.recruitModule]: [PERMISSIONS.fullAccess, PERMISSIONS.manageJobs, PERMISSIONS.manageCandidates, PERMISSIONS.readOnly],
    [FEATURES.careerPortal]: [PERMISSIONS.fullAccess, PERMISSIONS.manageJobs, PERMISSIONS.readOnly],
    [FEATURES.shareProfile]: [PERMISSIONS.fullAccess, PERMISSIONS.shareProfiles],
    [FEATURES.dialer]: [PERMISSIONS.fullAccess, PERMISSIONS.useDialer],
    [FEATURES.qrBridgeLogin]: [PERMISSIONS.fullAccess, PERMISSIONS.useQrBridgeLogin]
};

export function normalizeClientId(value = "") {
    return value.toString().toLowerCase().trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "")
        .replace(/--+/g, "-")
        .replace(/^-+/, "")
        .replace(/-+$/, "");
}

export function getTenantFromHost() {
    const host = window.location.hostname.toLowerCase();
    if (!host || host === "localhost" || host === "127.0.0.1") return "";
    const parts = host.split(".");
    if (parts.length < 3) return "";
    const subdomain = normalizeClientId(parts[0]);
    return RESERVED_HOSTS.has(subdomain) ? "" : subdomain;
}

export function resolvePlanLimits(subscription = {}, company = {}) {
    const plan = PLAN_CATALOG[subscription.plan || company.plan] || PLAN_CATALOG.starter;
    const customLimits = subscription.customLimits || company.customLimits || {};
    const customFeatures = subscription.customFeatures || company.features;

    return {
        plan: plan.id,
        maxUsers: Number(customLimits.maxUsers || subscription.maxUsers || company.maxUsers || plan.maxUsers || 1),
        features: Array.isArray(customFeatures) && customFeatures.length ? customFeatures : plan.features,
        priceMonthly: customLimits.priceMonthly ?? subscription.priceMonthly ?? plan.priceMonthly
    };
}

export function isSubscriptionUsable(subscription) {
    if (!subscription || !ACTIVE_STATUSES.has(subscription.status)) return false;

    const expiry = subscription.currentPeriodEnd || subscription.trialEndsAt || subscription.expiresAt;
    if (!expiry) return true;

    const expiryDate = expiry.seconds ? new Date(expiry.seconds * 1000) : new Date(expiry);
    if (Number.isNaN(expiryDate.getTime())) return true;

    const graceDays = Number(subscription.gracePeriodDays || 0);
    const accessUntil = new Date(expiryDate);
    accessUntil.setDate(accessUntil.getDate() + graceDays);
    return accessUntil >= new Date();
}

export function blockedReason(subscription) {
    if (!subscription) return "No active subscription is linked to this workspace.";
    if (!ACTIVE_STATUSES.has(subscription.status)) return `Subscription status is ${subscription.status}.`;
    if (!isSubscriptionUsable(subscription)) return "Subscription period has expired.";
    return "This module is not enabled for this workspace.";
}

export async function loadCompanyByClientId(db, clientId) {
    const normalized = normalizeClientId(clientId);
    if (!normalized) return null;

    const direct = await getDoc(doc(db, "companies", normalized));
    if (direct.exists()) return { id: direct.id, ...direct.data() };

    for (const field of ["companyId", "clientId", "subdomain"]) {
        const snap = await getDocs(query(collection(db, "companies"), where(field, "==", normalized), limit(1)));
        if (!snap.empty) return { id: snap.docs[0].id, ...snap.docs[0].data() };
    }

    return null;
}

export async function loadTenantAccess(db, clientId) {
    const company = await loadCompanyByClientId(db, clientId);
    if (!company) {
        return { allowed: false, company: null, subscription: null, reason: "Workspace not found." };
    }

    const subscriptionId = company.subscriptionId;
    const subscriptionSnap = subscriptionId ? await getDoc(doc(db, "subscriptions", subscriptionId)) : null;
    const subscription = subscriptionSnap?.exists() ? { id: subscriptionSnap.id, ...subscriptionSnap.data() } : null;

    if (company.status !== "active") {
        return { allowed: false, company, subscription, reason: "Workspace is inactive." };
    }
    if (!isSubscriptionUsable(subscription)) {
        return { allowed: false, company, subscription, reason: blockedReason(subscription) };
    }

    return { allowed: true, company, subscription, reason: "" };
}

export function tenantHasFeature(company, subscription, featureKey) {
    if (!company || company.status !== "active" || !isSubscriptionUsable(subscription)) return false;
    return resolvePlanLimits(subscription, company).features.includes(featureKey);
}

export async function verifyTenantModule(db, clientId, featureKey) {
    const access = await loadTenantAccess(db, clientId);
    if (!access.allowed) return access;
    if (!tenantHasFeature(access.company, access.subscription, featureKey)) {
        return { ...access, allowed: false, reason: blockedReason(access.subscription) };
    }
    return access;
}

export function userBelongsToTenant(userProfile, clientId) {
    const requested = normalizeClientId(clientId);
    const actual = normalizeClientId(userProfile?.companyId || userProfile?.clientId || userProfile?.subdomain);
    return Boolean(requested && actual && requested === actual);
}

export function roleCanAccessModule(role, featureKey) {
    const permissions = MODULE_PERMISSIONS[featureKey] || [PERMISSIONS.fullAccess];
    return permissions.some((permission) => hasPermission(role, permission));
}

export async function verifyUserModuleAccess(db, userProfile, clientId, featureKey) {
    if (!userProfile || userProfile.status !== "active") {
        return { allowed: false, reason: "Your account is inactive or not provisioned." };
    }
    if (!userBelongsToTenant(userProfile, clientId)) {
        return { allowed: false, reason: "This login does not belong to this workspace." };
    }

    const access = await verifyTenantModule(db, clientId, featureKey);
    if (!access.allowed) return access;

    if (!roleCanAccessModule(userProfile.role, featureKey)) {
        return { ...access, allowed: false, reason: "Your role cannot access this module." };
    }

    return access;
}
