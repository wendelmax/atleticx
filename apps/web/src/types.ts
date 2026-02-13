import type { Membership, Organization, PlatformRole, UserProfile } from "@atleticx/shared";

export interface SessionState {
  uid: string;
  email: string;
  displayName: string;
}

export interface UserContextData {
  profile?: UserProfile;
  memberships: Membership[];
  organizations: Organization[];
  selectedOrganizationId?: string;
  selectedRole?: PlatformRole;
}
