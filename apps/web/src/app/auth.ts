"use client";

type AuthResponse = {
  readonly email?: string;
  readonly error?: string;
  readonly message?: string;
};

const currentUser = {
  email: "demo@example.com",
  fullName: "Demo User",
  id: 1,
  roles: "ADMIN",
} as const;

export const useAuth = () => ({
  currentUser,
  forgotPassword: async (email: string): Promise<AuthResponse> => ({ email }),
  hasRole: (role: string) => currentUser.roles.split(",").includes(role),
  isAuthenticated: false,
  loading: false,
  logIn: async (_input?: unknown): Promise<AuthResponse> => ({
    message: "Auth is faked for this migration PoC.",
  }),
  logOut: () => undefined,
  reauthenticate: async () => undefined,
  resetPassword: async (_input?: unknown): Promise<AuthResponse> => ({
    message: "Password reset is faked for this migration PoC.",
  }),
  signUp: async (_input?: unknown): Promise<AuthResponse> => ({
    message: "Signup is faked for this migration PoC.",
  }),
  validateResetToken: async (_token?: string): Promise<AuthResponse> => ({}),
});
