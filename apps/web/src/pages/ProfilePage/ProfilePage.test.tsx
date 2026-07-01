import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vite-plus/test";

import { useAuth } from "@/auth";

import ProfilePage from "./ProfilePage";

const mockAuth = () => ({
  currentUser: {
    email: "danny@bazinga.com",
    id: 84849020,
    roles: "BAZINGA",
  },
  forgotPassword: vi.fn(),
  getToken: vi.fn(),
  hasRole: () => false,
  isAuthenticated: true,
  loading: false,
  logIn: vi.fn(),
  logOut: vi.fn(),
  reauthenticate: vi.fn(),
  resetPassword: vi.fn(),
  signUp: vi.fn(),
  validateResetToken: vi.fn(),
});

describe("ProfilePage", () => {
  it("renders successfully", async () => {
    vi.mocked(useAuth).mockReturnValue(mockAuth());

    expect(() => {
      render(<ProfilePage />);
    }).not.toThrow();

    expect(await screen.findByText("danny@bazinga.com")).toBeInTheDocument();
  });
});
