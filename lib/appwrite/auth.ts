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
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function login(email: string, password: string) {
  try {
    // Appwrite createEmailPasswordSession expects positional parameters, not an object
    const session = await account.createEmailPasswordSession(email, password);
    return session;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function logout() {
  try {
    await account.deleteSession('current');
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function getCurrentUser(): Promise<Models.Session | null> {
  try {
    const user = await account.get();
    return user as Models.Session;
  } catch (error) {
    return null;
  }
}
