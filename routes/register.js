const User = require('../services/users');
const { Router } = require('express');
const { check, validationResult, body } = require('express-validator');
const router = new Router();
const asyncHandler = require('express-async-handler');

router.get(
	'/',
	asyncHandler(async function getLogin(req, res) {
		return res.render('register');
	})
);

router.post(
	'/',
	[
		body('email').isEmail().normalizeEmail().custom(async function(email) {
			const found = await User.findUserByEmail(email);
			if (found) {
				throw Error('User ton tai');
			}
			return true;
		}),
		check('displayName').trim().notEmpty(),
		check('passwords').isLength({ min: 5 })
	],
	asyncHandler(async function(req, res) {
		if (req.session.userEmail || req.session.userID) {
			delete req.session.userEmail;
			delete req.session.userID;
		}
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(422).render('register', { errors: errors.array() });
		}
		const newUser = await User.createNewUser(req.body.email, req.body.passwords, req.body.displayName);
		req.session.userID = newUser.id;
		req.session.userEmail = newUser.email;
		return res.redirect('verify');
	})
);

module.exports = router;
