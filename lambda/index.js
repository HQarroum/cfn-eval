const Joi      = require('joi');
const vm       = require('./vm');
const request  = require('request-promise');

/**
 * Cloudformation result codes.
 */
const Result = {
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILED'
};

/**
 * The schema of a Cloudformation request event.
 */
const schema = Joi.object().keys({
  RequestType: Joi.string().valid('Create', 'Update', 'Delete').required(),
  LogicalResourceId: Joi.string().required(),
  ResourceProperties: Joi.object().keys({
    Code: Joi.string().required()
  }).unknown().required()
}).unknown().required();

/**
 * @return a constructed and valid body response for Cloudformation.
 * @param {*} ev the received event.
 * @param {*} ctx the lambda context.
 * @param {*} responseStatus the response status.
 * @param {*} resData the response data object.
 */
const createResponse = function (ev, ctx, responseStatus, resData) {
  const body = {
    Status: responseStatus,
    Reason: resData instanceof Error ? resData.toString() : `See the details in CloudWatch Log Stream: ${ctx.logStreamName}`,
    PhysicalResourceId: ev.RequestId,
    StackId: ev.StackId,
    RequestId: ev.RequestId,
    LogicalResourceId: ev.LogicalResourceId,
    Data: responseStatus === Result.FAILURE ? null : resData
  };
  // Verifying whether the body length is less than the maximum authorized size.
  return (JSON.stringify(body).length > 4096 ? Object.assign(body, { Data: null }) : body);
};

/**
 * Responds to the Cloudformation service by sending information
 * on the success or the failure on a resource operation.
 * @param {*} event the received `event` object.
 */
const sendResponse = function (event) {
  // Creating the Cloudformation response object.
  const responseBody = createResponse.apply(this, arguments);
  return (request({
    method: 'PUT',
    uri: event.ResponseURL,
    body: JSON.stringify(responseBody),
    headers: {
      'content-type': '',
      'content-length': JSON.stringify(responseBody).length
    }
  }));
};

/**
 * Lambda function entry point.
 * @param {*} event the lambda function input `event`.
 * @param {*} event the lambda function `context` object.
 */
exports.handler = async (event, context) => {
  const result = schema.validate(event);

  // Validating the `event` object and its attributes.
  if (result.error) {
    return (sendResponse(event, context, Result.FAILED, { error: result.error }));
  }

  try {
    if (event.RequestType === 'Create' || event.RequestType === 'Update') {
      // Retrieving parameters declared on the custom resource.
      const { Code } = event.ResourceProperties;
      const ctx = vm.createContext(event.ResourceProperties);
      // Trigger the execution of the declared code.
      await vm.runInContext(Code, ctx);
      // Sending the response.
      return (sendResponse(event, context, Result.SUCCESS, ctx.__cfn_eval_vm_result));
    }
    return (sendResponse(event, context, Result.SUCCESS, {}));
  } catch (e) {
    console.error(e);
    return (sendResponse(event, context, Result.FAILURE, { error: e }));
  }
};