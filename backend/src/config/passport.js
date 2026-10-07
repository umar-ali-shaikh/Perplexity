import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.model.js";

const isGoogleAuthConfigured = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

if (isGoogleAuthConfigured) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
            },
            async (_accessToken, _refreshToken, profile, done) => {
                try {
                    const email = profile.emails?.[0]?.value;

                    if (!email) {
                        return done(new Error("Google account has no email"));
                    }

                    let user = await User.findOne({ googleId: profile.id });

                    if (!user) {
                        // No account linked to this Google id yet — fall back to
                        // matching by email so an existing password account gets
                        // linked instead of creating a duplicate user.
                        user = await User.findOne({ email });

                        if (user) {
                            user.googleId = profile.id;
                            user.isVerified = true;
                            await user.save();
                        } else {
                            user = await User.create({
                                username: profile.displayName || email.split("@")[0],
                                email,
                                googleId: profile.id,
                                isVerified: true,
                            });
                        }
                    }

                    return done(null, user);
                } catch (error) {
                    return done(error);
                }
            }
        )
    );
} else {
    console.error(
        "passport: GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not configured, Google login is disabled"
    );
}

export { isGoogleAuthConfigured };
export default passport;
