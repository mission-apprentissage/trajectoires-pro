import NextAuth from "next-auth";
import type { AuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { UserSession } from "#/services/inserjeunes/types";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        login: { label: "Login", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        //TODO : create real auth
        if (typeof credentials !== "undefined" && credentials.login !== "") {
          const uai = req.query?.login.length === 8 ? req.query?.login : undefined;
          const siret = req.query?.login.length === 14 ? req.query?.login : undefined;
          const user: User & UserSession = { id: req.query?.login, name: req.query?.login, uai, siret };
          return user;
        } else {
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/inserjeunes/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      // Cast user to UserSession
      const userSession: UserSession = user as unknown as UserSession;
      if (userSession) {
        token = { ...token, user: userSession };
      }
      return token;
    },
    async session({ session, token, user }) {
      session.user = token.user as UserSession;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
