/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 450:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 645:
/***/ ((module) => {

module.exports = eval("require")("axios");


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
const core = __nccwpck_require__(450);
const axios = __nccwpck_require__(645);

const main = async () => {
    let status = "NOT-STARTED";
    try {
        console.log('Custom Action - UPDATE => START');
        const instanceUrl = core.getInput('instance-url');
        const username = core.getInput('devops-integration-user-name', { required: false });
        const passwd = core.getInput('devops-integration-user-password', { required: false });
        const changeRequestNumber = core.getInput('change-request-number', { required: false });
        const devopsIntegrationToken = core.getInput('devops-integration-token', { required: false });
        const toolId = core.getInput('tool-id', { required: false });
        let changeRequestDetailsStr = core.getInput('change-request-details', { required: true });
        let githubContextStr = core.getInput('context-github', { required: true });

        core.setOutput("status", status);
        try {

            console.log('Calling Update Change Control API to update change.... for changeRequestNumber => ' + changeRequestNumber);

            let changeRequestDetails;
            let githubContext;

            if (changeRequestNumber == "") {
                displayErrorMsg("Please Provide a valid 'Change Request Number' to proceed with Update Change Request");
                return;
            }
            if (instanceUrl == "") {
                displayErrorMsg("Please Provide a valid 'Instance Url' to proceed with Update Change Request");
                return;
            }

            try {
                changeRequestDetails = JSON.parse(changeRequestDetailsStr);
            } catch (e) {
                console.log(`Unable to parse Error occured with message ${e}`);
                displayErrorMsg("Failed parsing changeRequestDetails, please provide a valid JSON");
                return;
            }


            try {
                githubContext = JSON.parse(githubContextStr);
            } catch (e) {
                console.log(`Error occured with message ${e}`);
                displayErrorMsg("Exception parsing github context");
                return;
            }

            try {
                const endpointv1 = `${instanceUrl}/api/sn_devops/v1/devops/orchestration/changeInfo?changeRequestNumber=${changeRequestNumber}`;
                const endpointv2 = `${instanceUrl}/api/sn_devops/v2/devops/orchestration/changeInfo?changeRequestNumber=${changeRequestNumber}`;
                let response;
                let httpHeaders;
                if (!devopsIntegrationToken && !username && !passwd) {
                    core.setFailed('Either secret token or integration username, password is needed for integration user authentication');
                    return;
                } else if (devopsIntegrationToken) {
                    const defaultHeadersv2 = {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': 'sn_devops.DevOpsToken ' + `${toolId}` + ':' + `${devopsIntegrationToken}`
                    };
                    httpHeaders = { headers: defaultHeadersv2 };
                    restendpoint = endpointv2;
                } else if (username && passwd) {
                    const token = `${username}:${passwd}`;
                    const encodedToken = Buffer.from(token).toString('base64');
                    const defaultHeadersv1 = {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': 'Basic ' + `${encodedToken}`
                    };
                    httpHeaders = { headers: defaultHeadersv1 };
                    restendpoint = endpointv1;
                } else {
                    core.setFailed('For Basic Auth, Username and Password is mandatory for integration user authentication');
                    return;
                }
                core.debug("[ServiceNow DevOps], Sending Request for Update Change, Request Header :"+JSON.stringify(httpHeaders)+", Payload :"+JSON.stringify(payload)+"\n");
                response = await axios.put(restendpoint, changeRequestDetailsStr, httpHeaders);
                core.debug("[ServiceNow DevOps], Receiving response for Update Change, Response :"+response+"\n");
                if (response.data && response.data.result) {
                    status = response.data.result.status;
                    console.log('\n \x1b[1m\x1b[32m' + "Status of the Update => " + status + ", and the message => " + response.data.result.message + '\x1b[0m\x1b[0m');
                } else {
                    status = "NOT SUCCESSFUL";
                    displayErrorMsg('No response from ServiceNow. Please check ServiceNow logs for more details.');
                }

            } catch (err) {
                if (!err.response) {
                    status = "NOT SUCCESSFUL";
                    displayErrorMsg('No response from ServiceNow. Please check ServiceNow logs for more details.');
                } else {
                    status = "FAILURE";
                    if (err.message.includes('ECONNREFUSED') || err.message.includes('ENOTFOUND')) {
                        displayErrorMsg('Invalid ServiceNow Instance URL. Please correct the URL and try again.');
                    }

                    if (err.message.includes('401')) {
                        displayErrorMsg('Invalid Credentials. Please correct the credentials and try again.');
                    }

                    if (err.message.includes('405')) {
                        displayErrorMsg('Response Code from ServiceNow is 405. Please check ServiceNow logs for more details.');
                    }

                    if (err.response.status == 500) {
                        displayErrorMsg('Response Code from ServiceNow is 500. Please check ServiceNow logs for more details.')
                    }

                    if (err.response.status == 400) {
                        let errMsg = 'ServiceNow DevOps Update Change is not Succesful.';
                        let errMsgSuffix = ' Please provide valid inputs.';
                        let responseData = err.response.data;
                        if (responseData && responseData.error && responseData.error.message) {
                            errMsg = errMsg + responseData.error.message + errMsgSuffix;
                        } else if (responseData && responseData.result && responseData.result.details && responseData.result.details.errors) {
                            let errors = err.response.data.result.details.errors;
                            for (var index in errors) {
                                errMsg = errMsg + errors[index].message + errMsgSuffix;
                            }
                        }
                        displayErrorMsg(errMsg);

                    }
                }
            }

        } catch (err) {
            core.setOutput("status", status);
            core.setFailed(err.message);
        }

    } catch (error) {
        core.setOutput("status", status);
        core.setFailed(error.message);
    }
    core.setOutput("status", status);
}

function displayErrorMsg(errMsg) {

    console.error('\n\x1b[31m' + errMsg + '\x1b[31m');
    core.setFailed(errMsg);
}

main();
})();

module.exports = __webpack_exports__;
/******/ })()
;