import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import type { AuthResponse, User } from "@/lib/models";
interface AuthState {
  token: string;
  user: User | null;
  ready: boolean;
  dark: boolean;
  toggleTheme: () => void;
  signIn: (data: AuthResponse) => void;
  signOut: () => void;
  favoriteIds: Set<number>;
  toggleFavorite: (id: number) => void;
  favoritePending: boolean;
}
const AuthContext = createContext<AuthState | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [dark, setDark] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  useEffect(() => {
    setToken(localStorage.getItem("goup-token") ?? "");
    setDark(localStorage.getItem("goup-theme") === "dark");
    setReady(true);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  const me = useQuery({
    queryKey: ["me", token],
    queryFn: () => api.me(token),
    enabled: ready && !!token,
    retry: false,
  });
  useEffect(() => {
    if (me.data) setUser(me.data);
  }, [me.data]);
  const favorites = useQuery({
    queryKey: ["favorites", token],
    queryFn: () => api.favorites(token),
    enabled: !!token,
    retry: false,
  });
  const favoriteIds = new Set((favorites.data ?? []).map((f) => f.event.id));
  const signOut = () => {
    localStorage.removeItem("goup-token");
    setToken("");
    setUser(null);
    queryClient.clear();
  };
  useEffect(() => {
    const expired = () => {
      if (
        window.location.pathname.startsWith("/eventos/") &&
        window.location.pathname !== "/eventos/"
      )
        sessionStorage.setItem("goup-return-after-login", window.location.pathname);
      localStorage.removeItem("goup-token");
      setToken("");
      setUser(null);
      queryClient.clear();
      void navigate({ to: "/login" });
    };
    window.addEventListener("goup-session-expired", expired);
    return () => window.removeEventListener("goup-session-expired", expired);
  }, [navigate, queryClient]);
  const favorite = useMutation({
    mutationFn: (id: number) => api.favorite(id, favoriteIds.has(id), token),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["favorites", token] }),
  });
  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        ready: ready && (!token || !me.isPending),
        dark,
        toggleTheme: () => {
          setDark(!dark);
          localStorage.setItem("goup-theme", dark ? "light" : "dark");
        },
        signIn: (data) => {
          localStorage.setItem("goup-token", data.accessToken);
          setToken(data.accessToken);
          setUser(data.user);
          queryClient.setQueryData(["me", data.accessToken], data.user);
        },
        signOut,
        favoriteIds,
        favoritePending: favorite.isPending,
        toggleFavorite: (id) => {
          if (!token) {
            toast("Entre para guardar seus eventos favoritos.");
            void navigate({ to: "/login" });
            return;
          }
          favorite.mutate(id);
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("AuthProvider ausente");
  return value;
}
export function usePremiumError(error: unknown) {
  return error instanceof ApiError && error.status === 403;
}
