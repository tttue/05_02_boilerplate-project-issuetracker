const tool = require("./tool")

var s ="5d638c8dcb4f100c70d53144";

var testId = /^[0-9a-f]{24}$/
console.log(testId.test(s));