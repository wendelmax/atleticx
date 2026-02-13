import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue, Timestamp } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/https";

initializeApp();
const db = getFirestore();

type PlatformRole = "super_admin" | "academy_admin" | "coach" | "staff" | "athlete" | "guardian";

const canManage = (roles: PlatformRole[]) =>
  roles.includes("super_admin") || roles.includes("academy_admin") || roles.includes("coach");

const randomToken = () => Math.random().toString(36).slice(2, 8).toUpperCase();

export const createInviteToken = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Usuario nao autenticado.");
  }
  const uid = request.auth.uid;

  const { organizationId, classId, role, expiresInDays } = request.data as {
    organizationId: string;
    classId?: string;
    role: PlatformRole;
    expiresInDays: number;
  };

  if (!organizationId || !role || !expiresInDays) {
    throw new HttpsError("invalid-argument", "Parametros invalidos.");
  }

  const memberRef = db.doc(`organizations/${organizationId}/members/${uid}`);
  const memberDoc = await memberRef.get();
  if (!memberDoc.exists) {
    throw new HttpsError("permission-denied", "Usuario sem acesso a academia.");
  }

  const member = memberDoc.data() as { roles: PlatformRole[]; status: string };
  if (member.status !== "active" || !canManage(member.roles)) {
    throw new HttpsError("permission-denied", "Usuario sem permissao para gerar token.");
  }

  const token = `ATX-${randomToken()}`;
  const expiresAt = Timestamp.fromDate(new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000));
  const ref = await db.collection("inviteTokens").add({
    token,
    organizationId,
    classId: classId ?? null,
    role,
    status: "available",
    expiresAt,
    createdBy: uid,
    createdAt: FieldValue.serverTimestamp()
  });

  return { id: ref.id, token };
});

export const claimInviteToken = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Usuario nao autenticado.");
  }
  const uid = request.auth.uid;

  const { token } = request.data as { token: string };
  if (!token) {
    throw new HttpsError("invalid-argument", "Token obrigatorio.");
  }

  const tokenSnapshot = await db.collection("inviteTokens").where("token", "==", token).limit(1).get();
  if (tokenSnapshot.empty) {
    throw new HttpsError("not-found", "Token nao encontrado.");
  }

  const tokenDoc = tokenSnapshot.docs[0];
  const invite = tokenDoc.data() as {
    organizationId: string;
    classId?: string | null;
    role: PlatformRole;
    status: string;
    expiresAt: Timestamp;
    createdBy: string;
  };

  if (invite.status !== "available") {
    throw new HttpsError("failed-precondition", "Token indisponivel.");
  }

  if (invite.expiresAt.toDate() < new Date()) {
    throw new HttpsError("deadline-exceeded", "Token expirado.");
  }

  const memberRef = db.doc(`organizations/${invite.organizationId}/members/${uid}`);

  await db.runTransaction(async (transaction) => {
    const memberDoc = await transaction.get(memberRef);
    const tokenReload = await transaction.get(tokenDoc.ref);
    const tokenData = tokenReload.data();

    if (!tokenData || tokenData.status !== "available") {
      throw new HttpsError("failed-precondition", "Token ja utilizado.");
    }

    if (memberDoc.exists) {
      const current = memberDoc.data() as {
        roles?: PlatformRole[];
        classIds?: string[];
        status?: string;
        createdBy?: string;
        createdAt?: Timestamp;
      };
      const roles = Array.from(new Set([...(current.roles ?? []), invite.role]));
      const classIds =
        invite.classId && invite.classId.length > 0
          ? Array.from(new Set([...(current.classIds ?? []), invite.classId]))
          : current.classIds ?? [];

      transaction.set(
        memberRef,
        {
          ...current,
          organizationId: invite.organizationId,
          userUid: uid,
          roles,
          classIds,
          status: "active",
          createdBy: current.createdBy ?? invite.createdBy,
          createdAt: current.createdAt ?? FieldValue.serverTimestamp()
        },
        { merge: true }
      );
    } else {
      transaction.set(memberRef, {
        organizationId: invite.organizationId,
        userUid: uid,
        roles: [invite.role],
        classIds: invite.classId ? [invite.classId] : [],
        status: "active",
        createdBy: invite.createdBy,
        createdAt: FieldValue.serverTimestamp()
      });
    }

    transaction.update(tokenDoc.ref, {
      status: "used",
      usedByUid: uid,
      usedAt: FieldValue.serverTimestamp()
    });
  });

  await db.collection("auditLogs").add({
    type: "invite_claimed",
    token,
    userUid: uid,
    organizationId: invite.organizationId,
    role: invite.role,
    createdAt: FieldValue.serverTimestamp()
  });

  return { success: true, organizationId: invite.organizationId, role: invite.role };
});
