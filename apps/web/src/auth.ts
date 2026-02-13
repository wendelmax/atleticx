import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth";
import {
  collectionGroup,
  doc,
  documentId,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where
} from "firebase/firestore";
import type { Membership, Organization, UserProfile } from "@atleticx/shared";
import { auth, db, googleProvider } from "./firebase";
import type { SessionState, UserContextData } from "./types";

const toISOString = () => new Date().toISOString();

export const useAuthSession = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [context, setContext] = useState<UserContextData>({
    memberships: [],
    organizations: []
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setContext({ memberships: [], organizations: [] });
        setLoading(false);
        return;
      }

      const profile: UserProfile = {
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName ?? firebaseUser.email ?? "Usuario",
        email: firebaseUser.email ?? "",
        photoURL: firebaseUser.photoURL ?? undefined,
        createdAt: toISOString(),
        updatedAt: toISOString()
      };

      await setDoc(
        doc(db, "users", firebaseUser.uid),
        {
          ...profile,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );

      const membershipsSnapshot = await getDocs(
        query(collectionGroup(db, "members"), where(documentId(), "==", firebaseUser.uid), where("status", "==", "active"))
      );

      const memberships = membershipsSnapshot.docs.map(
        (entry) =>
          ({
            id: entry.id,
            ...entry.data()
          }) as Membership
      );

      const organizationIds = Array.from(new Set(memberships.map((membership) => membership.organizationId)));
      const organizations: Organization[] = [];

      for (const organizationId of organizationIds) {
        const organizationDoc = await getDoc(doc(db, "organizations", organizationId));
        if (organizationDoc.exists()) {
          organizations.push({
            id: organizationDoc.id,
            ...(organizationDoc.data() as Omit<Organization, "id">)
          });
        }
      }

      setContext({
        profile,
        memberships,
        organizations,
        selectedOrganizationId: organizations[0]?.id,
        selectedRole: memberships[0]?.roles?.[0]
      });
      setLoading(false);
    });
    return unsubscribe;
  }, [refreshKey]);

  const session = useMemo<SessionState | null>(() => {
    if (!user || !user.email) {
      return null;
    }
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName ?? user.email
    };
  }, [user]);

  return {
    session,
    loading,
    context,
    signInWithGoogle: async () => signInWithPopup(auth, googleProvider),
    logout: async () => signOut(auth),
    refreshContext: () => setRefreshKey((value) => value + 1)
  };
};
