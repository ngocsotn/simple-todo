const passport = require('../middleware/passport');

module.exports = function logout(req, res) {
	delete req.session.userID;
	delete req.session.userEmail;
	req.logout();
	delete req.user;
	res.redirect('/');
};
