import { test } from 'node:test'
import assert from 'node:assert/strict'
import { randomUUID } from 'crypto'
import request from 'supertest'

process.env.REVIEW_BUILD_SHA = 'aaaaaaaa'
const png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX1sAAAAASUVORK5CYII='
async function setup() {
  const f = (await import('./review-fixture')).reviewFixture()
  const runId = randomUUID()
  const owner = 'Bearer ' + f.token()
  const send = (path: string, body: unknown, token = owner) => request(f.app).post('/api/review' + path).set('Authorization', token).set('X-StudyHub-Build', 'aaaaaaaa').send(body)
  assert.equal((await send('/runs', { id: runId, scenarioId:'admissions-review-v1', frontendSha:'aaaaaaaa' })).status,201)
  const sessionId = randomUUID()
  const session = await send('/sessions', { id:sessionId, runId, persona:'admissions-candidate' })
  assert.equal(session.status,200)
  return { ...f, owner, send, runId, sessionId, candidate:'Bearer ' + session.body.token, userId:session.body.user.id }
}

test('admissions application handlers persist per-run data, resume, isolate candidates and restrict writes', async () => {
  const f = await setup()
  const path = '/api/module-progress/learning-v1-application-' + randomUUID()
  const data = { answers:{ name:'Synthetic university', program:'Test', source:'https://example.org', notes:'persist me' } }
  assert.equal((await request(f.app).put(path).set('Authorization',f.candidate).send(data)).status,200)
  const read = async (token: string) => request(f.app).get('/api/module-progress').set('Authorization',token)
  assert.equal((await read(f.candidate)).body.progresses[0].answers.notes,'persist me')
  const resume = await f.send('/sessions',{ id:randomUUID(),runId:f.runId,persona:'admissions-candidate' })
  assert.equal(resume.body.user.id,f.userId)
  assert.equal((await read('Bearer ' + resume.body.token)).body.progresses.length,1)
  const outsider = await f.send('/sessions',{ id:randomUUID(),runId:f.runId,persona:'admissions-outsider' })
  assert.equal((await read('Bearer ' + outsider.body.token)).body.progresses.length,0)
  const next = randomUUID()
  await f.send('/runs',{ id:next,scenarioId:'admissions-review-v1',frontendSha:'aaaaaaaa' })
  const fresh = await f.send('/sessions',{ id:randomUUID(),runId:next,persona:'admissions-candidate' })
  assert.notEqual(fresh.body.user.id,f.userId)
  assert.equal((await read('Bearer ' + fresh.body.token)).body.progresses.length,0)
  for (const target of ['/api/module-progress/owner-review-v1-access','/api/module-progress/learning-v1-profile','/api/billing/pay']) {
    assert.equal((await request(f.app).put(target).set('Authorization',f.candidate).send(data)).status === 200,false)
  }
  assert.equal((await request(f.app).post('/api/billing/pay').set('Authorization',f.candidate).send({})).status,403)
  assert.equal((await request(f.app).get('/api/review').set('Authorization',f.candidate)).status,403)
})

test('private evidence survives retry/export/reader handoff, and rejects wrong context and changed IDs', async () => {
  const f = await setup()
  const context = { runId:f.runId,stepId:'applications',path:'/admission',sessionId:f.sessionId,section:'Мои заявки',capturedAt:new Date().toISOString(),viewport:{width:390,height:844} }
  const image = { ...context,id:randomUUID(),dataUrl:png }
  assert.equal((await f.send('/attachments',image)).status,201)
  assert.equal((await f.send('/attachments',image)).status,200)
  assert.equal((await f.send('/attachments',{...image,section:'other'})).status,409)
  const feedback = {...context,id:randomUUID(),text:'Synthetic screenshot feedback',screenshotId:image.id,outcome:'failed'}
  assert.equal((await f.send('/feedback',feedback)).status,201)
  assert.equal((await f.send('/feedback',feedback)).status,200)
  assert.equal((await f.send('/feedback',{...feedback,text:'different'})).status,409)
  assert.equal((await f.send('/feedback',{...feedback,id:randomUUID(),path:'/portfolio'})).status,400)
  assert.equal((await f.send('/feedback',{...feedback,id:randomUUID(),stepId:'portfolio',path:'/portfolio'})).status,400)
  assert.equal((await f.repo.list('owner-a','feedback-')).length,1)
  const exported = await request(f.app).get('/api/review/export').set('Authorization',f.owner)
  assert.equal(exported.body.feedback[0].data.persona,'admissions-candidate')
  assert.equal(exported.body.attachments[0].data.dataUrl,png)
  assert.equal(exported.body.feedback[0].data.frontendSha,'aaaaaaaa')
  assert.equal((await request(f.app).get('/api/review/attachments/'+image.id).set('Authorization','Bearer '+f.token('owner-b'))).status,404)
  const key = (await f.send('/reader-key',{})).body.key
  const feed = await request(f.app).get('/api/review-feed').set('Authorization','Bearer '+key)
  assert.equal(feed.body.feedback[0].data.screenshotId,image.id)
  assert(!JSON.stringify(feed.body).includes('base64'))
  const downloaded = await request(f.app).get('/api/review-feed/attachments/'+image.id).set('Authorization','Bearer '+key)
  assert.equal(downloaded.body.record.data.dataUrl,png)
  assert.equal((await request(f.app).get('/api/review-feed/attachments/'+image.id)).status,401)
  await request(f.app).delete('/api/review/reader-key').set('Authorization',f.owner)
  assert.equal((await request(f.app).get('/api/review-feed/attachments/'+image.id).set('Authorization','Bearer '+key)).status,401)
})

test('evidence validates raster limits, actual role, active release and page results', async () => {
  const f = await setup()
  const body = {id:randomUUID(),runId:f.runId,stepId:'applications',path:'/admission',sessionId:f.sessionId,text:'issue'}
  assert.equal((await f.send('/feedback',{...body,sessionId:undefined})).status,400)
  const outsiderId = randomUUID()
  await f.send('/sessions',{id:outsiderId,runId:f.runId,persona:'admissions-outsider'})
  assert.equal((await f.send('/feedback',{...body,sessionId:outsiderId})).status,400)
  assert.equal((await f.send('/attachments',{...body,text:undefined,dataUrl:'data:image/svg+xml;base64,PHN2Zy8+'})).status,400)
  assert.equal((await f.send('/attachments',{...body,text:undefined,dataUrl:'data:image/png;base64,'+'A'.repeat(1100000)})).status,400)
  process.env.REVIEW_BUILD_SHA='bbbbbbbb'
  try { assert.equal((await f.send('/feedback',body)).status,409) }
  finally { process.env.REVIEW_BUILD_SHA='aaaaaaaa' }
  const result = (path: string) => request(f.app).put('/api/review/runs/'+f.runId+'/steps/applications').set('Authorization',f.owner).set('X-StudyHub-Build','aaaaaaaa').send({revision:1,outcome:'passed',comment:'',path,sessionId:f.sessionId})
  assert.equal((await result('/portfolio')).status,400)
  assert.equal((await result('/admission')).status,200)
})

test('production candidate provisioning does not reset resumed data and creates different users per run', async () => {
  const { prisma } = await import('../lib/prisma')
  const { provisionPersona } = await import('../lib/reviewStore')
  const original = prisma.user.upsert
  const rows = new Map<string, Record<string,unknown>>()
  prisma.user.upsert = (async ({where,create,update}: {where:{id:string};create:Record<string,unknown>;update:unknown}) => {
    assert.deepEqual(update,{})
    if (!rows.has(where.id)) rows.set(where.id,create)
    return rows.get(where.id)
  }) as never
  try {
    const first = await provisionPersona('owner-a','admissions-candidate','run-a')
    const resumed = await provisionPersona('owner-a','admissions-candidate','run-a')
    const fresh = await provisionPersona('owner-a','admissions-candidate','run-b')
    const other = await provisionPersona('owner-b','admissions-candidate','run-a')
    assert.equal(first.id,resumed.id)
    assert.notEqual(first.id,fresh.id)
    assert.notEqual(first.id,other.id)
    assert.equal('passwordHash' in first,false)
    await assert.rejects(()=>provisionPersona('owner-a','admissions-candidate'))
  } finally { prisma.user.upsert=original }
})
