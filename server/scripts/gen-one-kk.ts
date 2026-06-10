const BASE='http://localhost:3001'
async function api(p:string,o:any={}){const h:any={'Content-Type':'application/json',...(o.headers||{})};if(o.token)h.Authorization=`Bearer ${o.token}`;const r=await fetch(`${BASE}${p}`,{...o,headers:h});const b=await r.json().catch(()=>({}));if(!r.ok)throw new Error(p+': '+(b.error||r.status));return b}
;(async()=>{
  const topic='Обыкновенные дроби — сложение, вычитание, умножение, деление, сокращение, общий знаменатель'
  const l=await api('/api/auth/login',{method:'POST',body:JSON.stringify({email:'alibekovakarakat5@gmail.com',password:'Karakat2026'})})

  // Clean up earlier broken drafts for this exact topic so we don't duplicate.
  const { drafts=[] } = await api('/api/ai/drafts',{token:l.token})
  const stale = drafts.filter((d:any)=>d.topic===topic)
  for (const d of stale){ await api(`/api/ai/drafts/${d.id}`,{method:'DELETE',token:l.token}); console.log('🗑  removed stale draft',d.id) }

  console.log('Генерирую KK урок «Дроби» (forceFresh, лечим кеш)...')
  const g=await api('/api/ai/generate-lesson',{method:'POST',token:l.token,body:JSON.stringify({topic,subject:'math',difficulty:'medium',quizCount:6,lang:'kk',forceFresh:true})})
  await api('/api/ai/drafts',{method:'POST',token:l.token,body:JSON.stringify({title:'🇰🇿 '+g.lesson.title,topic,subject:'math',difficulty:'medium',lesson:g.lesson})})
  console.log(`✓ ${g.lesson.title} (${g.provider}, ${g.lesson.theory.length}ch, ${g.lesson.quiz.length}q)`)
})().catch(e=>{console.error(e.message);process.exit(1)})
