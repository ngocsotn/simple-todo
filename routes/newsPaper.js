const newsFeed = require('../services/newsPaper');
const { Router } = require('express');
const router = new Router();
const asyncHandler = require('express-async-handler');
const URL_TOGO = process.env.BASE_URL || 'http://127.0.0.1:3000';
router.get(
	'/',
	asyncHandler(async function getnewsPaper(req, res) {
		req.session.pageNumber = 0;
		return res.render('newsPaper');
	})
);
router.get(
	'/:id',
	asyncHandler(async function getnewsPaperNum(req, res) {
		const { id, a } = req.params;
		req.session.pageNumber = Number(id);
		return res.redirect(URL_TOGO + '/newsPaper');
	})
);

router.post(
	'/',
	asyncHandler(async function postnewsPaper(req, res) {
		req.session.pageNumber = 0;
		return res.redirect('/');
	})
);

module.exports = router;
