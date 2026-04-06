import{n as e,t}from"./promptRegistry-CfASyIgr.js";import{n,t as r}from"./seriesContext-DZWls7Tz.js";function i(e){if(!e)return 0;let t=e.split(/\s+/).filter(Boolean).length,n=(e.match(/[.,!?;:'"()\[\]{}\-—]/g)||[]).length;return Math.ceil(t*1.3+n*.5)}function a(n,r,a={}){let{maxTokens:o=128e3,model:s=`claude-sonnet-4-5-20250514`,seriesContext:c=``}=a,l=[],u=[];u.push({role:`system`,priority:0,content:t,label:`Golden Rules`}),c&&u.push({role:`system`,priority:0,content:c,label:`Series Context`});for(let e of[{path:`author.md`,label:`Author Profile`},{path:`narrator.md`,label:`Narrator`},{path:`outline.md`,label:`Story Outline`},{path:`story/arc.md`,label:`Story Arc`},{path:`world/world-building.md`,label:`World Building`},{path:`relationships/questions-answered.md`,label:`Relationships`}])n[e.path]?.trim()&&u.push({role:`context`,priority:1,content:`## ${e.label}\n\n${n[e.path]}`,label:e.label});let d=Object.entries(n).filter(([e])=>e.startsWith(`characters/`)&&e.endsWith(`.md`)&&e!==`characters/questions-answered.md`);for(let[e,t]of d)if(t?.trim()){let n=e.replace(`characters/`,``).replace(`.md`,``);u.push({role:`context`,priority:1,content:`## Character: ${n}\n\n${t}`,label:`Character: ${n}`})}for(let e=1;e<r;e++){let t=n[`story/chapter-${e}.md`],i=n[`story/chapter-${e}-summary.md`];if(e>=r-2)t?.trim()&&u.push({role:`context`,priority:2,content:`## Chapter ${e} (Full Text)\n\n${t}`,label:`Chapter ${e}`});else{let t=i?.trim()||`[Chapter ${e} — summary not yet generated]`;u.push({role:`context`,priority:3,content:`## Chapter ${e} Summary\n\n${t}`,label:`Chapter ${e} Summary`})}}let f=`story/chapter-${r}-notes.md`;n[f]?.trim()&&u.push({role:`context`,priority:1,content:`## Notes for Chapter ${r}\n\n${n[f]}`,label:`Chapter ${r} Notes`});let p=Object.entries(n).filter(([e])=>e.startsWith(`feedback/`));for(let[e,t]of p)t?.trim()&&u.push({role:`context`,priority:4,content:`## Feedback: ${e}\n\n${t}`,label:e});let m=u.reduce((e,t)=>e+i(t.content),0),h=Math.min(o*.3,3e4);if(m>o-h){let e=u.filter(e=>e.priority>=3).sort((e,t)=>t.priority-e.priority);for(let t of e){if(m<=o-h)break;let e=i(t.content);m-=e,l.push(t.label),t.content=`[${t.label} — trimmed for context limits]`}}let g=u.filter(e=>e.role===`system`).map(e=>e.content).join(`

`),_=u.filter(e=>e.role===`context`).map(e=>e.content).join(`

---

`),v=e.CHAPTER_GENERATION.build({chapterNum:r});return{messages:[{role:`system`,content:g},{role:`user`,content:`${_}\n\n---\n\n${v}`}],tokenCount:m,maxTokens:o,trimmed:l,partsIncluded:u.length-l.length}}function o(n,r,a={}){let{persona:o=`assistant`,characterName:s=null,scope:c=`full-project`,seriesContext:l=``}=a,u=``;switch(o){case`assistant`:u=e.STORY_ASSISTANT.build({projectTitle:null})+`

`;break;case`editor`:u=e.EDITOR.build({projectTitle:null})+`

`;break;case`character`:u=e.CHARACTER_ROLEPLAY.build({characterName:s,characterFile:null,relationshipsFile:null})+`

`;break;default:u=t+`

`}if(l&&(u+=l+`

`),c===`full-project`&&(n[`author.md`]?.trim()&&(u+=`## Author\n${n[`author.md`]}\n\n`),n[`narrator.md`]?.trim()&&(u+=`## Narrator\n${n[`narrator.md`]}\n\n`),n[`outline.md`]?.trim()&&(u+=`## Outline\n${n[`outline.md`]}\n\n`)),o===`character`&&s){let t=Object.entries(n).filter(([e])=>e.startsWith(`characters/`)&&e.endsWith(`.md`)),r=null;for(let[e,n]of t)if(e.toLowerCase().includes(s.toLowerCase())){r=n;break}let i=n[`relationships/questions-answered.md`]?.trim()||null;u=e.CHARACTER_ROLEPLAY.build({characterName:s,characterFile:r,relationshipsFile:i})+`

`}return{messages:[{role:`system`,content:u},...r],tokenCount:i(u)}}function s(t,n){return{messages:[{role:`system`,content:e.PRE_FLIGHT.build({chapterNum:n})},{role:`user`,content:`Project files context:\n\n${Object.entries(t).filter(([e,t])=>t?.trim()).map(([e,t])=>`## ${e}\n${t.slice(0,500)}${t.length>500?`...`:``}`).join(`

`)}`}]}}async function c(e){return e?.series?r(await n(e.series),e.id):``}export{c as a,i,o as n,s as r,a as t};