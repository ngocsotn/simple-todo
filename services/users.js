const bcrypt = require('bcrypt');
const Sequelize = require('sequelize');
const db = require('./db');
const sendEmail = require('./sendemail');
const Model = Sequelize.Model;
const crypto = require('crypto');

class User extends Model {
	static async getAllUsersEmail() {
		return User.findAll({
			attributes: {
				include: [ 'email' ]
			}
		});
	}

	static async checkUserVerifyYet(_inputEmail) {
		const _temp = await User.findOne({
			where: {
				email: _inputEmail
			}
		});
		if (_temp.verifyCode == '') {
			//if null = đã check
			return true;
		}
		return false;
	}
	static async verifyCodeUser(_inputcode, _inputEmail) {
		const _temp = await User.findOne({
			where: {
				email: _inputEmail,
				verifyCode: _inputcode
			}
		});
		if (_temp) {
			User.update(
				{
					verifyCode: ''
				},
				{ where: { email: _inputEmail } }
			).then((count) => {
				console.log('User Rows updated: ' + count);
			});
			return true;
		}
		return false;
	}

	static async resendEmail(email) {
		const userResend = await User.findUserByEmail(email);
		if (userResend) {
			const newVerifyCode = crypto.randomBytes(3).toString('hex').toUpperCase();
			User.update(
				{
					verifyCode: newVerifyCode
				},
				{ where: { email: email } }
			).then((count) => {
				console.log('User Rows updated: ' + count);
			});
			const _html =
				'<h2>Xin chào tài khoản ' +
				email +
				' <h2> <br> <h3><b>Mã kích hoạt mới của bạn là</b> </h3> <br> <br> <h1><b>' +
				newVerifyCode +
				'</b></h1>';
			await sendEmail.send(email, 'MÃ KÍCH HOẠT', newVerifyCode, _html);
		}
	}
	static async createNewUser(email, passwords, displayName) {
		const newUser = await User.create({
			email: email,
			displayName: displayName,
			passwords: bcrypt.hashSync(passwords, 10),
			verifyCode: crypto.randomBytes(3).toString('hex').toUpperCase()
		});
		const _html =
			'<h2>Xin chào tài khoản ' +
			newUser.email +
			' <h2> <br> <h3><b>Mã kích hoạt tài khoản của bạn là</b> </h3> <br> <br> <h1><b>' +
			newUser.verifyCode +
			'</b></h1>';
		await sendEmail.send(newUser.email, 'MÃ KÍCH HOẠT', newUser.verifyCode, _html);
		return newUser;
		//return await User.findUserByEmail(email);
	}

	// 	đã có tài khoản thường:
	// 	đăng nhập FB -> check email trùng - > thêm token và facebook ID vào:
	// 	thống nhất

	// đã có tài khoản ĐN FB:
	// 	quên mật khẩu -> lấy lại mật khẩu -> thống nhất

	static async creatNewFacebookUser(email, displayName, facebookID, facebookAccessToken) {
		const newUser = await User.create({
			email: email,
			displayName: displayName,
			passwords: bcrypt.hashSync(facebookID + crypto.randomBytes(3).toString('hex').toUpperCase(), 10),
			verifyCode: '',
			facebookID: facebookID,
			facebookAccessToken: facebookAccessToken
		});
		return newUser;
	}

	static async findUserByID(inputID) {
		return User.findByPk(inputID);
	}
	static async findByID(inputID) {
		return User.findByPk(inputID);
	}

	static async findUserByEmail(email) {
		return User.findOne({
			where: {
				email: email
			}
		});
	}

	static hashPasswords(passwords_input) {
		return bcrypt.hashSync(passwords_input, 10);
	}

	static verifyPassword(passwords, passwordsHash) {
		return bcrypt.compareSync(passwords, passwordsHash);
	}
}
User.init(
	{
		//attribute
		email: {
			type: Sequelize.STRING,
			allowNull: false,
			unique: true
		},
		displayName: {
			type: Sequelize.STRING,
			allowNull: false
			//allowNull
		},
		passwords: {
			type: Sequelize.STRING,
			allowNull: true
		},
		verifyCode: {
			type: Sequelize.STRING
		},
		facebookID: {
			type: Sequelize.STRING,
			allowNull: true
		},
		facebookAccessToken: {
			type: Sequelize.STRING,
			allowNull: true
		}
	},
	{
		sequelize: db,
		modelName: 'user'
		//option
	}
);

module.exports = User;
