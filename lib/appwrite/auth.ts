import { Account } from "appwrite";
import { client } from "./client";

export const account = new Account(client);

export async function createAccount(email: string, password: string, name: string) {
  try {
    const user = await account.create(
      crypto.randomUUID(),
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
    const session = await account.createEmailPasswordSession(email, password);
    return session;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function logout() {
  try {
    await account.deleteSession("current");
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function getCurrentUser() {
  try {
    const user = await account.get();
    return user;
  } catch (error) {
    return null;
  }
}
