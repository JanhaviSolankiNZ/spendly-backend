import passport from "passport";
import {
  Strategy as GoogleStrategy,
  StrategyOptions,
} from "passport-google-oauth20";
import { findOrCreateGoogleUser } from "../repositories/authRepository";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `${process.env.SERVER_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(null, false);
        }

        const username = profile.displayName
          .toLowerCase()
          .replace(/\s+/g, "_")
          .replace(/[^a-z0-9_]/g, "");

        const user = await findOrCreateGoogleUser({
          googleId: profile.id,
          email,
          username,
        });

        return done(null, user);
      } catch (err) {
        console.error("Google Auth Error:", err);
        return done(null, false);
      }
    },
  ),
);

export default passport;
