"use client";

// Cookie names
const SIDEBAR_VISIBILITY_COOKIE = "markdown-cms-sidebar-visible";

// Cookie expiration (30 days)
const COOKIE_EXPIRATION_DAYS = 30;

// Helper to get cookie value
export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split("; ");
  const cookie = cookies.find((c) => c.startsWith(`${name}=`));
  return cookie ? cookie.split("=")[1] : null;
}

// Helper to set cookie
export function setCookie(name: string, value: string): void {
  if (typeof document === "undefined") return;

  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + COOKIE_EXPIRATION_DAYS);

  document.cookie = `${name}=${value}; expires=${expirationDate.toUTCString()}; path=/`;
}

// User preferences interface
export interface UserPreferences {
  isSidebarVisible: boolean;
}

// Get user preferences from cookies
export function getUserPreferences(): UserPreferences {
  const sidebarVisibleCookie = getCookie(SIDEBAR_VISIBILITY_COOKIE);

  return {
    isSidebarVisible:
      sidebarVisibleCookie === null ? true : sidebarVisibleCookie === "true",
  };
}

// Save user preferences to cookies
export function saveUserPreferences(
  preferences: Partial<UserPreferences>,
): void {
  if (preferences.isSidebarVisible !== undefined) {
    setCookie(
      SIDEBAR_VISIBILITY_COOKIE,
      preferences.isSidebarVisible.toString(),
    );
  }
}
