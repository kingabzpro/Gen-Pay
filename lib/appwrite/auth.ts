import { account } from "./client";
import { ID } from "appwrite";
import type { Models } from "appwrite";

export async function createAccount(email: string, password: string, name: string) {
  try {
    // Appwrite account.create() takes positional parameters: userId, email, password, name
    const user = await account.create(
      ID.unique(),
      email,
      password,
      name
    );
    return user;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create account';
    console.error('Appwrite create account error:', error);
    throw new Error(errorMessage);
  }
}

export async function login(email: string, password: string) {
  try {
    // First, check if there's an active session and clear it
    try {
      const currentSession = await account.get();
      if (currentSession) {
        // There's an active session, clear it first
        await account.deleteSession('current');
      }
    } catch (sessionError) {
      // No active session or session already expired, continue
      console.log('No active session to clear');
    }

    // Now create the new session
    // Appwrite createEmailPasswordSession expects positional parameters, not an object
    const session = await account.createEmailPasswordSession(email, password);
    return session;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to login';
    console.error('Appwrite login error:', error);
    throw new Error(errorMessage);
  }
}

export async function logout() {
  try {
    await account.deleteSession('current');
  } catch (error: unknown) {
    console.error('Appwrite logout error:', error);
    // Don't throw error for logout, just log it
  }
}

export async function getCurrentUser(): Promise<Models.Session | null> {
  try {
    // First check if we have a valid session
    const sessions = await account.listSessions();
    if (sessions.sessions.length === 0) {
      return null;
    }
    
    // Get the current session/user
    const user = await account.get();
    return user as Models.Session;
  } catch (error: unknown) {
    console.log('No authenticated user or session expired');
    return null;
  }
}

export async function checkAuthStatus(): Promise<{ isAuthenticated: boolean; user?: Models.Session }> {
  try {
    const user = await getCurrentUser();
    return {
      isAuthenticated: !!user,
      user: user || undefined
    };
  } catch (error: unknown) {
    return { isAuthenticated: false };
  }
}

export async function clearSession(): Promise<void> {
  try {
    // Check if there's an active session
    const currentSession = await account.get();
    if (currentSession) {
      // Delete the current session
      await account.deleteSession('current');
    }
  } catch (error: unknown) {
    // If there's no session or it's already expired, ignore the error
    console.log('No active session to clear or session already expired');
  }
}
