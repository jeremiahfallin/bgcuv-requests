import NextAuth, { Session } from 'next-auth';
import { AppProviders } from 'next-auth/providers';

import SpotifyProvider from 'next-auth/providers/spotify';

const scope = 'user-read-email playlist-modify-public';

const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = process.env;

const providers: AppProviders = [];

providers.push(
  SpotifyProvider({
    clientId: SPOTIFY_CLIENT_ID!,
    clientSecret: SPOTIFY_CLIENT_SECRET!,
    authorization: {
      params: { scope },
    },
    profile(profile) {
      return {
        id: profile.id,
        name: profile.login,
        email: profile.email,
        image: profile.images?.[0]?.url,
      } as any;
    },
  }),
);

export default NextAuth({
  // Configure one or more authentication providers
  providers,
  secret: process.env.NEXT_AUTH_SECRET,
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
      }
      return token;
    },
    async session({ session, user, token }): Promise<Session> {
      session.user = user;
      session.token = token;
      return session;
    },
  },
});
