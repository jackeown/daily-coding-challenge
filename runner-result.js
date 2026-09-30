function asText(value) {
  if(value == null) return '';
  if(typeof value === 'string') return value;
  if(typeof value === 'object') return value.message || JSON.stringify(value, null, 2);
  return String(value);
}

export function readRunResult(result, expectedCount, exampleOnly=false) {
  const stdout=asText(result?.stdout);
  const cases=[...stdout.matchAll(/^CASE (\d+) (PASS|FAIL|ERROR|TIMEOUT)(.*)$/gm)].map((match)=>({number:Number(match[1]),status:match[2],detail:match[3].trim().replace(/^\|\s*/,'')}));
  const otherOutput=stdout.split('\n').filter(line=>!/^CASE \d+ (PASS|FAIL|ERROR|TIMEOUT)(?:\b|$)/.test(line)).join('\n').trim();
  const diagnostics=[asText(result?.stderr),asText(result?.exception),asText(result?.error),otherOutput].filter(Boolean).join('\n').trim();
  const compileError=/(?:^|\n).*?(?:fatal error:|\berror:|compilation failed|cannot find symbol|not declared|undeclared|undefined reference|SyntaxError)/i.test(diagnostics);
  const runnerTimeout=/(?:operation timed out|execution timed out|time limit exceeded|\btimeout\b)/i.test([asText(result?.exception),asText(result?.error)].join('\n'));
  const timedOut=!compileError&&(runnerTimeout||cases.some(c=>c.status==='TIMEOUT'));
  const passed=cases.filter(c=>c.status==='PASS').length;
  const success=!compileError&&!timedOut&&cases.length===expectedCount&&passed===expectedCount;
  let summary;
  if(compileError) summary='Compilation failed. See the compiler output below.';
  else if(timedOut) summary='Time limit exceeded. Try a faster approach.';
  else if(success) summary=exampleOnly?'Example passed. Check all tests when ready.':'All tests passed. Come back tomorrow for the next problem.';
  else if(cases.length) summary=`${passed} of ${expectedCount} tests passed. Review the cases below.`;
  else if(diagnostics) summary='Run failed. See the compiler or runner output below.';
  else summary='The runner returned no test results. Try again.';
  return {cases,diagnostics,passed,success,summary};
}
