const User = require('../services/users');
const Todo = require('../services/todo');
const { Router } = require('express');
const router = new Router();
const asyncHandler = require('express-async-handler');

router.get(
	'/',
	asyncHandler(async function getLogin(req, res) {
		if (!req.session.userEmail || req.user) {
			return res.render('login');
		}
		if (req.user) {
			return res.redirect('todo');
		}
		if (req.session.userEmail) {
			const user = await User.findUserByEmail(req.session.userEmail);
			if (!user) {
				return res.render('login');
			}
		}
		return res.render('todo');
	})
);

router.post(
	'/',
	asyncHandler(async function postLogin(req, res) {
		const user_tmp = await User.findUserByEmail(req.body.userEmail);
		//kiểm tra tên user và passwords
		if (!user_tmp || !User.verifyPassword(req.body.passwords, user_tmp.passwords)) {
			return res.redirect('login');
		}
		req.session.userID = user_tmp.id;
		req.session.userEmail = user_tmp.email;
		if (await User.checkUserVerifyYet(user_tmp.email)) {
			return res.redirect('todo');
		}
		return res.redirect('verify');
	})
);

module.exports = router;
