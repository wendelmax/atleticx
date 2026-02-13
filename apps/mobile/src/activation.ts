import { httpsCallable } from "firebase/functions";
import { functions } from "./functions";
import type { PlatformRole } from "@atleticx/shared";

interface ClaimTokenInput {
  token: string;
  userUid: string;
}

interface ClaimTokenResult {
  success: boolean;
  organizationId?: string;
  role?: PlatformRole;
  classId?: string;
  message: string;
}

export const claimInviteToken = async ({ token, userUid }: ClaimTokenInput): Promise<ClaimTokenResult> => {
  if (!userUid) {
    return { success: false, message: "Usuario invalido." };
  }
  try {
    const callable = httpsCallable<{ token: string }, { success: boolean; organizationId: string; role: PlatformRole }>(
      functions,
      "claimInviteToken"
    );
    const response = await callable({ token });
    return {
      success: response.data.success,
      organizationId: response.data.organizationId,
      role: response.data.role,
      message: "Token aplicado com sucesso."
    };
  } catch (error) {
    return {
      success: false,
      message: "Nao foi possivel ativar este token."
    };
  }
};
