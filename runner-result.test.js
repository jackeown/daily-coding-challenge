import test from 'node:test';
import assert from 'node:assert/strict';
import { readRunResult } from './runner-result.js';

test('a C++ compile error is shown even when the runner also mentions a timeout', () => {
  const error="main.cpp:5:17: error: 'vector' was not declared in this scope";
  const result=readRunResult({stdout:'',stderr:error,exception:'E001: operation timed out'},4);
  assert.equal(result.summary,'Compilation failed. See the compiler output below.');
  assert.match(result.diagnostics,/main\.cpp:5:17: error:/);
  assert.equal(result.success,false);
});

test('compiler output remains visible after partial test output', () => {
  const result=readRunResult({stdout:'CASE 1 PASS\n',stderr:'main.cpp:9:3: error: bad expression'},4);
  assert.equal(result.cases.length,1);
  assert.match(result.diagnostics,/bad expression/);
  assert.match(result.summary,/Compilation failed/);
});

test('a measured slow function is reported as a time limit', () => {
  const result=readRunResult({stdout:'CASE 1 PASS\nCASE 2 TIMEOUT | 1450 ms\n'},2);
  assert.match(result.summary,/Time limit exceeded/);
});

test('passing tests stay successful', () => {
  const result=readRunResult({stdout:'CASE 1 PASS\nCASE 2 PASS\n'},2);
  assert.equal(result.success,true);
});

test('failed cases preserve the reported actual value and program output', () => {
  const result=readRunResult({stdout:'CASE 1 FAIL | actual [1,0,0]\ndebug: checked the stack\n'},1);
  assert.equal(result.cases[0].detail,'actual [1,0,0]');
  assert.equal(result.diagnostics,'debug: checked the stack');
});
