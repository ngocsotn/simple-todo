const Sequelize = require('sequelize');
const db = require('./db');
const Model = Sequelize.Model;

class todoList extends Model {
	static async findAllNotDone(userID) {
		return todoList.findAll({
			where: {
				done: false,
				userID: userID
			}
		});
	}

	static async findTaskByID_userID(id, userID) {
		return todoList.findOne({
			where: {
				id: id,
				userID: userID
			}
		});
	}

	static async checkTaskAsDone(_id, userID) {
		if (!await todoList.findTaskByID_userID(_id, userID)) {
			console.log(' KHONG ton tai');
			return;
		}

		//cách 1: dùng Lệnh update
		todoList
			.update(
				{
					done: true
				},
				{ where: { id: _id, userID: userID } }
			)
			.then((count) => {
				console.log('Rows updated: ' + count);
			});

		//cách 2 : chọn ra mục tiêu, edit xog save lại

		// var taskFound = await todoList.findByPk(_id);
		// console.log('task Found Name: ' + taskFound.name);
		// if (taskFound && !taskFound.done) {
		// 	taskFound.done = true;
		// 	return taskFound.save();
		// }
		// return;
	}

	static async addTask(name, userID) {
		return todoList.create({ name: name, done: false, userID: userID });
	}
}
todoList.init(
	{
		//attribute
		name: {
			type: Sequelize.STRING,
			allowNull: false
		},
		done: {
			type: Sequelize.BOOLEAN,
			allowNull: false,
			defaultValue: false
			//allowNull
		},
		userID: {
			type: Sequelize.BIGINT,
			allowNull: false
		}
	},
	{
		sequelize: db,
		modelName: 'todoList'
		//option
	}
);
// todoList = [];

module.exports = todoList;
