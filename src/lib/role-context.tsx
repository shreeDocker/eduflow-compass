import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type UserRole = "teacher" | "admin";

const STORAGE_KEY = "swotify_role";

function readStoredRole(): UserRole {
  if (typeof window === "undefined") return "teacher";
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "admin" ? "admin" : "teacher";
}

type RoleContextValue = {
  role: UserRole;
  setRole: (role: UserRole) => void;
  isAdmin: boolean;
  isTeacher: boolean;
};

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>(readStoredRole);

  const setRole = useCallback((next: UserRole) => {
    setRoleState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const value = useMemo(
    () => ({
      role,
      setRole,
      isAdmin: role === "admin",
      isTeacher: role === "teacher",
    }),
    [role, setRole],
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
}
