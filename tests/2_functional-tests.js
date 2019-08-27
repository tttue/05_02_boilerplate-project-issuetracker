/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);
let insertId = "";
suite('Functional Tests', function () {

	suite('POST /api/issues/{project} => object with issue data', function () {

		test('Every field filled in', function (done) {
			chai.request(server)
				.post('/api/issues/test')
				.send({
					issue_title: 'Title',
					issue_text: 'text',
					created_by: 'Functional Test - Every field filled in',
					assigned_to: 'Chai and Mocha',
					status_text: 'In QA'
				})
				.end(function (err, res) {
					assert.equal(res.status, 200);
					assert.equal(res.body.errorCode, 0);

					assert.equal(res.body.data.project, 'test');
					assert.equal(res.body.data.issue_title, 'Title');
					assert.equal(res.body.data.issue_text, 'text');
					assert.equal(res.body.data.created_by, 'Functional Test - Every field filled in');
					assert.equal(res.body.data.assigned_to, 'Chai and Mocha');
					assert.equal(res.body.data.status_text, 'In QA');

					assert.equal(res.body.data.open, 1);
					assert.isString(res.body.data._id);
					assert.isNotNull(res.body.data.created_on);
					assert.isNotNull(res.body.data.updated_on);
					insertId = res.body.data._id;
					done();
				});
		});

		test('Required fields filled in', function (done) {
			chai.request(server)
				.post('/api/issues/test')
				.send({
					issue_title: 'Title1',
					issue_text: 'text1',
					created_by: 'Functional Test - Every field filled in1'
				})
				.end(function (err, res) {
					assert.equal(res.status, 200);
					assert.equal(res.body.errorCode, 0);

					assert.equal(res.body.data.project, 'test');
					assert.equal(res.body.data.issue_title, 'Title1');
					assert.equal(res.body.data.issue_text, 'text1');
					assert.equal(res.body.data.created_by, 'Functional Test - Every field filled in1');
					assert.isUndefined(res.body.data.assigned_to);
					assert.isUndefined(res.body.data.status_text);

					assert.equal(res.body.data.open, 1);
					assert.isString(res.body.data._id);
					assert.isNotNull(res.body.data.created_on);
					assert.isNotNull(res.body.data.updated_on);

					done();
				});
		});

		test('Missing required fields', function (done) {
			var pros = ["issue_title", "issue_text", "created_by"]
			pros.forEach((elm, i) => {
				let obj = {
					issue_title: 'Title1',
					issue_text: 'text1',
					created_by: 'Functional Test - Every field filled in1'
				}
				delete obj[elm];
				chai.request(server)
					.post('/api/issues/test')
					.send(obj)
					.end(function (err, res) {
						assert.equal(res.status, 200);

						assert.equal(res.body.errorCode, -2);
						assert.equal(res.body.errorMsg, elm + " must be not blank");

					});
			})
			done();

		});

	});

	suite('PUT /api/issues/{project} => text', function () {

		test('No id', function (done) {
			chai.request(server)
				.put('/api/issues/test')
				.send({})
				.end(function (err, res) {
					assert.equal(res.status, 200);

					assert.equal(res.body.errorCode, -2);
					assert.equal(res.body.errorMsg, "_id must be not blank");
					done();

				});
		});

		test('No body', function (done) {
			chai.request(server)
				.put('/api/issues/test')
				.send({ _id: insertId })
				.end(function (err, res) {
					assert.equal(res.status, 200);
					assert.equal(res.body.errorCode, 0);

					assert.equal(res.body.data.project, 'test');
					assert.equal(res.body.data._id, insertId);
					assert.isNotNull(res.body.data.created_on);
					assert.isNotNull(res.body.data.updated_on);
					done();

				});
		});

		test('One field to update', function (done) {
			var pros = ["issue_title", "issue_text", "created_by", "assigned_to", "status_text", "open"]
			let objUpdate = {
				issue_title: '432Test_Title',
				issue_text: '432Test_text',
				created_by: '432Test_Functional Test - Every field filled in',
				assigned_to: '432Test_Chai and Mocha',
				status_text: '432Test_In QA',
				open: "true"
			}
			pros.forEach((elm, i) => {
				let obj = {
					_id: insertId
				}
				obj[elm] = objUpdate[elm];
				chai.request(server)
					.put('/api/issues/test')
					.send(obj)
					.end(function (err, res) {
						assert.equal(res.status, 200);
						assert.equal(res.body.errorCode, 0);

						assert.equal(res.body.data.project, 'test');
						if (elm !== "open") {
							assert.equal(res.body.data[elm], objUpdate[elm]);
						} else {
							assert.equal(res.body.data[elm], 1);
						}

						assert.equal(res.body.data._id, insertId);
						assert.isNotNull(res.body.data.created_on);
						assert.isNotNull(res.body.data.updated_on);

					});
			})
			done();

		});

		test('Multiple fields to update', function (done) {
			let objUpdate = {
				_id: insertId,
				issue_title: '1432Test_Title',
				issue_text: '1432Test_text',
				created_by: '1432Test_Functional Test - Every field filled in',
				assigned_to: '1432Test_Chai and Mocha',
				status_text: '1432Test_In QA',
				open: "true"
			}
			chai.request(server)
				.put('/api/issues/test')
				.send(objUpdate)
				.end(function (err, res) {
					assert.equal(res.status, 200);
					assert.equal(res.body.errorCode, 0);

					assert.equal(res.body.data.project, 'test');
					assert.equal(res.body.data.issue_title, objUpdate.issue_title);
					assert.equal(res.body.data.issue_text, objUpdate.issue_text);
					assert.equal(res.body.data.created_by, objUpdate.created_by);
					assert.equal(res.body.data.assigned_to, objUpdate.assigned_to);
					assert.equal(res.body.data.status_text, objUpdate.status_text);
					assert.equal(res.body.data.open, 1);
					assert.equal(res.body.data._id, insertId);
					assert.isNotNull(res.body.data.created_on);
					assert.isNotNull(res.body.data.updated_on);

				});

			done();
		});

	});

	suite('GET /api/issues/{project} => Array of objects with issue data', function () {
		test('No filter', function (done) {
			this.timeout(10000);
			chai.request(server)
				.get('/api/issues/test')
				.query({})
				.end(function (err, res) {
					assert.equal(res.status, 200);
					assert.equal(res.body.errorCode, 0);

					assert.isArray(res.body.data);
					assert.equal(res.body.data[0].project, 'test');
					assert.property(res.body.data[0], 'issue_title');
					assert.property(res.body.data[0], 'issue_text');
					assert.property(res.body.data[0], 'created_on');
					assert.property(res.body.data[0], 'updated_on');
					assert.property(res.body.data[0], 'created_by');
					assert.property(res.body.data[0], 'open');
					assert.property(res.body.data[0], '_id');
					done();
				});
		});

		test('One filter', function (done) {
			this.timeout(5000);
			chai.request(server)
				.get('/api/issues/test')
				.query({ _id: insertId })
				.end(function (err, res) {
					assert.equal(res.status, 200);
					assert.equal(res.body.errorCode, 0);

					assert.isArray(res.body.data);
					assert.equal(res.body.data.length, 1);
					assert.equal(res.body.data[0].project, 'test');
					assert.property(res.body.data[0], 'issue_title');
					assert.property(res.body.data[0], 'issue_text');
					assert.property(res.body.data[0], 'created_on');
					assert.property(res.body.data[0], 'updated_on');
					assert.property(res.body.data[0], 'created_by');
					assert.property(res.body.data[0], 'open');
					assert.property(res.body.data[0], '_id');
					done();
				});

		});

		test('Multiple filters (test for multiple fields you know will be in the db for a return)', function (done) {
			this.timeout(5000);
			chai.request(server)
				.get('/api/issues/apitest')
				.query({ created_by: "qwe", open: "true" })
				.end(function (err, res) {
					assert.equal(res.status, 200);
					assert.equal(res.body.errorCode, 0);

					assert.isArray(res.body.data);
					res.body.data.forEach((elm, i) => {
						assert.equal(elm.project, 'apitest');
						assert.equal(elm.created_by, "qwe");
						assert.equal(elm.open, 1);
						assert.property(elm, 'issue_title');
						assert.property(elm, 'issue_text');
						assert.property(elm, 'created_on');
						assert.property(elm, 'updated_on');
						assert.property(elm, 'assigned_to');
						assert.property(elm, 'status_text');
						assert.property(elm, '_id');
					});
					done();
				});

		});

	});

	suite('DELETE /api/issues/{project} => text', function () {

		test('No _id', function (done) {
			chai.request(server)
				.delete('/api/issues/test')
				.send({})
				.end(function (err, res) {
					assert.equal(res.status, 200);

					assert.equal(res.body.errorCode, -2);
					assert.equal(res.body.errorMsg, "_id must be not blank");
					done();

				});
		});

		test('Valid _id', function (done) {
			chai.request(server)
				.delete('/api/issues/test')
				.send({ _id: insertId })
				.end(function (err, res) {
					assert.equal(res.status, 200);
					assert.equal(res.body.errorCode, 0);

					assert.equal(res.body.text, "deleted " + insertId);
					done();

				});

		});

	});

});
