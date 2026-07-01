import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vite-plus/test";

vi.mock("rwsdk/client", () => ({
  navigate: vi.fn(),
}));

vi.mock("@apollo/client/react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@apollo/client/react")>();

  return {
    ...actual,
    useMutation: vi.fn(() => [vi.fn(), { called: false, error: undefined, loading: false }]),
    useQuery: vi.fn(() => ({ data: undefined, error: undefined, loading: true })),
  };
});

vi.mock("@/auth", () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: vi.fn(() => ({
    currentUser: null,
    forgotPassword: vi.fn(),
    getToken: vi.fn(),
    hasRole: () => false,
    isAuthenticated: false,
    loading: false,
    logIn: vi.fn(),
    logOut: vi.fn(),
    reauthenticate: vi.fn(),
    resetPassword: vi.fn(),
    signUp: vi.fn(),
    validateResetToken: vi.fn(),
  })),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
