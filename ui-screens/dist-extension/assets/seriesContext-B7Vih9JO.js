import{t as e}from"./db-ClG4CIt3.js";async function t(t){if(!t)return null;let n=await e.projects.filter(e=>e.series===t).toArray();if(n.length<=1)return null;n.sort((e,t)=>(e.seriesOrder||999)-(t.seriesOrder||999));let r=[];for(let t of n){let n=await e.projectFiles.where(`projectId`).equals(t.id).toArray(),i={};n.forEach(e=>{i[e.path]=e.content}),r.push({project:t,files:i})}return r}function n(e,t){return!e||e.length<=t?e||``:e.slice(0,t)+`... [truncated]`}function r(e,t){if(!e||e.length<=1)return``;let r=e.findIndex(e=>e.project.id===t),i=`## SERIES CONTEXT: "${e[0].project.series}"\n`;i+=`This story is part of a ${e.length}-book series. `,i+=`The current project is entry #${r+1} in the chronological timeline.\n\n`,i+=`### Series Timeline (Chronological Order):
`;for(let a=0;a<e.length;a++){let{project:o,files:s}=e[a],c=o.id===t,l=Math.abs(a-r)===1;if(i+=`\n#### ${a+1}. "${o.title}" [${o.seriesRole||`mainline`}]${c?` ← CURRENT PROJECT`:``}\n`,i+=`Genre: ${o.genre||`unset`} | Medium: ${o.medium||`unset`} | Words: ${o.wordCount||0}\n`,c){i+=`(Full context provided separately in the main prompt.)
`;continue}let u=Object.entries(s).filter(([e])=>e.startsWith(`characters/`)&&e!==`characters/questions-answered.md`).map(([e,t])=>t).join(`
---
`);u&&(i+=`**Characters:**\n${n(u,l?1e3:400)}\n`);let d=s[`outline.md`];d&&(i+=`**Outline:**\n${n(d,l?800:300)}\n`);let f=s[`world/world-building.md`];f&&(i+=`**World:**\n${n(f,l?600:200)}\n`);let p=s[`story/arc.md`];p&&(i+=`**Story Arc:**\n${n(p,l?600:300)}\n`)}return i+=`
### SERIES CONTINUITY NOTES:
`,i+=`- Characters may appear across books at different ages/stages of development
`,i+=`- World-building elements established in earlier entries should be respected
`,i+=`- The current project's position in the timeline determines which events have "already happened" vs "haven't occurred yet"
`,i+=`- Prequels should not reference events from later timeline entries
`,i+=`- Spinoffs may share world and some characters but have their own central cast
`,i}export{t as n,r as t};