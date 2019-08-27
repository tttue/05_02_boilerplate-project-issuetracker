/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
const bodyParser = require('body-parser')
const database_tool = require("../database_tool");

const timeout = 10000;

module.exports = function (app) {
	app.use(bodyParser.urlencoded({ extended: false }))
	app.use(bodyParser.json())

	app.route('/api/issues/:project')

		.get(function (req, res) {
			var project = req.params.project;
			console.log(req.body);
			var t = setTimeout(() => { next({ message: 'timeout' }) }, timeout);
			database_tool.getIssueTracker(project, req.body,(err, info)=>{
				clearTimeout(t);
				err ? next(err) : res.json(info);
			})
		})

		.post(function (req, res,next) {
			var project = req.params.project;
			console.log(req.body);
			var t = setTimeout(() => { next({ message: 'timeout' }) }, timeout);
			database_tool.createIssueTracker(project, req.body, (err, info) => {
				clearTimeout(t);
				err ? next(err) : res.json(info);
			});
		})

		.put(function (req, res,next) {
			var project = req.params.project;
			console.log(req.body);
			var t = setTimeout(() => { next({ message: 'timeout' }) }, timeout);
			database_tool.updateIssueTracker(project, req.body, (err, info) => {
				clearTimeout(t);
				err ? next(err) : res.json(info);
			});

		})

		.delete(function (req, res) {
			var project = req.params.project;
			console.log(req.body);
			var t = setTimeout(() => { next({ message: 'timeout' }) }, timeout);
			database_tool.deleteIssueTracker(project, req.body, (err, info) => {
				clearTimeout(t);
				err ? next(err) : res.json(info);
			});
		});

};
