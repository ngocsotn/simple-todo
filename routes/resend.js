const User = require('../services/users');
const { Router } = require('express');
const { check, validationResult, body } = require('express-validator');
const router = new Router();
const asyncHandler = require('express-async-handler');

router.get(
	'/',
	asyncHandler(async function getResend(req, res) {
		if (req.session.userEmail) {
			await User.resendEmail(req.session.userEmail);
		}
		return res.redirect('verify');
	})
);

router.post(
	'/',
	asyncHandler(async function postResend(req, res) {
		return res.redirect('verify');
	})
);

module.exports = router;
