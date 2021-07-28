const vm = require('vm');

/**
 * Returns the timeout value associated with
 * the execution of the VM.
 */
const getTimeout = () => {
  if (process.env.TIMEOUT) {
    return (parseInt(process.env.TIMEOUT));
  }
  return (30 * 1000);
};

/**
 * Returns the prepared context to pass to the VM.
 */
exports.createContext = (args) => {
  const ctx = Object.assign({ require, console, process }, { props: { ...args } });
  vm.createContext(ctx);
  return (ctx);
};

/**
 * Executes the provided code with the context
 * in the VM.
 */
exports.runInContext = async (code, ctx) => {
  return (await vm.runInNewContext(`
    var __cfn_eval_vm_result = undefined;
    Promise.resolve()
      .then(async () => {${code}})
      .then((res) => { __cfn_eval_vm_result = res })
    `, ctx, { timeout: getTimeout() }));
};