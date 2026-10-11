import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Eye,
  EyeOff,
  ArrowRight,
  LogOut,
  Heart,
  CalendarDays,
  Plus,
  Sun,
  Moon,
  Trash2,
  Pencil,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { Event } from "@/lib/models";
import { Button } from "@/components/ui/button";
import { useAuth } from "./auth";
import { Brand } from "./shell";
import { Kicker, Loading, ErrorState, Empty, EventGrid, LoginGate, EventCard } from "./common";
export function AuthPage({ register = false }: { register?: boolean }) {
  const [show, setShow] = useState(false);
  const [values, setValues] = useState({ name: "", email: "", password: "" });
  const auth = useAuth();
  const navigate = useNavigate();
  const mutation = useMutation({
    mutationFn: () =>
      register
        ? api.register(values)
        : api.login({ email: values.email, password: values.password }),
    onSuccess: (data) => {
      auth.signIn(data);
      const returnTo = sessionStorage.getItem("goup-return-after-login");
      sessionStorage.removeItem("goup-return-after-login");
      const editId = returnTo?.match(/^\/eventos\/([^/]+)\/editar$/)?.[1];
      if (editId) void navigate({ to: "/eventos/$id/editar", params: { id: editId } });
      else if (returnTo === "/eventos/novo") void navigate({ to: "/eventos/novo" });
      else void navigate({ to: "/perfil" });
    },
  });
  const errors = mutation.error instanceof ApiError ? mutation.error.errors : [];
  return (
    <div className="page wrap">
      <div className="auth-layout">
        <div className="auth-story">
          <Kicker>{register ? "FAÇA PARTE DO MOVIMENTO" : "BEM-VINDO DE VOLTA"}</Kicker>
          <h1>
            {register ? (
              <>
                A vida acontece
                <br />
                lá <span className="text-primary">fora.</span>
              </>
            ) : (
              <>
                Mais momentos.
                <br />
                Mais <span className="text-primary">você.</span>
              </>
            )}
          </h1>
          <p className="section-desc">
            {register
              ? "Seu próximo show, encontro ou lugar favorito está mais perto do que você imagina."
              : "Suas descobertas, seus favoritos e novas possibilidades. Tudo te esperando."}
          </p>
          <ol>
            <li>
              <b>01</b>Descubra o que acontece perto de você.
            </li>
            <li>
              <b>02</b>Guarde os momentos que combinam com você.
            </li>
            <li>
              <b>03</b>Saia do óbvio. Viva algo novo.
            </li>
          </ol>
          <div className="footer-motto mt-10">
            Vá. Viva. <Brand />.
          </div>
        </div>
        <div className="form-card">
          <h2>
            {register ? (
              <>
                Crie sua <span className="text-primary">conta.</span>
              </>
            ) : (
              <>
                Que bom te <span className="text-primary">ver.</span>
              </>
            )}
          </h2>
          <p>
            {register ? "Comece a descobrir com o GoUp." : "Entre e encontre seu próximo momento."}
          </p>
          <form
            className="form-stack"
            onSubmit={(e) => {
              e.preventDefault();
              mutation.mutate();
            }}
          >
            {(register ? ["name", "email", "password"] : ["email", "password"]).map((key) => (
              <label className="field" key={key}>
                {key === "name" ? "Seu nome" : key === "email" ? "E-mail" : "Senha"}
                <div className={key === "password" ? "password-wrap" : ""}>
                  <input
                    autoComplete={
                      key === "name"
                        ? "name"
                        : key === "email"
                          ? "email"
                          : register
                            ? "new-password"
                            : "current-password"
                    }
                    type={
                      key === "password"
                        ? show
                          ? "text"
                          : "password"
                        : key === "email"
                          ? "email"
                          : "text"
                    }
                    value={values[key as keyof typeof values]}
                    maxLength={key === "name" ? 120 : key === "password" ? 72 : undefined}
                    minLength={key === "password" && register ? 8 : undefined}
                    required
                    placeholder={
                      key === "name"
                        ? "Como podemos te chamar?"
                        : key === "email"
                          ? "voce@email.com"
                          : "Sua senha"
                    }
                    onChange={(e) => setValues({ ...values, [key]: e.target.value })}
                  />
                  {key === "password" && (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="eye"
                      aria-label={show ? "Ocultar senha" : "Mostrar senha"}
                      onClick={() => setShow(!show)}
                    >
                      {show ? <EyeOff /> : <Eye />}
                    </Button>
                  )}
                </div>
                {errors
                  .filter((e) => e.field === key)
                  .map((e, i) => (
                    <span key={i} className="field-error">
                      {e.message}
                    </span>
                  ))}
              </label>
            ))}
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending
                ? "Só um instante…"
                : register
                  ? "Criar minha conta"
                  : "Entrar no GoUp"}
              <ArrowRight />
            </Button>
          </form>
          <div className="form-link">
            {register ? (
              <>
                Já tem uma conta? <Link to="/login">Entrar</Link>
              </>
            ) : (
              <>
                Ainda não faz parte? <Link to="/cadastro">Crie sua conta</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export function FavoritesPage() {
  return (
    <div className="page wrap">
      <Kicker>SEUS MOMENTOS GUARDADOS</Kicker>
      <h1>
        Seus <span className="text-primary">favoritos.</span>
      </h1>
      <p className="section-desc mb-8">Aqueles eventos que deram vontade de ir.</p>
      <LoginGate>
        <FavoritesList />
      </LoginGate>
    </div>
  );
}
function FavoritesList() {
  const auth = useAuth();
  const query = useQuery({
    queryKey: ["favorites", auth.token],
    queryFn: () => api.favorites(auth.token),
    enabled: !!auth.token,
    retry: false,
  });
  return query.isPending ? (
    <Loading />
  ) : query.isError ? (
    <ErrorState error={query.error} retry={() => void query.refetch()} />
  ) : query.data.length ? (
    <EventGrid events={query.data.map((f) => f.event)} />
  ) : (
    <Empty
      title="Você ainda não favoritou nenhum evento"
      description="Quando algo combinar com você, toque no coração para guardar aqui."
    />
  );
}
export function ProfilePage() {
  return (
    <div className="page wrap">
      <Kicker>SEU ESPAÇO NO GOUP</Kicker>
      <h1>
        Meu <span className="text-primary">perfil.</span>
      </h1>
      <LoginGate>
        <Profile />
      </LoginGate>
    </div>
  );
}
function Profile() {
  const auth = useAuth();
  const query = useQuery({
    queryKey: ["mine", auth.token],
    queryFn: () => api.mine(auth.token),
    retry: false,
  });
  const me = useQuery({
    queryKey: ["me", auth.token],
    queryFn: () => api.me(auth.token),
    retry: false,
  });
  if (me.isError) return <ErrorState error={me.error} retry={() => void me.refetch()} />;
  if (!auth.user) return <Loading />;
  return (
    <div className="profile-grid mt-8">
      <div className="form-card profile-data">
        <div className="flex gap-4 items-center">
          <div className="avatar">{auth.user.name.charAt(0).toUpperCase()}</div>
          <div>
            <h2 className="mb-2">{auth.user.name}</h2>
            <span className="badge">GoUp {auth.user.premium ? "Premium" : "Free"}</span>
          </div>
        </div>
        <label className="field">
          E-mail<span className="section-desc">{auth.user.email}</span>
        </label>
        <Button variant="outline" onClick={auth.toggleTheme}>
          {auth.dark ? <Sun /> : <Moon />}Tema {auth.dark ? "claro" : "escuro"}
        </Button>
        <Button variant="ghost" onClick={auth.signOut}>
          <LogOut />
          Sair da conta
        </Button>
      </div>
      <div className="form-stack">
        <Button asChild variant="outline">
          <Link to="/favoritos">
            <Heart />
            {auth.favoriteIds.size} favoritos <ArrowRight />
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/meus-eventos">
            <CalendarDays />
            {query.isPending ? "…" : (query.data?.length ?? "—")} eventos criados <ArrowRight />
          </Link>
        </Button>
        {query.isError && <ErrorState error={query.error} retry={() => void query.refetch()} />}
        <Button asChild>
          <Link to="/eventos/novo">
            <Plus />
            Criar evento
          </Link>
        </Button>
        <Button asChild variant="secondary">
          <Link to="/planos">
            Conhecer os planos <ArrowRight />
          </Link>
        </Button>
      </div>
    </div>
  );
}
export function DeleteEvent({ event, onDeleted }: { event: Event; onDeleted?: () => void }) {
  const [confirm, setConfirm] = useState(false);
  const auth = useAuth();
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => api.delete(event.id, auth.token),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["mine"] });
      void client.invalidateQueries({ queryKey: ["events"] });
      void client.invalidateQueries({ queryKey: ["all-events"] });
      setConfirm(false);
      onDeleted?.();
    },
  });
  return (
    <>
      <Button
        variant="outline"
        aria-label={`Excluir ${event.title}`}
        onClick={() => setConfirm(true)}
      >
        <Trash2 />
        Excluir
      </Button>
      {confirm && (
        <div className="modal-backdrop" onClick={() => setConfirm(false)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <Trash2 className="text-primary" />
            <h2 id="delete-title">Excluir evento?</h2>
            <p>“{event.title}” será excluído. Essa ação não pode ser desfeita.</p>
            <div className="modal-actions">
              <Button variant="outline" autoFocus onClick={() => setConfirm(false)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                disabled={mutation.isPending}
                onClick={() => mutation.mutate()}
              >
                {mutation.isPending ? "Excluindo…" : "Excluir evento"}
              </Button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
export function MyEventsPage() {
  return (
    <div className="page wrap">
      <div className="section-top">
        <div>
          <Kicker>FAÇA ACONTECER</Kicker>
          <h1>
            Meus <span className="text-primary">eventos.</span>
          </h1>
        </div>
        <Button asChild>
          <Link to="/eventos/novo">
            <Plus />
            Criar evento
          </Link>
        </Button>
      </div>
      <LoginGate>
        <MyEvents />
      </LoginGate>
    </div>
  );
}
function MyEvents() {
  const auth = useAuth();
  const query = useQuery({
    queryKey: ["mine", auth.token],
    queryFn: () => api.mine(auth.token),
    retry: false,
  });
  return query.isPending ? (
    <Loading />
  ) : query.isError ? (
    <ErrorState error={query.error} retry={() => void query.refetch()} />
  ) : !query.data.length ? (
    <Empty
      title="Seu primeiro evento começa aqui"
      description="Você ainda não criou eventos. Que tal fazer algo acontecer?"
    />
  ) : (
    <div className="event-grid">
      {query.data.map((event) => (
        <div key={event.id}>
          <div className="mb-3">
            <span className="badge">
              {event.status === "DRAFT"
                ? "Rascunho"
                : event.status === "PUBLISHED"
                  ? "Publicado"
                  : event.status === "CANCELLED"
                    ? "Cancelado"
                    : "Finalizado"}
            </span>
          </div>
          <EventCard event={event} />
          <div className="flex gap-3 mt-3">
            <Button variant="outline" asChild>
              <Link to="/eventos/$id/editar" params={{ id: String(event.id) }}>
                <Pencil />
                Editar
              </Link>
            </Button>
            <DeleteEvent event={event} />
          </div>
        </div>
      ))}
    </div>
  );
}
