const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(process.cwd(), 'private.env') });
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });
mongoose.set('useCreateIndex', true);
const tool = require("./tool")

const issueTrackerSchema = new mongoose.Schema({
	project: String,
	issue_title: String,
	issue_text: String,
	created_on: Date,
	updated_on: Date,
	created_by: String,
	assigned_to: String,
	open: Number,
	status_text: String
});
issueTrackerSchema.index({ project: 1 });
issueTrackerSchema.index({ created_by: 1 });
issueTrackerSchema.index({ created_on: 1 });
issueTrackerSchema.index({ updated_on: 1 });
issueTrackerSchema.index({ open: 1 });

const IssueTracker = mongoose.model('IssueTracker', issueTrackerSchema);

const createIssueTracker = (project, inputIssue, done) => {
	let checkParamList = [
		{ param: inputIssue.issue_title, checkFunc: tool.checkStringNotBlank, paramName: "issue_title" },
		{ param: inputIssue.issue_text, checkFunc: tool.checkStringNotBlank, paramName: "issue_text" },
		{ param: inputIssue.created_by, checkFunc: tool.checkStringNotBlank, paramName: "created_by" }
	]
	if (!tool.checkParams(checkParamList, done)) {
		return
	}

	let objIssueTracker = {
		project: project,
		issue_title: inputIssue.issue_title,
		issue_text: inputIssue.issue_text,
		created_on: inputIssue.created_on ? inputIssue.created_on : new Date(),
		updated_on: inputIssue.updated_on ? inputIssue.updated_on : new Date(),
		created_by: inputIssue.created_by,
		assigned_to: inputIssue.assigned_to,
		open: 1,
		status_text: inputIssue.status_text
	}
	let issueTracker = new IssueTracker(objIssueTracker);
	issueTracker.save((err, data) => {
		if (err) {
			done(err)
		} else {
			data.open = (data.open === 1);
			done(null, { errorCode: 0, data: data })
		}
	});
};


const updateIssueTracker = (project, inputIssue, done) => {
	let checkParamList = [
		{ param: inputIssue._id, checkFunc: tool.checkId, paramName: "_id", isNotBlank: true }
	]
	if (!tool.checkParams(checkParamList, done)) {
		return
	}

	IssueTracker.findById({ _id: inputIssue._id }, (err, dataIssue) => {
		if (err) {
			done(err);
		} else if (!dataIssue) {
			done(err, { errorCode: -1, text: 'could not update ' + inputIssue._id, errorMsg: "Issue id_=" + inputIssue._id + " not found" });
		} else if (project !== dataIssue.project) {
			done(err, { errorCode: -1, text: 'could not update ' + inputIssue._id, errorMsg: "Project of Issue id_=" + inputIssue._id + " is not match" });
		} else {
			let bUpdate = false;
			if (inputIssue.issue_title) {
				dataIssue.issue_title = inputIssue.issue_title;
				bUpdate = true;
			}
			if (inputIssue.issue_text) {
				dataIssue.issue_text = inputIssue.issue_text;
				bUpdate = true;
			}
			if (inputIssue.created_by) {
				dataIssue.created_by = inputIssue.created_by;
				bUpdate = true;
			}
			if (inputIssue.assigned_to) {
				dataIssue.assigned_to = inputIssue.assigned_to;
				bUpdate = true;
			}
			if (inputIssue.status_text) {
				dataIssue.status_text = inputIssue.status_text;
				bUpdate = true;
			}
			if (inputIssue.open === "false" && dataIssue.open === 1) {
				dataIssue.open = 0;
				bUpdate = true;
			} else if ((!inputIssue.open || inputIssue.open === "true") && dataIssue.open === 0) {
				dataIssue.open = 1;
				bUpdate = true;
			}

			if (bUpdate) {
				dataIssue.updated_on = new Date();
				dataIssue.save((err, data1) => err ? done(err) : done(null, { errorCode: 0, text: 'successfully updated', data: data1 }));
			} else {
				done(err, { errorCode: 0, text: 'nothing change', data: dataIssue });
			}
		}
	});
};



const deleteIssueTracker = (project, inputIssue, done) => {
	let checkParamList = [
		{ param: inputIssue._id, checkFunc: tool.checkId, paramName: "_id", isNotBlank: true }
	]
	if (!tool.checkParams(checkParamList, done)) {
		return
	}


	IssueTracker.findById({ _id: inputIssue._id }, (err, dataIssue) => {
		if (err) {
			done(err);
		} else if (!dataIssue) {
			done(err, { errorCode: -1, errorMsg: "Issue id_=" + inputIssue._id + " not found" });
		} else if (project !== dataIssue.project) {
			done(err, { errorCode: -1, errorMsg: "Project of Issue id_=" + inputIssue._id + " is not match" });
		} else {
			IssueTracker.deleteOne({ _id: dataIssue._id }, (err) => err ? done(null, { errorCode: -1, text: 'could not delete ' + inputIssue._id }) : done(null, { errorCode: 0, text: "deleted " + inputIssue._id }));
		}
	});
};


const getIssueTracker = (project, inputSearch, done) => {
	let checkParamList = [
		{ param: inputSearch._id, checkFunc: tool.checkId, paramName: "_id"}
	]
	if (!tool.checkParams(checkParamList, done)) {
		return
	}

	if (inputSearch.open === "true") {
		inputSearch.open = 1
	} else if (inputSearch.open === "false") {
		inputSearch.open = 0
	} else {
		inputSearch.open = undefined;
	}
	let searchObj = {
		project: project,
		_id: inputSearch._id,
		issue_title: inputSearch.issue_title,
		issue_text: inputSearch.issue_text,
		created_on: inputSearch.created_on,
		updated_on: inputSearch.updated_on,
		created_by: inputSearch.created_by,
		assigned_to: inputSearch.assigned_to,
		open: inputSearch.open,
		status_text: inputSearch.status_text
	}
	// Remove property=undefined
	for (let property in searchObj) {
		if (searchObj[property] === undefined) {
			delete searchObj[property];
		}
	}
	IssueTracker.find(searchObj, (err, data) => {
		if (err) {
			done(err);
		} else
			done(null, { errorCode: 0, data: data });
	});
};

exports.IssueTrackerModel = IssueTracker;
exports.createIssueTracker = createIssueTracker;
exports.updateIssueTracker = updateIssueTracker;
exports.deleteIssueTracker = deleteIssueTracker;
exports.getIssueTracker = getIssueTracker;