const fs   = require('fs');
const path = require('path');
const vm   = require('../vm');

test('The VM should be able to create a context', () => {
  const event = {
    ResourceProperties: {
      Code: 'console.log("foo")',
      foo: 'bar'
    }
  };
  const ctx = vm.createContext(event.ResourceProperties);
  expect(ctx.props.foo).toEqual(event.ResourceProperties.foo);
  expect(ctx.require).not.toBeUndefined();
  expect(ctx.console).not.toBeUndefined();
});

test('The VM should be able to run synchronous code', async () => {
  const event = {
    ResourceProperties: {
      Code: fs.readFileSync(path.resolve(__dirname, 'test-scripts', 'sync.js')).toString(),
      foo: 'bar'
    }
  };
  const ctx = vm.createContext(event.ResourceProperties);
  await vm.runInContext(event.ResourceProperties.Code, ctx);
  expect(ctx.__cfn_eval_vm_result).toEqual({ key: "bar" });
  return (true);
});

test('The VM should be able to run synchronous code returning a string literal', async () => {
  const event = {
    ResourceProperties: {
      Code: fs.readFileSync(path.resolve(__dirname, 'test-scripts', 'literal.js')).toString()
    }
  };
  const ctx = vm.createContext(event.ResourceProperties);
  await vm.runInContext(event.ResourceProperties.Code, ctx);
  expect(ctx.__cfn_eval_vm_result).toEqual('foo');
  return (true);
});

test('The VM should be able to run code calling require', async () => {
  const event = {
    ResourceProperties: {
      Code: fs.readFileSync(path.resolve(__dirname, 'test-scripts', 'crypto.js')).toString(),
      foo: 'bar',
      bar: 'baz'
    }
  };
  const ctx = vm.createContext(event.ResourceProperties);
  await vm.runInContext(event.ResourceProperties.Code, ctx);
  expect(typeof ctx.__cfn_eval_vm_result.FooMd5).toEqual('string');
  expect(typeof ctx.__cfn_eval_vm_result.BarMd5).toEqual('string');
  expect(typeof ctx.__cfn_eval_vm_result.FooSha1).toEqual('string');
  expect(typeof ctx.__cfn_eval_vm_result.BarSha1).toEqual('string');
  return (true);
});

test('The VM should be able to run asynchronous code', async () => {
  const event = {
    ResourceProperties: {
      Code: fs.readFileSync(path.resolve(__dirname, 'test-scripts', 'async.js')).toString(),
      Username: 'HQarroum'
    }
  };
  const ctx = vm.createContext(event.ResourceProperties);
  await vm.runInContext(event.ResourceProperties.Code, ctx);
  expect(ctx.__cfn_eval_vm_result.login).toEqual('HQarroum');
  return (true);
});
