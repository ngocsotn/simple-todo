const User = require('../services/users');
const Todo = require('../services/todo');
const { Router } = require('express');
const router = new Router();
const asyncHandler = require('express-async-handler');

router.post(
	'/',
	asyncHandler(async function checktodo(req, res) {
		//console.log('post TodoCheck is here');
		const user = User.findUserByEmail(req.session.userEmail);
		//nếu chưa đăng nhập, khi vào trang chủ sẽ quay về trang login
		if (!user) {
			return res.redirect('login');
		}
		const tempNum = Number(req.body.idNumber);
		await Todo.checkTaskAsDone(tempNum, req.session.userID);
		return res.render('todo');
	})
);
router.get('/', function checktodo(req, res) {
	//console.log('get TodoCheck is here');
	return res.redirect('todo');
});

module.exports = router;
