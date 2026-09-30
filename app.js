import { problems, weekdays, difficulty, problemForDate } from './problems.js';
import { contracts, typedCases } from './contracts.js';
import { guidedLanguages, template, runnable, fileFor, resultType, runtimeName } from './runtimes.js';
import { ratings, leetcodeUrl, performanceCase } from './challenge-data.js';

const $=id=>document.getElementById(id);
const frame=$('editor');
const origin='https://onecompiler.com';
const today=new Date(); today.setHours(0,0,0,0);
let selected=today;
let current=problemForDate(selected);
let language=null;
let code='';
let waitingForCode=null;
let pending=null;
let restoreCode=null;
let timer=null;
let activeFileName='main.js';
let theme=document.documentElement.dataset.theme==='dark'?'dark':'light';
const typeLabels={n:'integer',f:'number',s:'string',b:'boolean',N:'integer[]',S:'string[]',M:'integer[][]',G:'string[][]'};
function dateKey(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
function shift(d,n){return new Date(d.getFullYear(),d.getMonth(),d.getDate()+n);}
function same(a,b){return dateKey(a)===dateKey(b);}
function format(d,opts={month:'short',day:'numeric'}){return new Intl.DateTimeFormat('en',opts).format(d);}
function read(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}}
function write(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch{}}
function draftKey(){return `dailycode:v3:${dateKey(selected)}:${language}`;}
function draftFor(){return read(draftKey(),null);}
function draftOrTemplate(){const saved=draftFor();if(language==='c'&&typeof saved==='string'&&/^#include <stdio\.h>\s+int main\s*\(/.test(saved))return template(current.problem,contracts[current.problem.title],language);return saved??template(current.problem,contracts[current.problem.title],language);}
function saveDraft(){if(language){write(draftKey(),code);$('save-label').textContent='Saved in this browser';}}
function progress(){return read('dailycode:v3:solved',{});}
function streak(){const solved=progress();let d=solved[dateKey(today)]?today:shift(today,-1);let count=0;while(solved[dateKey(d)]){count++;d=shift(d,-1);}return count;}
function postCode(value){frame.contentWindow?.postMessage({eventType:'populateCode',language,files:[{name:activeFileName||fileFor(language),content:value}],stdin:''},origin);}
function clearFeedback(message='Complete the function, then check the tests.'){$('feedback').replaceChildren();const p=document.createElement('p');p.textContent=message;$('feedback').append(p);}
function notice(message,kind=''){$('feedback').replaceChildren();const p=document.createElement('p');p.textContent=message;p.className=kind;$('feedback').append(p);}
function updateLanguageUI(){$('language-select').value=language;$('runtime-note').textContent='Run one example or check every test.';$('run-button').textContent='Run example';$('check-button').disabled=false;if(current)renderSignature();}
function renderSignature(){const p=current.problem,c=contracts[p.title];$('signature').textContent=`${runtimeName(c,language)}(${c.params.map(([name,type])=>`${name}: ${typeLabels[type]}`).join(', ')}) → ${typeLabels[resultType(p)]}`;}
function renderDaySummary(){
  const day=problemForDate(today).day;
  $('today-difficulty').textContent=`${weekdays[day]} · ${difficulty[day]}`;
  $('selected-date').textContent=same(selected,today)?'':`Viewing ${format(selected,{month:'long',day:'numeric',year:'numeric'})}`;
  $('today-button').hidden=same(selected,today);
  $('streak').textContent=`${streak()} day streak`;
}
function displayPrompt(problem){
  const overrides={
    'Intersection with Multiplicity':'Return the values found in both arrays, repeating each value as many times as it occurs in both. Sort the result in ascending order. Return an empty array if there is no intersection.',
    'Longest Common Prefix':'Return the longest prefix shared by every word. Return an empty string if there is no shared prefix.',
    'Group Anagrams':'Group words that are anagrams. Return an array of groups. Sort words inside each group, then sort the groups lexicographically.',
    'Median of Two Sorted Arrays':'Return the median of two sorted integer arrays. Their combined length is at least one. Aim for logarithmic time.'
  };
  return overrides[problem.title]||problem.prompt.replace(/\bPrint\b/g,'Return').replace(/\bprint\b/g,'return');
}
function openPast(){
  const solved=progress(),list=$('past-list');list.replaceChildren();
  for(let n=1;n<=42;n++){
    const date=shift(today,-n),entry=problemForDate(date),button=document.createElement('button');
    button.type='button';button.className='past-item';
    const dateLabel=document.createElement('span');dateLabel.className='past-date';dateLabel.textContent=format(date,{weekday:'short',month:'short',day:'numeric'});
    const title=document.createElement('strong');title.textContent=entry.problem.title;
    const level=document.createElement('span');level.className='past-level';level.textContent=solved[dateKey(date)]?'✓ Solved':difficulty[entry.day];
    button.append(dateLabel,title,level);
    button.addEventListener('click',()=>{$('past-dialog').close();showDate(date);window.scrollTo({top:0,behavior:'smooth'});});
    list.append(button);
  }
  $('past-dialog').showModal();
}
function renderProblem(){
  const p=current.problem,contract=contracts[p.title],cases=typedCases(p),index=problems.indexOf(p)+1,heat=ratings[p.title],perf=performanceCase(p);
  $('problem-count').textContent=`${String(index).padStart(2,'0')} / ${problems.length}`;
  $('level').textContent=`${weekdays[current.day]} · ${difficulty[current.day]}`;
  $('title').textContent=p.title;
  const rating=$('rating');rating.replaceChildren();rating.setAttribute('aria-label',`Difficulty ${heat} out of 5`);
  for(let i=0;i<5;i++){const pepper=document.createElement('span');pepper.className=`pepper${i>=heat?' empty':''}`;pepper.setAttribute('aria-hidden','true');pepper.textContent='🌶️';rating.append(pepper);}
  const count=document.createElement('span');count.className='rating-count';count.textContent=`${heat}/5 difficulty`;rating.append(count);
  $('topic').textContent=p.topic;$('description').textContent=displayPrompt(p);
  $('performance-note').hidden=!perf;
  if(perf)$('performance-note').textContent=`Timed test in Check all tests: ${perf.budgetMs/1000} second limit on a large input. A naive approach may time out.`;
  renderSignature();$('example-number').textContent=`1 of ${cases.length}`;
  $('example-args').textContent=contract.params.map(([name],i)=>`${name} = ${JSON.stringify(cases[0].args[i])}`).join('\n');
  $('example-expected').textContent=JSON.stringify(cases[0].expected);$('hint').textContent=p.hint;
  const source=$('source');source.replaceChildren();source.append(document.createTextNode('Original wording and tests'));
  const url=leetcodeUrl(contract.source);
  if(url){const link=document.createElement('a');link.href=url;link.target='_blank';link.rel='noopener noreferrer';link.textContent=`Inspired by LeetCode #${contract.source}`;source.append(document.createTextNode(' · '),link);}
  else source.append(document.createTextNode(' · Original variation'));
  document.querySelector('.hint').open=false;
}
function showDate(d){if(d>today||pending)return;saveDraft();selected=new Date(d.getFullYear(),d.getMonth(),d.getDate());current=problemForDate(selected);renderDaySummary();renderProblem();clearFeedback();if(language&&guidedLanguages.includes(language)){const next=draftOrTemplate();code=next;waitingForCode=next;postCode(next);}else if(language){code=draftFor()??'';waitingForCode=code;postCode(code);}}
function switchLanguage(nextLanguage){if(pending||nextLanguage===language||!guidedLanguages.includes(nextLanguage))return;saveDraft();language=nextLanguage;activeFileName=fileFor(language);code=draftOrTemplate();waitingForCode=code;restoreCode=null;updateLanguageUI();clearFeedback();frame.src=editorSrc();}
function normalizedLanguage(value){const text=String(value).toLowerCase();if(text==='c++'||text==='cpp'||text==='c++17')return 'cpp';if(text.startsWith('javascript')||text==='nodejs')return 'javascript';if(text.startsWith('python'))return 'python';return text;}
function setBusy(value){$('language-select').disabled=value;$('run-button').disabled=value;$('check-button').disabled=value;$('run-button').textContent=value?'Running…':'Run example';$('check-button').textContent=value?'Checking…':'Check all tests';}
function run(exampleOnly){if(pending||!language)return;const guided=guidedLanguages.includes(language),perf=!exampleOnly&&performanceCase(current.problem);if(guided){const source=code;let generated;try{generated=runnable(current.problem,contracts[current.problem.title],language,source,exampleOnly);}catch(error){notice(error.message,'error');return;}pending={mode:'tests',source,generated,expectedCount:exampleOnly?1:current.problem.cases.length+(perf?1:0),exampleOnly,phase:'populating'};notice(perf?'Checking correctness and the timed test…':'Running the test…');setBusy(true);postCode(generated);}else{pending={mode:'plain',phase:'running'};notice('Running code…');setBusy(true);frame.contentWindow?.postMessage({eventType:'triggerRun'},origin);}timer=setTimeout(()=>finishError(perf?'Timed test exceeded the overall 20 second run limit. Try a faster approach.':'The runner did not respond. Your draft is saved; try again.'),perf?20000:45000);}
function finishError(message){if(!pending)return;const original=pending.source;pending=null;clearTimeout(timer);setBusy(false);notice(message,'error');if(original){restoreCode=original;postCode(original);}}
function finishRun(result){
  if(!pending)return;
  clearTimeout(timer);
  const job=pending;pending=null;setBusy(false);
  const output=String(result?.stdout||'');
  const error=[result?.stderr,result?.exception].filter(Boolean).join('\n').trim();
  const timedOut=/time.?limit|timed?\s*out|timeout/i.test(error);
  if(job.mode==='plain'){notice(error||output.trim()||'Run finished with no output.',error?'error':'');return;}
  const matches=[...output.matchAll(/^CASE (\d+) (PASS|FAIL|ERROR|TIMEOUT)(.*)$/gm)];
  const passed=matches.filter(m=>m[2]==='PASS').length;
  const success=matches.length===job.expectedCount&&passed===job.expectedCount;
  if(success){
    notice(job.exampleOnly?'Example passed. Check all tests when ready.':'All tests passed. Come back tomorrow for the next problem.','success');
    if(!job.exampleOnly){const solved=progress();solved[dateKey(selected)]={title:current.problem.title,language};write('dailycode:v3:solved',solved);renderDaySummary();}
  }else{
    notice(timedOut||matches.some(m=>m[2]==='TIMEOUT')?'Time limit exceeded. Try a faster approach.':matches.length?`${passed} of ${job.expectedCount} tests passed. Review the cases below.`:error||'The run produced no test results.','error');
  }
  if(matches.length){
    const list=document.createElement('div');list.className='test-badges';
    for(const m of matches){
      const badge=document.createElement('span');badge.textContent=`Test ${m[1]}: ${m[2].toLowerCase()}`;
      if(m[2]==='PASS')badge.className='pass';list.append(badge);
    }
    $('feedback').append(list);
    for(const m of matches.filter(m=>m[2]!=='PASS')){
      const test=typedCases(current.problem)[Number(m[1])-1];
      const detail=document.createElement('pre');detail.className='failure-detail';
      const actual=m[3].trim().replace(/^\|\s*/,'');
      detail.textContent=test?`Test ${m[1]} · arguments: ${JSON.stringify(test.args)}\nExpected: ${JSON.stringify(test.expected)}${actual?'\n'+actual:''}`:`Timed test · 50,000 items · ${performanceCase(current.problem)?.budgetMs/1000} second limit${actual?'\nElapsed: '+actual:''}`;
      $('feedback').append(detail);
    }
  }
  restoreCode=job.source;postCode(job.source);
}
window.addEventListener('message',event=>{if(event.origin!==origin||event.source!==frame.contentWindow)return;const data=event.data;if(!data||typeof data!=='object')return;if(data.action==='runComplete'){finishRun(data.result);return;}if(data.action!=='change'||!data.language)return;const nextLanguage=normalizedLanguage(data.language);if(nextLanguage!==language)return;const incoming=data.files?.[0]?.content;const fileName=data.files?.[0]?.name;if(typeof incoming!=='string')return;if(pending?.mode==='tests'){if(pending.phase==='populating'&&incoming===pending.generated){pending.phase='running';frame.contentWindow?.postMessage({eventType:'triggerRun'},origin);}return;}if(restoreCode!==null){if(incoming===restoreCode){code=incoming;restoreCode=null;saveDraft();}return;}if(waitingForCode!==null){if(incoming===waitingForCode){code=incoming;waitingForCode=null;saveDraft();}return;}activeFileName=fileName||activeFileName;code=incoming;saveDraft();});
function showDialog(kind){const content=$('dialog-body');if(kind==='sources'){content.innerHTML='<h2>About the problems</h2><p>These 42 prompts and their visible tests were written for this project. Most adapt well-known LeetCode interview patterns; the linked problem under each challenge identifies its inspiration. They are not copied from LeetCode or pulled from its daily challenge feed.</p><p>The rotation lasts six weeks and then repeats. This is a small curated bank, not the full LeetCode library.</p><p>Code runs in the <a href="https://onecompiler.com/apis/embed-editor" target="_blank" rel="noopener noreferrer">OneCompiler embedded editor</a>, which its provider currently describes as free to embed with unlimited runs. The site has no backend or account. Guided tests cover Python, C++, C, Java, JavaScript, and Rust.</p>';}else{content.innerHTML='<h2>How it works</h2><p>There is one problem per day. Difficulty rises from Monday through Sunday, and the six-week set repeats. Complete the named function in the editor, then use Run example or Check all tests. Some challenges include a large timed test with a 1.2 second function limit and a 20 second overall run limit; the page tells you when one applies.</p><p>The editor runs through OneCompiler’s free embed. Your drafts and solved days are saved only in this browser. Choose Python, C++, C, Java, JavaScript, or Rust above the editor; each has guided tests.</p>';} $('about-dialog').showModal();}
function editorSrc(){const chosen=language||'javascript';const mobile=window.matchMedia('(max-width: 760px)').matches;return `${origin}/embed/${encodeURIComponent(chosen)}?listenToEvents=true&codeChangeEvent=true&hideLanguageSelection=true&hideNew=true&hideTitle=true&hideRun=true&hideEditorOptions=true&theme=${theme}${mobile?'&hideResult=true':''}`;}
function updateThemeButton(){$('theme-button').textContent=theme==='dark'?'☼  Light':'◐  Dark';$('theme-button').setAttribute('aria-label',theme==='dark'?'Switch to light mode':'Switch to dark mode');}
function toggleTheme(){if(pending)return;saveDraft();theme=theme==='dark'?'light':'dark';document.documentElement.dataset.theme=theme;try{localStorage.setItem('dailycode:theme',theme);}catch{}updateThemeButton();waitingForCode=code;frame.src=editorSrc();}
$('today-date').textContent=format(today,{month:'long',day:'numeric',year:'numeric'});
$('theme-button').addEventListener('click',toggleTheme);
$('language-select').addEventListener('change',event=>switchLanguage(event.target.value));
$('today-button').addEventListener('click',()=>showDate(today));
$('past-button').addEventListener('click',openPast);
$('close-past').addEventListener('click',()=>$('past-dialog').close());
$('past-dialog').addEventListener('click',e=>{if(e.target===$('past-dialog'))$('past-dialog').close();});
$('run-button').addEventListener('click',()=>run(true));
$('check-button').addEventListener('click',()=>run(false));
$('about-button').addEventListener('click',()=>showDialog('about'));
$('source-button').addEventListener('click',()=>showDialog('sources'));
$('close-dialog').addEventListener('click',()=>$('about-dialog').close());
$('about-dialog').addEventListener('click',e=>{if(e.target===$('about-dialog'))$('about-dialog').close();});
renderDaySummary();renderProblem();
language='javascript';
code=draftOrTemplate();
waitingForCode=code;
updateLanguageUI();
updateThemeButton();
if(theme==='dark'||window.matchMedia('(max-width: 760px)').matches)frame.src=editorSrc();
function handshake(){
  const requested=code;
  let tries=0;
  const handshake=setInterval(()=>{
    if(waitingForCode!==requested||tries++>=12){clearInterval(handshake);return;}
    postCode(requested);
  },800);
}
frame.addEventListener('load',handshake);
handshake();
setInterval(()=>{if(!same(today,new Date()))location.reload();},60000);
