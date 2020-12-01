const Sequelize = require('sequelize');
const Parser = require('rss-parser');
const blueBird = require('bluebird');
const db = require('./db');
const User = require('../services/users');
const sendEmail = require('./sendemail');
const parser = new Parser();
const Model = Sequelize.Model;

const VNEXPRESS_RSS = 'https://vnexpress.net/rss/tin-moi-nhat.rss';
const THANHNIEN_RSS = 'https://thanhnien.vn/rss/home.rss';
const TUOITRE_RSS = 'https://tuoitre.vn/rss/tin-moi-nhat.rss';
const rssList = [ VNEXPRESS_RSS, THANHNIEN_RSS, TUOITRE_RSS ];

class newsPaper extends Model {
	static async getThreeLatestNews() {
		return newsPaper.findAll({
			offset: Number(0),
			limit: Number(3),
			order: [ [ 'publishedAt', 'DESC' ] ]
		});
	}
	static async sendEmailAllUsers() {
		const emailList = await User.getAllUsersEmail();
		const threeNews = await newsPaper.getThreeLatestNews();
		await blueBird.each(emailList, async function(item) {
			if (item.email != '1760120@admin.com') {
				console.log(item.email);
				var _html =
					'<h2>Xin chào tài khoản ' +
					item.email +
					' </h2> <h1><b>Một số tin tức mới về covid-19:</b> </h1> <br> ' +
					'<table style="border-collapse: collapse;width: 100%;padding-bottom: 20%;font-weight: 400; font-size: 25px;">';
				threeNews.forEach((singleNews) => {
					_html +=
						'<tr>' +
						'<td>' +
						singleNews.img +
						'</td>' +
						'<td>' +
						'<a href="' +
						singleNews.link +
						'">' +
						singleNews.title +
						'</a> </td>' +
						' </tr>';
				});
				_html += '</table> <br><br><h2>bấm vào ảnh để xem tin tức chi tiết!</h2>';
				await blueBird.delay(2000); // each 2s, send an email for a single User
				var timeString = new Date().toString();
				timeString = timeString.slice(0, timeString.lastIndexOf('GMT'));
				await sendEmail.send(
					item.email,
					'TIN TỨC MỚI COVID19 (' + timeString + ')',
					'TIN TỨC MỚI COVID19 (' + timeString + ')',
					_html
				);
			}
		});
	}

	static getImageLink(inputStr) {
		var kq = '';
		var str = inputStr.toString();
		var startPos = str.indexOf('/></a>');
		if (startPos == -1) {
			startPos = str.indexOf('</a>');
			if (startPos != -1) {
				startPos += 4;
			}
		} else {
			startPos += 6;
		}

		kq = str.slice(0, startPos);
		return kq;
	}
	static isContainCoronaVirus(inputStr) {
		var str = inputStr.toString().toUpperCase();
		var n = str.includes('COVID') || str.includes('CORONA') || str.includes('SARS-COV-2') || str.includes('NCOV');
		return n;
	}
	static async updateDataBaseNews() {
		await blueBird.each(rssList, async function(rssItem) {
			const feed = await parser.parseURL(rssItem);

			await blueBird.each(feed.items, async function(item) {
				if (!item.link) return;
				const found = await newsPaper.findOne({
					where: {
						link: item.link
					}
				});
				if (!found) {
					if (
						(await newsPaper.isContainCoronaVirus(item.content)) ||
						(await newsPaper.isContainCoronaVirus(item.contentSnippet)) ||
						(await newsPaper.isContainCoronaVirus(item.title))
					) {
						await newsPaper.create({
							link: item.link,
							title: item.title,
							content: item.contentSnippet,
							publishedAt: new Date(item.pubDate),
							img: await newsPaper.getImageLink(item.content)
						});
					}
				}
			});
		});
	}

	static async getNewsPaging(limitPost, offsetPage) {
		return newsPaper.findAll({
			offset: Number(offsetPage),
			limit: Number(limitPost),
			order: [ [ 'publishedAt', 'DESC' ] ]
		});
	}
}
newsPaper.init(
	{
		//attribute
		link: {
			type: Sequelize.STRING,
			unique: true,
			allowNull: false
		},
		title: {
			type: Sequelize.STRING,
			allowNull: false
		},
		content: {
			type: Sequelize.TEXT,
			allowNull: false,
			defaultValue: false
		},
		img: {
			type: Sequelize.TEXT,
			allowNull: true
		},
		publishedAt: {
			type: Sequelize.DATE
		}
	},
	{
		sequelize: db,
		modelName: 'newsPaper'
	}
);

module.exports = newsPaper;
