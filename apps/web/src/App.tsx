import { FormEvent, useEffect, useMemo, useState } from "react";
import { canManageInvites, type PlatformRole } from "@atleticx/shared";
import { useAuthSession } from "./auth";
import { createClassRoom, createInviteToken, createOrganization, listClassRooms } from "./data";

const inviteRoles: PlatformRole[] = ["athlete", "guardian", "coach", "staff"];

export const App = () => {
  const { session, context, loading, signInWithGoogle, logout, refreshContext } = useAuthSession();
  const [organizationName, setOrganizationName] = useState("");
  const [organizationSlug, setOrganizationSlug] = useState("");
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string>("");
  const [className, setClassName] = useState("");
  const [classModality, setClassModality] = useState("");
  const [classLevel, setClassLevel] = useState("Base");
  const [classId, setClassId] = useState("");
  const [inviteRole, setInviteRole] = useState<PlatformRole>("athlete");
  const [inviteDays, setInviteDays] = useState(15);
  const [createdToken, setCreatedToken] = useState("");
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [statusText, setStatusText] = useState("");

  useEffect(() => {
    if (context.selectedOrganizationId) {
      setSelectedOrganizationId(context.selectedOrganizationId);
    }
  }, [context.selectedOrganizationId]);

  useEffect(() => {
    const load = async () => {
      if (!selectedOrganizationId) {
        setClasses([]);
        return;
      }
      const data = await listClassRooms(selectedOrganizationId);
      setClasses(data.map((item) => ({ id: item.id, name: item.name })));
      if (data.length > 0) {
        setClassId(data[0].id);
      }
    };
    load();
  }, [selectedOrganizationId]);

  const canManage = useMemo(() => {
    return context.memberships.some((membership) => membership.roles.some((role) => canManageInvites(role)));
  }, [context.memberships]);

  if (loading) {
    return <main className="container">Carregando...</main>;
  }

  if (!session) {
    return (
      <main className="container">
        <h1>AtleticX Admin</h1>
        <p>Painel de gestao para academias e dojos.</p>
        <button onClick={() => signInWithGoogle()}>Entrar com Google</button>
      </main>
    );
  }

  const handleCreateOrganization = async (event: FormEvent) => {
    event.preventDefault();
    if (!organizationName || !organizationSlug || !session?.uid) {
      return;
    }
    const orgId = await createOrganization(organizationName, organizationSlug, session.uid);
    setStatusText(`Academia criada com sucesso: ${orgId}`);
    setOrganizationName("");
    setOrganizationSlug("");
    refreshContext();
  };

  const handleCreateClass = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedOrganizationId || !className || !session?.uid) {
      return;
    }
    const newClassId = await createClassRoom(
      {
        organizationId: selectedOrganizationId,
        name: className,
        modality: classModality || "Multimodalidade",
        level: classLevel,
        coachUid: session.uid
      },
      session.uid
    );
    setStatusText(`Turma criada com sucesso: ${newClassId}`);
    const data = await listClassRooms(selectedOrganizationId);
    setClasses(data.map((item) => ({ id: item.id, name: item.name })));
    setClassId(newClassId);
    setClassName("");
    setClassModality("");
  };

  const handleCreateInvite = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedOrganizationId || !session?.uid) {
      return;
    }
    const invite = await createInviteToken({
      organizationId: selectedOrganizationId,
      classId: classId || undefined,
      role: inviteRole,
      expiresInDays: inviteDays
    });
    setCreatedToken(invite.token);
    setStatusText("Token gerado com sucesso.");
  };

  return (
    <main className="container">
      <header className="header">
        <div>
          <h1>AtleticX Admin</h1>
          <p>
            {session.displayName} ({session.email})
          </p>
        </div>
        <button onClick={() => logout()}>Sair</button>
      </header>

      <section className="card">
        <h2>Academias vinculadas</h2>
        {context.organizations.length === 0 ? (
          <p>Sem academia vinculada.</p>
        ) : (
          <select value={selectedOrganizationId} onChange={(event) => setSelectedOrganizationId(event.target.value)}>
            {context.organizations.map((organization) => (
              <option key={organization.id} value={organization.id}>
                {organization.name}
              </option>
            ))}
          </select>
        )}
      </section>

      <section className="card">
        <h2>Cadastrar academia</h2>
        <form onSubmit={handleCreateOrganization} className="grid">
          <input
            placeholder="Nome da academia"
            value={organizationName}
            onChange={(event) => setOrganizationName(event.target.value)}
          />
          <input placeholder="Slug" value={organizationSlug} onChange={(event) => setOrganizationSlug(event.target.value)} />
          <button type="submit">Criar academia</button>
        </form>
      </section>

      <section className="card">
        <h2>Cadastrar turma</h2>
        <form onSubmit={handleCreateClass} className="grid">
          <input placeholder="Nome da turma" value={className} onChange={(event) => setClassName(event.target.value)} />
          <input
            placeholder="Modalidade"
            value={classModality}
            onChange={(event) => setClassModality(event.target.value)}
          />
          <input placeholder="Nivel" value={classLevel} onChange={(event) => setClassLevel(event.target.value)} />
          <button type="submit" disabled={!selectedOrganizationId}>
            Criar turma
          </button>
        </form>
      </section>

      <section className="card">
        <h2>Gerar token de pre-cadastro</h2>
        {canManage ? (
          <form onSubmit={handleCreateInvite} className="grid">
            <select value={inviteRole} onChange={(event) => setInviteRole(event.target.value as PlatformRole)}>
              {inviteRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <select value={classId} onChange={(event) => setClassId(event.target.value)}>
              <option value="">Sem turma</option>
              {classes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              max={60}
              value={inviteDays}
              onChange={(event) => setInviteDays(Number(event.target.value))}
            />
            <button type="submit" disabled={!selectedOrganizationId}>
              Gerar token
            </button>
          </form>
        ) : (
          <p>Seu perfil nao possui permissao para gerar tokens.</p>
        )}
        {createdToken ? (
          <div className="tokenBox">
            <strong>Token:</strong> {createdToken}
          </div>
        ) : null}
      </section>

      {statusText ? <p className="status">{statusText}</p> : null}
    </main>
  );
};
