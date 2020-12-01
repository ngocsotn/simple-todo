const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const db = require('./services/db');
const NewsPaper = require('./services/newsPaper');
const port = process.env.PORT || 3000;
const app = express();
const taskSendEmail = require('node-cron');
const updateDataNews = require('node-cron');
const passport = require('./middleware/passport');

//session
app.use(
	cookieSession({
		name: 'btcn08_1760120',
		keys: [ '12345' ],
		maxAge: 24 * 60 * 60 * 1000 //24 hours
	})
);
app.use(passport.initialize());
app.use(passport.session());
app.use(require('./middleware/auth'));

var count = 0;
if (count == 0) {
	count++;
	NewsPaper.updateDataBaseNews();
}
var task1 = taskSendEmail.schedule('0 7 * * *', () => {
	console.log('\n Email duoc gui hang loat tu 7h00 AM hang ngay: ', new Date());
	NewsPaper.sendEmailAllUsers();
	console.log('\n Da gui email hang loat thanh cong luc: ', new Date());
});
////min hour dayofmonth moth dayofweeks
var task2 = updateDataNews.schedule('*/30 * * * *', () => {
	console.log('\n moi 30 phut se crawl data 1 lan');
	NewsPaper.updateDataBaseNews();
	console.log('\n Da Crawl them data luc: ', new Date());
});

app.set('views', './views');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/views/css', express.static('views/css'));
app.use(express.static('views/images'));

//auth middleware

//routes
app.get('/', require('./routes/todo'));
app.get('/logout', require('./routes/logout'));
app.use('/login', require('./routes/login'));
app.get('/auth/facebook', passport.authenticate('facebook', { scope: [ 'public_profile', 'email' ] }));
app.get(
	'/auth/facebook/callback',
	passport.authenticate('facebook', {
		successRedirect: '/',
		failureRedirect: '/login'
	})
);

app.use('/todo', require('./routes/todo'));
app.use('/register', require('./routes/register'));
app.use('/verify', require('./routes/verify'));
app.use('/resend', require('./routes/resend'));
app.use('/checktodo', require('./routes/checktodo'));
app.use('/newsPaper', require('./routes/newsPaper'));

db
	.sync()
	.then(function() {
		app.listen(port);
		console.log(`Server is listening on port ${port}`);
	})
	.catch(function(err) {
		console.error(err);
	});
