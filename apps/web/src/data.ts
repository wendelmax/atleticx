import { addDoc, collection, doc, getDocs, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import type { ClassRoom, PlatformRole } from "@atleticx/shared";
import { db, functions } from "./firebase";

export const createOrganization = async (name: string, slug: string, ownerUid: string) => {
  const ref = await addDoc(collection(db, "organizations"), {
    name,
    slug,
    ownerUid,
    createdAt: serverTimestamp()
  });
  await setDoc(doc(db, "organizations", ref.id, "members", ownerUid), {
    organizationId: ref.id,
    userUid: ownerUid,
    roles: ["academy_admin"],
    classIds: [],
    status: "active",
    createdBy: ownerUid,
    createdAt: serverTimestamp()
  });
  return ref.id;
};

export const createClassRoom = async (payload: Omit<ClassRoom, "id" | "createdAt">, creatorUid: string) => {
  const ref = await addDoc(collection(db, "classes"), {
    ...payload,
    createdBy: creatorUid,
    createdAt: serverTimestamp()
  });
  return ref.id;
};

export const createInviteToken = async ({
  organizationId,
  classId,
  role,
  expiresInDays
}: {
  organizationId: string;
  classId?: string;
  role: PlatformRole;
  expiresInDays: number;
}) => {
  const callable = httpsCallable<
    { organizationId: string; classId?: string; role: PlatformRole; expiresInDays: number },
    { id: string; token: string }
  >(functions, "createInviteToken");
  const response = await callable({
    organizationId,
    classId,
    role,
    expiresInDays
  });
  return response.data;
};

export const listClassRooms = async (organizationId: string) => {
  const snapshot = await getDocs(query(collection(db, "classes"), where("organizationId", "==", organizationId)));
  return snapshot.docs.map(
    (entry) =>
      ({
        id: entry.id,
        ...entry.data()
      }) as ClassRoom
  );
};
