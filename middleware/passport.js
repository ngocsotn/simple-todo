const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../services/users');
const BlueBird = require('bluebird');

//passport middleware
passport.use(
	new FacebookStrategy(
		{
			clientID: process.env.FACEBOOK_APP_ID,
			clientSecret: process.env.FACEBOOK_APP_SECRET,
			callbackURL: `${process.env.BASE_URL}/auth/facebook/callback`,
			profileFields: [ 'id', 'emails', 'displayName' ]
		},
		function(accessToken, refreshToken, profile, done) {
			//console.log(profile);
			//console.log(profile.emails[0].value);
			User.findOne({
				where: { facebookID: profile.id }
			})
				.then(async function(found) {
					if (found) {
						found.facebookAccessToken = accessToken;
						return found;
					}
					const user = await User.creatNewFacebookUser(
						`${profile.id}@facebook.com`,
						profile.displayName,
						profile.id,
						accessToken
					);
					return user;
				})
				.asCallback(done);
		}
	)
);

passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	User.findByPk(id).asCallback(done);
});

module.exports = passport;
