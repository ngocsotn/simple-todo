const User = require('../services/users');
const { Router } = require('express');
const router = new Router();
const asyncHandler = require('express-async-handler');

router.get(
	'/',
	asyncHandler(async function getLogin(req, res) {
		if (!req.session.userEmail) {
			return res.redirect('login');
		}
		const user_tmp = await User.findUserByEmail(req.session.userEmail);
		if (!user_tmp) {
			return res.redirect('login');
		}
		if (await User.checkUserVerifyYet(user_tmp.email)) {
			return res.redirect('todo');
		}
		return res.render('verify');
	})
);

router.post(
	'/',
	asyncHandler(async function postLogin(req, res) {
		if (!req.session.userEmail) {
			return res.redirect('login');
		}
		const user_tmp = await User.findUserByEmail(req.session.userEmail);
		if (!user_tmp) {
			return res.redirect('login');
		}
		if (await User.checkUserVerifyYet(user_tmp.email)) {
			return res.redirect('todo');
		}
		if (await User.verifyCodeUser(req.body.verifyCode, user_tmp.email)) {
			return res.redirect('todo');
		}
		return res.redirect('verify');
	})
);

module.exports = router;
