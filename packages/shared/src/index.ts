export type PlatformRole =
  | "super_admin"
  | "academy_admin"
  | "coach"
  | "staff"
  | "athlete"
  | "guardian";

export type MembershipStatus = "active" | "inactive" | "pending";

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  ownerUid: string;
  createdAt: string;
}

export interface ClassRoom {
  id: string;
  organizationId: string;
  name: string;
  modality: string;
  level: string;
  coachUid: string;
  createdAt: string;
}

export interface Membership {
  id: string;
  organizationId: string;
  userUid: string;
  roles: PlatformRole[];
  classIds: string[];
  status: MembershipStatus;
  createdBy: string;
  createdAt: string;
}

export interface InviteToken {
  id: string;
  token: string;
  organizationId: string;
  classId?: string;
  role: PlatformRole;
  status: "available" | "used" | "expired" | "revoked";
  expiresAt: string;
  createdAt: string;
  createdBy: string;
  usedByUid?: string;
  usedAt?: string;
}

export const webRoles: PlatformRole[] = [
  "super_admin",
  "academy_admin",
  "coach",
  "staff"
];

export const appRoles: PlatformRole[] = ["athlete", "guardian", "coach"];

export const canManageInvites = (role: PlatformRole) =>
  role === "super_admin" || role === "academy_admin" || role === "coach";

export const canManageOrganization = (role: PlatformRole) =>
  role === "super_admin" || role === "academy_admin";

export const canSubmitEvidence = (role: PlatformRole) =>
  role === "athlete" || role === "guardian";
