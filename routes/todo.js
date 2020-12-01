const User = require('../services/users');
const Todo = require('../services/todo');
const { Router } = require('express');
const router = new Router();
const asyncHandler = require('express-async-handler');

router.get(
	'/',
	asyncHandler(async function getTodo(req, res) {
		//console.log('get to do');
		if (!req.session.userEmail || !req.user) {
			return res.redirect('login');
		}
		if (req.user) {
			return res.render('todo');
		}
		const user = await User.findUserByEmail(req.session.userEmail);
		//nếu chưa đăng nhập, khi vào trang chủ sẽ quay về trang login
		if (!user) {
			return res.redirect('login');
		}
		if (!await User.checkUserVerifyYet(user.email)) {
			return res.redirect('verify');
		}
		return res.render('todo');
	})
);

router.post(
	'/',
	asyncHandler(async function postTodo(req, res) {
		//console.log('post to do');
		if (!req.session.userEmail) {
			return res.redirect('login');
		}
		const user = await User.findUserByEmail(req.session.userEmail);
		//nếu chưa đăng nhập, khi vào trang chủ sẽ quay về trang login
		if (!user) {
			return res.redirect('login');
		}
		if (!await User.checkUserVerifyYet(user.email)) {
			return res.redirect('verify');
		}
		// kiểm tra thông tin nhập có rỗng không
		const taskContent = String(req.body.todoContent);
		if (taskContent.length < 1) {
			return res.redirect('todo');
		}
		//console.log('user ID = ' + req.session.userID);
		todoList = await Todo.addTask(taskContent, req.session.userID);

		return res.redirect('todo');
	})
);

module.exports = router;
