import { useEffect, useMemo, useState } from "react";
import { Button, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { GoogleAuthProvider, onAuthStateChanged, signInWithCredential, signOut, type User } from "firebase/auth";
import { collectionGroup, documentId, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "./src/firebase";
import { claimInviteToken } from "./src/activation";
import type { Membership, PlatformRole } from "@atleticx/shared";

WebBrowser.maybeCompleteAuthSession();

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [memberships, setMemberships] = useState<Membership[]>([]);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setUser(authUser);
      if (authUser) {
        const snapshot = await getDocs(
          query(collectionGroup(db, "members"), where(documentId(), "==", authUser.uid), where("status", "==", "active"))
        );
        setMemberships(
          snapshot.docs.map(
            (entry) =>
              ({
                id: entry.id,
                ...entry.data()
              }) as Membership
          )
        );
      } else {
        setMemberships([]);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (response?.type === "success") {
      const idToken = response.authentication?.idToken;
      if (!idToken) {
        setMessage("Falha ao obter token do Google.");
        return;
      }
      const credential = GoogleAuthProvider.credential(idToken);
      signInWithCredential(auth, credential).catch(() => {
        setMessage("Falha no login com Google.");
      });
    }
  }, [response]);

  const currentRoles = useMemo(() => {
    const roles = new Set<PlatformRole>();
    memberships.forEach((membership) => membership.roles.forEach((role) => roles.add(role)));
    return Array.from(roles);
  }, [memberships]);

  const handleClaim = async () => {
    if (!user) {
      setMessage("Entre com sua conta Google antes de ativar.");
      return;
    }
    if (!token.trim()) {
      setMessage("Informe o token.");
      return;
    }
    const result = await claimInviteToken({
      token: token.trim().toUpperCase(),
      userUid: user.uid
    });
    setMessage(result.message);
    if (result.success) {
      setToken("");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>AtleticX</Text>
      <Text style={styles.subtitle}>Athlete Extreme</Text>

      {!user ? (
        <View style={styles.card}>
          <Text style={styles.label}>Acesso com Google SSO</Text>
          <Button disabled={!request} title="Entrar com Google" onPress={() => promptAsync()} />
        </View>
      ) : (
        <>
          <View style={styles.card}>
            <Text style={styles.label}>Conta ativa</Text>
            <Text style={styles.value}>{user.displayName ?? user.email}</Text>
            <Button title="Sair" onPress={() => signOut(auth)} />
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Ativar cadastro por token</Text>
            <TextInput
              style={styles.input}
              value={token}
              onChangeText={setToken}
              autoCapitalize="characters"
              placeholder="ATX-XXXXXX"
              placeholderTextColor="#8091b3"
            />
            <Button title="Ativar token" onPress={handleClaim} />
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Perfis ativos</Text>
            {currentRoles.length === 0 ? (
              <Text style={styles.value}>Sem perfil ativo. Solicite token da academia.</Text>
            ) : (
              currentRoles.map((role) => (
                <Text key={role} style={styles.value}>
                  {role}
                </Text>
              ))
            )}
          </View>
        </>
      )}

      {message ? <Text style={styles.message}>{message}</Text> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d1220",
    padding: 20,
    gap: 14
  },
  title: {
    marginTop: 16,
    fontSize: 34,
    fontWeight: "700",
    color: "#f5f7ff"
  },
  subtitle: {
    fontSize: 15,
    color: "#9fb2d8"
  },
  card: {
    backgroundColor: "#171f33",
    borderRadius: 12,
    padding: 16,
    gap: 10
  },
  label: {
    color: "#f5f7ff",
    fontSize: 16,
    fontWeight: "600"
  },
  value: {
    color: "#d6e1ff",
    fontSize: 14
  },
  input: {
    borderWidth: 1,
    borderColor: "#3d4f74",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#f5f7ff",
    backgroundColor: "#0f1628"
  },
  message: {
    color: "#9ec0ff",
    fontSize: 14
  }
});
