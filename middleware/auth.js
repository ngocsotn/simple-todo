const User = require('../services/users');
const Todo = require('../services/todo');
const NewsPaper = require('../services/newsPaper');
const asyncHandler = require('express-async-handler');

module.exports = asyncHandler(async function auth(req, res, next) {
	//newspaper auth
	if (!req.session.pageNumber) {
		req.session.pageNumber = 0;
	}
	res.locals.pageNumber = req.session.pageNumber;
	req.pageNumber = req.session.pageNumber;
	const numberOfPostsInOnePage = 12;

	var allRows = (await NewsPaper.findAndCountAll()).count;
	var TotalPages = allRows / 12;
	if (TotalPages > Math.floor(TotalPages)) {
		TotalPages = Math.floor(TotalPages); // 37/12 = 3 + 1 pages total ( 0->3 )
	} else if (TotalPages == Math.floor(TotalPages)) {
		TotalPages = Math.floor(TotalPages) - 1; // 36/12 = 3 pages total ( 0->2 )
	}
	res.locals.TotalPages = TotalPages;
	req.TotalPages = TotalPages;

	const newsFeedList = await NewsPaper.getNewsPaging(
		numberOfPostsInOnePage,
		numberOfPostsInOnePage * res.locals.pageNumber
	);
	req.newsFeedList = newsFeedList;
	res.locals.newsFeedList = newsFeedList;
	res.locals.todoList = null;

	//User auth
	//if login with facebook
	var user = null;
	var userEmail = req.session.userEmail;
	if (req.user) {
		user = req.user;
		req.session.userEmail = user.email;
	} else if (userEmail) {
		//if login with user name passwords
		user = await User.findUserByEmail(userEmail);
		if (!user) {
			return next();
		}
	} else if (!userEmail && !req.user) {
		req.currentUser = null;
		res.locals.currentUser = null;
		return next();
	}
	todoList = await Todo.findAllNotDone(user.id);

	req.todoList = todoList;
	res.locals.todoList = todoList;

	req.currentUser = user;
	res.locals.currentUser = user;
	return next();
});
