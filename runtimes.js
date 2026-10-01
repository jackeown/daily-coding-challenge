import { typedCases } from './contracts.js';
import { performanceCase } from './challenge-data.js';

export const guidedLanguages = ['python','cpp','c','java','javascript','rust'];
const files = {javascript:'main.js',python:'main.py',cpp:'main.cpp',c:'main.c',java:'Main.java',rust:'main.rs'};
export const runtimeName = (contract,language) => language==='rust' ? contract.name.replace(/[A-Z]/g,c=>'_'+c.toLowerCase()) : contract.name;
const types = {
  cpp:{n:'int',f:'double',s:'string',b:'bool',N:'vector<int>',S:'vector<string>',M:'vector<vector<int>>',G:'vector<vector<string>>'},
  c:{n:'int',f:'double',s:'const char*',b:'bool',N:'IntArray',S:'StringArray',M:'IntMatrix',G:'StringMatrix'},
  java:{n:'int',f:'double',s:'String',b:'boolean',N:'int[]',S:'String[]',M:'int[][]',G:'String[][]'},
  rust:{n:'i64',f:'f64',s:'String',b:'bool',N:'Vec<i64>',S:'Vec<String>',M:'Vec<Vec<i64>>',G:'Vec<Vec<String>>'}
};
const defaults = {cpp:{n:'0',f:'0.0',s:'""',b:'false',N:'{}',S:'{}',M:'{}',G:'{}'},c:{n:'0',f:'0.0',s:'""',b:'false',N:'(IntArray){NULL, 0}',S:'(StringArray){NULL, 0}',M:'(IntMatrix){NULL, 0}',G:'(StringMatrix){NULL, 0}'},java:{n:'0',f:'0.0',s:'""',b:'false',N:'null',S:'null',M:'null',G:'null'},rust:{n:'0',f:'0.0',s:'String::new()',b:'false',N:'vec![]',S:'vec![]',M:'vec![]',G:'vec![]'}};
const cPreamble = `#include <stdio.h>
#include <stdbool.h>
#include <string.h>
#include <stddef.h>
#include <stdlib.h>
#include <time.h>

typedef struct { int *data; int size; } IntArray;
typedef struct { const char **data; int size; } StringArray;
typedef struct { IntArray *rows; int size; } IntMatrix;
typedef struct { StringArray *rows; int size; } StringMatrix;
`;
function cLiteral(value,type) {
  if(type==='s') return JSON.stringify(value);
  if(type==='b') return value?'true':'false';
  if(type==='n') return String(value);
  if(type==='f') return Number.isInteger(value)?`${value}.0`:String(value);
  const inner={N:'n',S:'s',M:'N',G:'S'}[type];
  if(!value.length) return `(${types.c[type]}){NULL, 0}`;
  const itemType={N:'int',S:'const char*',M:'IntArray',G:'StringArray'}[type];
  return `(${types.c[type]}){(${itemType}[]){${value.map(x=>cLiteral(x,inner)).join(', ')}}, ${value.length}}`;
}
const cEquals = {n:'__actual == __expected',f:'__actual == __expected',b:'__actual == __expected',s:'strcmp(__actual, __expected) == 0',N:'equalIntArray(__actual, __expected)',S:'equalStringArray(__actual, __expected)',M:'equalIntMatrix(__actual, __expected)',G:'equalStringMatrix(__actual, __expected)'};
const cComparators = `
IntArray makeRepeat(int length, int value) {
    int *data = malloc((size_t)length * sizeof(int));
    for (int i = 0; i < length; i++) data[i] = value;
    return (IntArray){data, length};
}
IntArray makeSequence(int length, int start, int step) {
    int *data = malloc((size_t)length * sizeof(int));
    for (int i = 0; i < length; i++) data[i] = start + i * step;
    return (IntArray){data, length};
}
bool equalIntArray(IntArray a, IntArray b) {
    if (a.size != b.size) return false;
    for (int i = 0; i < a.size; i++) if (a.data[i] != b.data[i]) return false;
    return true;
}
bool equalStringArray(StringArray a, StringArray b) {
    if (a.size != b.size) return false;
    for (int i = 0; i < a.size; i++) if (strcmp(a.data[i], b.data[i]) != 0) return false;
    return true;
}
bool equalIntMatrix(IntMatrix a, IntMatrix b) {
    if (a.size != b.size) return false;
    for (int i = 0; i < a.size; i++) if (!equalIntArray(a.rows[i], b.rows[i])) return false;
    return true;
}
bool equalStringMatrix(StringMatrix a, StringMatrix b) {
    if (a.size != b.size) return false;
    for (int i = 0; i < a.size; i++) if (!equalStringArray(a.rows[i], b.rows[i])) return false;
    return true;
}
void printJsonString(const char *value) {
    if (!value) { printf("null"); return; }
    putchar('"');
    for (const unsigned char *p = (const unsigned char *)value; *p; p++) {
        if (*p == '"' || *p == '\\\\') { putchar('\\\\'); putchar(*p); }
        else if (*p == '\\n') printf("\\\\n");
        else if (*p == '\\r') printf("\\\\r");
        else if (*p == '\\t') printf("\\\\t");
        else putchar(*p);
    }
    putchar('"');
}
void printIntArray(IntArray value) {
    putchar('[');
    for (int i = 0; i < value.size; i++) { if (i) putchar(','); printf("%d", value.data[i]); }
    putchar(']');
}
void printStringArray(StringArray value) {
    putchar('[');
    for (int i = 0; i < value.size; i++) { if (i) putchar(','); printJsonString(value.data[i]); }
    putchar(']');
}
void printIntMatrix(IntMatrix value) {
    putchar('[');
    for (int i = 0; i < value.size; i++) { if (i) putchar(','); printIntArray(value.rows[i]); }
    putchar(']');
}
void printStringMatrix(StringMatrix value) {
    putchar('[');
    for (int i = 0; i < value.size; i++) { if (i) putchar(','); printStringArray(value.rows[i]); }
    putchar(']');
}
`;
const cPrint = {n:'printf("%d", __actual);',f:'printf("%.17g", __actual);',b:'printf("%s", __actual ? "true" : "false");',s:'printJsonString(__actual);',N:'printIntArray(__actual);',S:'printStringArray(__actual);',M:'printIntMatrix(__actual);',G:'printStringMatrix(__actual);'};
const cppDisplay = `
template<typename T> string showValue(const vector<T>& value);
template<typename T> string showValue(const T& value) {
    ostringstream out; out << boolalpha << value; return out.str();
}
string showValue(const string& value) {
    ostringstream out; out << quoted(value); return out.str();
}
template<typename T> string showValue(const vector<T>& value) {
    string text = "[";
    for (size_t i = 0; i < value.size(); i++) {
        if (i) text += ",";
        text += showValue(value[i]);
    }
    return text + "]";
}
`;
function resultType(problem) {
  if(problem.title==='Median of Two Sorted Arrays') return 'f';
  const value=typedCases(problem)[0].expected;
  if(typeof value==='number') return 'n';
  if(typeof value==='boolean') return 'b';
  if(typeof value==='string') return 's';
  if(Array.isArray(value)) {
    if(Array.isArray(value[0])) return typeof value[0][0]==='string' || problem.title==='Group Anagrams' ? 'G' : 'M';
    return typeof value[0]==='string' ? 'S' : 'N';
  }
  throw Error('Unknown result type');
}
function cppLiteral(value,type) {
  if(type==='s') return JSON.stringify(value);
  if(type==='b') return value?'true':'false';
  if(type==='n') return String(value);
  if(type==='f') return Number.isInteger(value)?`${value}.0`:String(value);
  const inner={N:'n',S:'s',M:'N',G:'S'}[type];
  return `${types.cpp[type]}{${value.map(x=>cppLiteral(x,inner)).join(', ')}}`;
}
function javaLiteral(value,type) {
  if(type==='s') return JSON.stringify(value);
  if(type==='b') return value?'true':'false';
  if(type==='n') return String(value);
  if(type==='f') return Number.isInteger(value)?`${value}.0`:String(value);
  const inner={N:'n',S:'s',M:'N',G:'S'}[type];
  return `new ${types.java[type]}{${value.map(x=>javaLiteral(x,inner)).join(', ')}}`;
}
function rustLiteral(value,type) {
  if(type==='s') return `${JSON.stringify(value)}.to_string()`;
  if(type==='b') return value?'true':'false';
  if(type==='n') return String(value);
  if(type==='f') return Number.isInteger(value)?`${value}.0`:String(value);
  const inner={N:'n',S:'s',M:'N',G:'S'}[type];
  return `vec![${value.map(x=>rustLiteral(x,inner)).join(', ')}]`;
}
function fileFor(language) { return files[language] || 'main.txt'; }
export function template(problem, contract, language) {
  const args=contract.params.map(([name])=>name).join(', ');
  const result=resultType(problem);
  switch(language) {
    case 'javascript': return `/**\n * ${problem.title}\n * ${contract.params.map(([name,type])=>`${name}: ${jsType(type)}`).join(' · ')}\n * Returns: ${jsType(result)}\n */\nfunction ${contract.name}(${args}) {\n  // Write your solution here.\n}\n`;
    case 'python': return `# ${problem.title}\n# ${contract.params.map(([name,type])=>`${name}: ${pyType(type)}`).join(' · ')}\n# Returns: ${pyType(result)}\ndef ${contract.name}(${args}):\n    # Write your solution here.\n    pass\n`;
    case 'cpp': return `#include <vector>\n#include <string>\nusing namespace std;\n\n// ${problem.title}\n${types.cpp[result]} ${contract.name}(${contract.params.map(([name,type])=>`${types.cpp[type]} ${name}`).join(', ')}) {\n    // Write your solution here.\n    return ${defaults.cpp[result]};\n}\n`;
    case 'c': return `${cPreamble}\n// ${problem.title}\n${types.c[result]} ${contract.name}(${contract.params.map(([name,type])=>`${types.c[type]} ${name}`).join(', ')}) {\n    // Arrays have .data and .size; matrices have .rows and .size.\n    // Write your solution here.\n    return ${defaults.c[result]};\n}\n`;
    case 'java': return `import java.util.*;\n\nclass Main {\n    // ${problem.title}\n    static ${types.java[result]} ${contract.name}(${contract.params.map(([name,type])=>`${types.java[type]} ${name}`).join(', ')}) {\n        // Write your solution here.\n        return ${defaults.java[result]};\n    }\n\n    public static void main(String[] args) {\n        // Tests run here when you press Check.\n    }\n}\n`;
    case 'rust': return `// ${problem.title}\nfn ${runtimeName(contract,language)}(${contract.params.map(([name,type])=>`${name}: ${types.rust[type]}`).join(', ')}) -> ${types.rust[result]} {\n    // Write your solution here.\n    ${defaults.rust[result]}\n}\n`;
    default: return '';
  }
}
function jsType(type){return {n:'number',f:'number',s:'string',b:'boolean',N:'number[]',S:'string[]',M:'number[][]',G:'string[][]'}[type];}
function pyType(type){return {n:'int',f:'float',s:'str',b:'bool',N:'list[int]',S:'list[str]',M:'list[list[int]]',G:'list[list[str]]'}[type];}
function perfLiteral(value,language,type) {
  if(value && typeof value==='object' && !Array.isArray(value) && value.kind){
    const {length}=value;
    if(value.kind==='repeat'){
      const v=value.value;
      return {javascript:`Array(${length}).fill(${v})`,python:`[${v}] * ${length}`,cpp:`vector<int>(${length}, ${v})`,c:`makeRepeat(${length}, ${v})`,java:`makeRepeat(${length}, ${v})`,rust:`vec![${v}; ${length}]`}[language];
    }
    const {start,step}=value;
    return {javascript:`Array.from({length:${length}}, (_, i) => ${start} + i * ${step})`,python:`list(range(${start}, ${start + step*length}, ${step}))`,cpp:`makeSequence(${length}, ${start}, ${step})`,c:`makeSequence(${length}, ${start}, ${step})`,java:`makeSequence(${length}, ${start}, ${step})`,rust:`(0..${length}).map(|i| ${start} + i as i64 * (${step})).collect::<Vec<i64>>()`}[language];
  }
  if(language==='javascript'||language==='python') return JSON.stringify(value);
  return {cpp:cppLiteral,c:cLiteral,java:javaLiteral,rust:rustLiteral}[language](value,type);
}
function performanceRun(problem,contract,language,result) {
  const perf=performanceCase(problem);
  if(!perf)return '';
  const index=typedCases(problem).length+1;
  const args=perf.args.map((arg,i)=>perfLiteral(arg,language,contract.params[i][1])).join(', ');
  const expected=perfLiteral(perf.expected,language,result);
  const call=`${runtimeName(contract,language)}(${args})`;
  const limit=perf.budgetMs;
  if(language==='javascript')return `\ntry { const __started = Date.now(); const __actual = ${call}; const __ms = Date.now() - __started; const __pass = JSON.stringify(__actual) === JSON.stringify(${expected}); console.log('CASE ${index} ' + (__ms > ${limit} ? 'TIMEOUT | ' + __ms + ' ms' : __pass ? 'PASS' : 'FAIL')); } catch (__error) { console.log('CASE ${index} ERROR | ' + __error.message); }`;
  if(language==='python')return `\ntry:\n    import time as __time\n    __started = __time.perf_counter()\n    __actual = ${call}\n    __ms = (__time.perf_counter() - __started) * 1000\n    __pass = __actual == ${expected}\n    print('CASE ${index} ' + (f'TIMEOUT | {__ms:.0f} ms' if __ms > ${limit} else 'PASS' if __pass else 'FAIL'))\nexcept Exception as __error:\n    print(f'CASE ${index} ERROR | {__error}')`;
  if(language==='cpp')return `\n    try { auto __started = chrono::steady_clock::now(); auto __actual = ${call}; auto __ms = chrono::duration_cast<chrono::milliseconds>(chrono::steady_clock::now() - __started).count(); bool __pass = (__actual == ${expected}); cout << "CASE ${index} " << (__ms > ${limit} ? "TIMEOUT" : __pass ? "PASS" : "FAIL"); if (__ms > ${limit}) cout << " | " << __ms << " ms"; cout << '\\n'; } catch (...) { cout << "CASE ${index} ERROR\\n"; }`;
  if(language==='c')return `\n    { clock_t __started = clock(); ${types.c[result]} __actual = ${call}; double __ms = (double)(clock() - __started) * 1000.0 / CLOCKS_PER_SEC; ${types.c[result]} __expected = ${expected}; bool __pass = ${cEquals[result]}; printf("CASE ${index} %s", __ms > ${limit} ? "TIMEOUT" : __pass ? "PASS" : "FAIL"); if (__ms > ${limit}) printf(" | %.0f ms", __ms); printf("\\n"); }`;
  if(language==='java')return `\n        try { long __started = System.nanoTime(); ${types.java[result]} __actual = ${call}; long __ms = (System.nanoTime() - __started) / 1000000; boolean __pass = Objects.deepEquals(__actual, ${expected}); System.out.println("CASE ${index} " + (__ms > ${limit} ? "TIMEOUT | " + __ms + " ms" : __pass ? "PASS" : "FAIL")); } catch (Exception error) { System.out.println("CASE ${index} ERROR " + error.getMessage()); }`;
  if(language==='rust')return `\n    { let __started = std::time::Instant::now(); let __actual = ${call}; let __ms = __started.elapsed().as_millis(); let __pass = __actual == ${expected}; if __ms > ${limit} { println!("CASE ${index} TIMEOUT | {} ms", __ms); } else if __pass { println!("CASE ${index} PASS"); } else { println!("CASE ${index} FAIL"); } }`;
  return '';
}
export function runnable(problem,contract,language,code,onlyExample=false) {
  const cases=typedCases(problem).slice(0,onlyExample?1:undefined);
  const result=resultType(problem);
  const timed=onlyExample?'':performanceRun(problem,contract,language,result);
  if(language==='javascript') {
    const tests=JSON.stringify(cases);
    return `${code}\n\n// Test harness\nconst __cases = ${tests};\nfor (let i=0; i<__cases.length; i++) {\n  try {\n    const actual = ${contract.name}(...structuredClone(__cases[i].args));\n    const pass = JSON.stringify(actual) === JSON.stringify(__cases[i].expected);\n    console.log('CASE ' + (i+1) + ' ' + (pass ? 'PASS' : 'FAIL') + (pass ? '' : ' | actual ' + JSON.stringify(actual)));\n  } catch (error) { console.log('CASE ' + (i+1) + ' ERROR | ' + error.message); }\n}${timed}`;
  }
  if(language==='python') {
    const tests=JSON.stringify(cases);
    return `${code}\n\n# Test harness\nimport json as __json\n__cases = __json.loads(${JSON.stringify(tests)})\nfor __i, __case in enumerate(__cases, 1):\n    try:\n        __actual = ${contract.name}(*__case['args'])\n        __pass = __actual == __case['expected']\n        print(f"CASE {__i} {'PASS' if __pass else 'FAIL'}" + ('' if __pass else ' | actual ' + __json.dumps(__actual)))\n    except Exception as __error:\n        print(f'CASE {__i} ERROR | {__error}')${timed}`;
  }
  if(language==='cpp') {
    const tests=cases.map((c,i)=>{
      const args=c.args.map((arg,j)=>cppLiteral(arg,contract.params[j][1])).join(', ');
      const expected=cppLiteral(c.expected,result);
      return `    try { auto actual = ${contract.name}(${args}); bool pass = (actual == ${expected}); cout << "CASE ${i+1} " << (pass ? "PASS" : "FAIL"); if (!pass) cout << " | actual " << showValue(actual); cout << '\\n'; } catch (...) { cout << "CASE ${i+1} ERROR\\n"; }`;
    }).join('\n');
    return `${code}\n#include <vector>\n#include <string>\n#include <iostream>\n#include <chrono>\n#include <sstream>\n#include <iomanip>\nusing namespace std;\n${cppDisplay}\nvector<int> makeSequence(int length, int start, int step) { vector<int> values(length); for (int i=0; i<length; i++) values[i]=start+i*step; return values; }\nint main() {\n${tests}${timed}\n    return 0;\n}`;
  }
  if(language==='c') {
    const tests=cases.map((c,i)=>{
      const args=c.args.map((arg,j)=>cLiteral(arg,contract.params[j][1])).join(', ');
      const expected=cLiteral(c.expected,result);
      return `    { ${types.c[result]} __actual = ${contract.name}(${args}); ${types.c[result]} __expected = ${expected}; bool __pass = ${cEquals[result]}; printf("CASE ${i+1} %s", __pass ? "PASS" : "FAIL"); if (!__pass) { printf(" | actual "); ${cPrint[result]} } printf("\\n"); }`;
    }).join('\n');
    return `#include <stdlib.h>\n#include <time.h>\n${code}\n${cComparators}\nint main(void) {\n${tests}${timed}\n    return 0;\n}`;
  }
  if(language==='java') {
    const tests=cases.map((c,i)=>{
      const args=c.args.map((arg,j)=>javaLiteral(arg,contract.params[j][1])).join(', ');
      const expected=javaLiteral(c.expected,result);
      return `        try { ${types.java[result]} actual = ${contract.name}(${args}); boolean pass = Objects.deepEquals(actual, ${expected}); System.out.println("CASE ${i+1} " + (pass ? "PASS" : "FAIL | actual " + showActual(actual))); } catch (Exception error) { System.out.println("CASE ${i+1} ERROR | " + error.getMessage()); }`;
    }).join('\n');
    const withTests=code.replace(/\/\/ Tests run here when you press Check\./,tests+timed);
    return withTests.replace(/\n}\s*$/,`\n    static String showActual(Object value) { if (value instanceof String) return "\\\"" + value + "\\\""; if (value != null && value.getClass().isArray()) { String text = Arrays.deepToString(new Object[]{value}); return text.substring(1, text.length()-1); } return String.valueOf(value); }\n    static int[] makeRepeat(int length, int value) { int[] values = new int[length]; Arrays.fill(values, value); return values; }\n    static int[] makeSequence(int length, int start, int step) { int[] values = new int[length]; for (int i=0; i<length; i++) values[i]=start+i*step; return values; }\n}`);
  }
  if(language==='rust') {
    const tests=cases.map((c,i)=>{
      const args=c.args.map((arg,j)=>rustLiteral(arg,contract.params[j][1])).join(', ');
      const expected=rustLiteral(c.expected,result);
      return `    { let actual = ${runtimeName(contract,language)}(${args}); if actual == ${expected} { println!("CASE ${i+1} PASS"); } else { println!("CASE ${i+1} FAIL | actual {:?}", actual); } }`;
    }).join('\n');
    return `#![allow(non_snake_case, unused_variables)]\n${code}\nfn main() {\n${tests}${timed}\n}`;
  }
  throw Error(`No test harness for ${language}`);
}
export { fileFor, resultType };
