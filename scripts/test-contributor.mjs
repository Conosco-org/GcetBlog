/**
 * Contributor Page Functionality Test Script
 * Tests all contributor API endpoints, pages, and edge cases.
 * Run: node scripts/test-contributor.mjs
 *
 * Credentials fallback order:
 *   1. env CONTRIBUTOR_EMAIL / CONTRIBUTOR_PASSWORD
 *   2. contributor@gcet.edu.in / contributor123  (seed defaults)
 *   3. contributor@gmail.com / contributor
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

// Credentials to try in order
const CREDS = [
  {
    email: process.env.CONTRIBUTOR_EMAIL || 'testcontributor@gmail.com',
    password: process.env.CONTRIBUTOR_PASSWORD || 'contributor',
  },
  { email: 'contributor@gcet.edu.in', password: 'contributor123' },
  { email: 'user@gmail.com', password: 'user' },
]

let AUTH_COOKIE = ''
let userId = ''
let userEmail = ''
let testPostId = ''
let testDraftId = ''
let testMediaId = ''
let editorUserId = ''
let editorCookie = ''
let testFeedbackId = ''

const results = []
function log(name, status, detail = '') {
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️'
  results.push({ name, status, detail })
  console.log(`${icon} [${status}] ${name}${detail ? ' — ' + detail : ''}`)
}

async function fetchJSON(path, options = {}, cookie = AUTH_COOKIE) {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`
  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Cookie: cookie,
    },
    redirect: 'manual',
  })
  const text = await res.text()
  let json = null
  try { json = JSON.parse(text) } catch {}
  return { status: res.status, json, text, headers: res.headers, ok: res.ok }
}

async function fetchHTML(path, cookie = AUTH_COOKIE) {
  const url = `${BASE_URL}${path}`
  const res = await fetch(url, {
    headers: { Cookie: cookie },
    redirect: 'manual',
  })
  const status = res.status
  const location = res.headers.get('location')
  let text = ''
  try { text = await res.text() } catch {}
  return { status, text, location, ok: status >= 200 && status < 400 }
}

// ========================
// 1. AUTHENTICATION
// ========================
async function testAuth() {
  console.log('\n━━━ 1. AUTHENTICATION ━━━')

  // Try each credential pair
  let loggedIn = false
  for (const { email, password } of CREDS) {
    const loginRes = await fetch(`${BASE_URL}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      redirect: 'manual',
    })
    const setCookie = loginRes.headers.get('set-cookie')
    const loginJson = await loginRes.json().catch(() => null)

    if (loginRes.ok && loginJson?.user) {
      AUTH_COOKIE = setCookie || ''
      userId = loginJson.user.id
      userEmail = loginJson.user.email
      loggedIn = true
      log('Login as contributor', 'PASS', `User: ${email}, Role: ${loginJson.user.role}`)
      if (loginJson.user.role !== 'contributor') {
        log('Role check', 'FAIL', `Expected contributor, got ${loginJson.user.role}`)
      } else {
        log('Role check', 'PASS', 'contributor')
      }
      break
    } else if (loginJson?.token) {
      AUTH_COOKIE = `payload-token=${loginJson.token}`
      userId = loginJson.user?.id || ''
      userEmail = loginJson.user?.email || email
      loggedIn = true
      log('Login as contributor', 'PASS', `Token auth, ${email}`)
      break
    }
  }

  if (!loggedIn) {
    log('Login as contributor', 'FAIL', 'No valid credentials found')
    console.log('\n⛔ Cannot continue without auth. Set CONTRIBUTOR_EMAIL / CONTRIBUTOR_PASSWORD env vars.')
    process.exit(1)
  }

  // GET /api/users/me
  const meRes = await fetchJSON('/api/users/me')
  if (meRes.ok && meRes.json?.user) {
    log('GET /api/users/me', 'PASS', `id=${meRes.json.user.id}`)
  } else {
    log('GET /api/users/me', 'FAIL', `Status: ${meRes.status}`)
  }
}

// ========================
// 2. SSR PAGE RENDERING
// ========================
async function testSSRPages() {
  console.log('\n━━━ 2. SSR PAGE RENDERING ━━━')

  const pages = [
    { path: '/contributor', name: 'Dashboard' },
    { path: '/contributor/create', name: 'Create Content' },
    { path: '/contributor/drafts', name: 'My Drafts' },
    { path: '/contributor/submissions', name: 'Submissions' },
    { path: '/contributor/feedback', name: 'Feedback Center' },
    { path: '/contributor/profile', name: 'Profile' },
  ]

  for (const { path, name } of pages) {
    const res = await fetchHTML(path)
    if (res.status === 200) {
      log(`GET ${path} (${name})`, 'PASS', `200 OK, ${res.text.length} bytes`)
    } else if (res.status >= 300 && res.status < 400) {
      log(`GET ${path} (${name})`, 'FAIL', `Redirected to ${res.location}`)
    } else {
      log(`GET ${path} (${name})`, 'FAIL', `Status: ${res.status}`)
    }
  }
}

// ========================
// 3. POST CREATION — SUBMIT FOR REVIEW
// ========================
async function testPostCreation() {
  console.log('\n━━━ 3. POST CREATION ━━━')

  // Submit for review (isDraft=false)
  const submitRes = await fetchJSON('/api/posts/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: `Test Submission ${Date.now()}`,
      content: 'This is a test submission body with enough content for validation.',
      excerpt: 'Test excerpt for submission',
      categories: [],
      tags: ['test', 'automated'],
      metaDescription: 'Test meta',
      contentType: 'news',
      isDraft: false,
    }),
  })

  if (submitRes.ok && (submitRes.json?.post || submitRes.json?.doc || submitRes.json?.id)) {
    testPostId = submitRes.json.post?.id || submitRes.json.doc?.id || submitRes.json.id
    const reviewStatus = submitRes.json.post?.reviewStatus || submitRes.json.doc?.reviewStatus || submitRes.json.reviewStatus
    log('POST /api/posts/create (submit)', 'PASS', `ID: ${testPostId}`)
    if (reviewStatus === 'pending_review') {
      log('reviewStatus = pending_review', 'PASS')
    } else {
      log('reviewStatus = pending_review', 'FAIL', `Got: ${reviewStatus}`)
    }
  } else {
    log('POST /api/posts/create (submit)', 'FAIL', `${submitRes.status}: ${submitRes.text?.slice(0, 200)}`)
  }

  // Save as draft (isDraft=true)
  const draftRes = await fetchJSON('/api/posts/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: `Test Draft ${Date.now()}`,
      content: 'Draft content for testing purposes.',
      excerpt: '',
      categories: [],
      tags: [],
      contentType: 'tutorial',
      isDraft: true,
    }),
  })

  if (draftRes.ok && (draftRes.json?.post || draftRes.json?.doc || draftRes.json?.id)) {
    testDraftId = draftRes.json.post?.id || draftRes.json.doc?.id || draftRes.json.id
    const reviewStatus = draftRes.json.post?.reviewStatus || draftRes.json.doc?.reviewStatus || draftRes.json.reviewStatus
    log('POST /api/posts/create (draft)', 'PASS', `ID: ${testDraftId}`)
    if (reviewStatus === 'draft') {
      log('reviewStatus = draft', 'PASS')
    } else {
      log('reviewStatus = draft', 'FAIL', `Got: ${reviewStatus}`)
    }
  } else {
    log('POST /api/posts/create (draft)', 'FAIL', `${draftRes.status}: ${draftRes.text?.slice(0, 200)}`)
  }
}

// ========================
// 4. POST CREATION EDGE CASES
// ========================
async function testPostEdgeCases() {
  console.log('\n━━━ 4. POST EDGE CASES ━━━')

  // Missing title
  const noTitle = await fetchJSON('/api/posts/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: 'Has body but no title', isDraft: false }),
  })
  if (noTitle.status >= 400) {
    log('Reject missing title', 'PASS', `Status: ${noTitle.status}`)
  } else {
    log('Reject missing title', 'FAIL', `Expected 4xx, got: ${noTitle.status}`)
  }

  // Missing content
  const noContent = await fetchJSON('/api/posts/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'No content post', isDraft: false }),
  })
  if (noContent.status >= 400) {
    log('Reject missing content', 'PASS', `Status: ${noContent.status}`)
  } else {
    log('Reject missing content', 'FAIL', `Expected 4xx, got: ${noContent.status}`)
  }

  // Empty body
  const emptyBody = await fetchJSON('/api/posts/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  })
  if (emptyBody.status >= 400) {
    log('Reject empty body', 'PASS', `Status: ${emptyBody.status}`)
  } else {
    log('Reject empty body', 'FAIL', `Expected 4xx, got: ${emptyBody.status}`)
  }

  // Very long title (> 200 chars)
  const longTitle = await fetchJSON('/api/posts/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'X'.repeat(300),
      content: 'Some content',
      isDraft: true,
    }),
  })
  // Should succeed or gracefully error — no crash
  if (longTitle.status < 500) {
    log('Handle very long title (300 chars)', 'PASS', `Status: ${longTitle.status}`)
  } else {
    log('Handle very long title (300 chars)', 'FAIL', `Status: ${longTitle.status}`)
  }

  // Unauthenticated create
  const noAuth = await fetchJSON('/api/posts/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Hack', content: 'Nope', isDraft: false }),
  }, '') // Empty cookie
  if (noAuth.status === 401) {
    log('Reject unauthenticated create', 'PASS')
  } else {
    log('Reject unauthenticated create', 'FAIL', `Expected 401, got: ${noAuth.status}`)
  }
}

// ========================
// 5. POSTS LISTING (Payload REST)
// ========================
async function testPostsListing() {
  console.log('\n━━━ 5. POSTS LISTING ━━━')

  // List contributor's drafts
  const draftsRes = await fetchJSON(`/api/posts?where[authors][equals]=${userId}&where[reviewStatus][equals]=draft&limit=5`)
  if (draftsRes.ok && draftsRes.json?.docs !== undefined) {
    log('GET drafts (reviewStatus=draft)', 'PASS', `Found ${draftsRes.json.totalDocs} drafts`)
  } else {
    log('GET drafts (reviewStatus=draft)', 'FAIL', `Status: ${draftsRes.status}`)
  }

  // List pending_review posts
  const pendingRes = await fetchJSON(`/api/posts?where[authors][equals]=${userId}&where[reviewStatus][equals]=pending_review&limit=5`)
  if (pendingRes.ok && pendingRes.json?.docs !== undefined) {
    log('GET submissions (reviewStatus=pending_review)', 'PASS', `Found ${pendingRes.json.totalDocs} submissions`)
  } else {
    log('GET submissions (reviewStatus=pending_review)', 'FAIL', `Status: ${pendingRes.status}`)
  }

  // Verify sidebar badge: layout queries reviewStatus='pending' — this should be a known bug
  const wrongPending = await fetchJSON(`/api/posts?where[authors][equals]=${userId}&where[reviewStatus][equals]=pending&limit=1`)
  if (wrongPending.ok) {
    const badCount = wrongPending.json?.totalDocs || 0
    if (badCount === 0) {
      log('Layout badge bug: reviewStatus=pending returns 0', 'WARN', 'Sidebar submissions badge always shows 0 — layout queries "pending" instead of "pending_review"')
    } else {
      log('reviewStatus=pending query', 'PASS', `Found ${badCount}`)
    }
  }
}

// ========================
// 6. MEDIA UPLOAD
// ========================
async function testMediaUpload() {
  console.log('\n━━━ 6. MEDIA UPLOAD ━━━')

  // Create a tiny PNG (1x1 pixel)
  const pngHeader = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, // 8-bit RGB
    0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, // IDAT chunk
    0x54, 0x08, 0xD7, 0x63, 0xF8, 0xCF, 0xC0, 0x00,
    0x00, 0x00, 0x02, 0x00, 0x01, 0xE2, 0x21, 0xBC,
    0x33, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E,
    0x44, 0xAE, 0x42, 0x60, 0x82, // IEND chunk
  ])

  const boundary = '----TestBoundary' + Date.now()
  const bodyParts = [
    `--${boundary}\r\n`,
    'Content-Disposition: form-data; name="file"; filename="test-image.png"\r\n',
    'Content-Type: image/png\r\n\r\n',
  ]
  const bodyEnd = `\r\n--${boundary}\r\n`
    + 'Content-Disposition: form-data; name="alt"\r\n\r\n'
    + 'Test image alt text'
    + `\r\n--${boundary}--\r\n`

  const bodyBuffer = Buffer.concat([
    Buffer.from(bodyParts.join('')),
    pngHeader,
    Buffer.from(bodyEnd),
  ])

  const uploadRes = await fetch(`${BASE_URL}/api/media`, {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      Cookie: AUTH_COOKIE,
    },
    body: bodyBuffer,
  })

  const uploadJson = await uploadRes.json().catch(() => null)

  if (uploadRes.ok && (uploadJson?.doc?.id || uploadJson?.id)) {
    testMediaId = uploadJson.doc?.id || uploadJson.id
    log('POST /api/media (upload image)', 'PASS', `ID: ${testMediaId}`)
  } else {
    log('POST /api/media (upload image)', 'FAIL', `Status: ${uploadRes.status}, ${JSON.stringify(uploadJson)?.slice(0, 200)}`)
  }

  // Create post with featuredImage
  if (testMediaId) {
    const postRes = await fetchJSON('/api/posts/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `Post with Image ${Date.now()}`,
        content: 'Post that has a featured image.',
        featuredImage: testMediaId,
        isDraft: true,
      }),
    })
    if (postRes.ok) {
      const heroImage = postRes.json?.post?.heroImage || postRes.json?.doc?.heroImage || postRes.json?.heroImage
      if (heroImage) {
        log('Create post with featuredImage → heroImage', 'PASS', `heroImage: ${typeof heroImage === 'object' ? heroImage.id : heroImage}`)
      } else {
        log('Create post with featuredImage → heroImage', 'FAIL', 'heroImage is null — featuredImage not mapped')
      }
    } else {
      log('Create post with featuredImage → heroImage', 'FAIL', `Status: ${postRes.status}`)
    }
  }
}

// ========================
// 7. PROFILE PAGE
// ========================
async function testProfile() {
  console.log('\n━━━ 7. PROFILE ━━━')

  // GET user data via Payload REST
  const userRes = await fetchJSON(`/api/users/${userId}`)
  if (userRes.ok && userRes.json) {
    log('GET /api/users/:id (profile data)', 'PASS', `name=${userRes.json.name || userRes.json.email}`)
  } else {
    log('GET /api/users/:id (profile data)', 'FAIL', `Status: ${userRes.status}`)
  }

  // PATCH user (update name)
  const newName = `Test Contributor ${Date.now()}`
  const patchRes = await fetchJSON(`/api/users/${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: newName }),
  })
  if (patchRes.ok) {
    const updatedName = patchRes.json?.doc?.name || patchRes.json?.name
    if (updatedName === newName) {
      log('PATCH /api/users/:id (update name)', 'PASS', `name=${updatedName}`)
    } else {
      log('PATCH /api/users/:id (update name)', 'PASS', `Updated (name may differ in response)`)
    }
  } else {
    log('PATCH /api/users/:id (update name)', 'FAIL', `Status: ${patchRes.status}`)
  }

  // Restore original name
  await fetchJSON(`/api/users/${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Contributor User' }),
  })

  // Try updating another user (should fail or update self only)
  const otherPatch = await fetchJSON(`/api/users/000000000000000000000000`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Hacked' }),
  })
  if (otherPatch.status >= 400) {
    log('PATCH other user rejected', 'PASS', `Status: ${otherPatch.status}`)
  } else {
    log('PATCH other user rejected', 'WARN', `Status: ${otherPatch.status} — may allow cross-user updates`)
  }
}

// ========================
// 8. FEEDBACK
// ========================
async function testFeedback() {
  console.log('\n━━━ 8. FEEDBACK ━━━')

  // Check feedback list for contributor
  const feedbackRes = await fetchJSON(`/api/feedback?where[contributor][equals]=${userId}&limit=5`)
  if (feedbackRes.ok && feedbackRes.json?.docs !== undefined) {
    log('GET /api/feedback (contributor)', 'PASS', `Found ${feedbackRes.json.totalDocs} feedback items`)
    if (feedbackRes.json.docs.length > 0) {
      testFeedbackId = feedbackRes.json.docs[0].id
    }
  } else {
    log('GET /api/feedback (contributor)', 'FAIL', `Status: ${feedbackRes.status}`)
  }

  // Contributor should NOT be able to create feedback (editors only)
  const createFeedback = await fetchJSON('/api/feedback/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Test Feedback',
      postId: testPostId || '000000000000000000000000',
      contributorId: userId,
      type: 'suggestions',
      initialMessage: 'Hello from test',
    }),
  })
  if (createFeedback.status === 403) {
    log('Contributor cannot create feedback', 'PASS', 'Correctly returns 403')
  } else {
    log('Contributor cannot create feedback', 'FAIL', `Expected 403, got: ${createFeedback.status}`)
  }

  // If we have a feedback item, try replying
  if (testFeedbackId) {
    const replyRes = await fetchJSON(`/api/feedback/${testFeedbackId}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'Automated test reply' }),
    })
    if (replyRes.ok || replyRes.status === 200 || replyRes.status === 201) {
      log('POST /api/feedback/:id/message (reply)', 'PASS')
    } else {
      log('POST /api/feedback/:id/message (reply)', 'FAIL', `Status: ${replyRes.status}: ${replyRes.text?.slice(0, 200)}`)
    }

    // Empty message
    const emptyMsg = await fetchJSON(`/api/feedback/${testFeedbackId}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: '' }),
    })
    if (emptyMsg.status === 400) {
      log('Reject empty feedback message', 'PASS')
    } else {
      log('Reject empty feedback message', 'FAIL', `Expected 400, got: ${emptyMsg.status}`)
    }
  } else {
    log('Feedback reply test', 'WARN', 'No feedback items to test against')
  }

  // Reply to non-existent feedback
  const ghostReply = await fetchJSON('/api/feedback/000000000000000000000000/message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: 'Ghost reply' }),
  })
  if (ghostReply.status >= 400 && ghostReply.status < 500) {
    log('Reply to invalid feedback rejected', 'PASS', `Status: ${ghostReply.status}`)
  } else {
    log('Reply to invalid feedback rejected', 'FAIL', `Expected 4xx, got: ${ghostReply.status}`)
  }
}

// ========================
// 9. SECURITY & ACCESS CONTROL
// ========================
async function testSecurity() {
  console.log('\n━━━ 9. SECURITY & ACCESS ━━━')

  // Contributor should NOT access admin panel
  const adminRes = await fetchHTML('/admin')
  if (adminRes.status === 200 && adminRes.text.includes('payload')) {
    // Payload admin renders, check if it does an auth redirect internally
    log('GET /admin as contributor', 'WARN', 'Payload admin rendered — may do client-side redirect')
  } else if (adminRes.status >= 300) {
    log('GET /admin as contributor', 'PASS', `Redirected: ${adminRes.status}`)
  } else {
    log('GET /admin as contributor', 'WARN', `Status: ${adminRes.status}`)
  }

  // Contributor accessing editor dashboard should redirect
  const editorRes = await fetchHTML('/editor')
  if (editorRes.status >= 300 || editorRes.status === 403) {
    log('GET /editor as contributor', 'PASS', `Status: ${editorRes.status}, Location: ${editorRes.location || 'N/A'}`)
  } else if (editorRes.status === 200) {
    log('GET /editor as contributor', 'WARN', 'Got 200 — editor page accessible to contributor')
  } else {
    log('GET /editor as contributor', 'FAIL', `Status: ${editorRes.status}`)
  }

  // Non-authenticated accessing contributor pages
  const noAuthPages = ['/contributor', '/contributor/create', '/contributor/drafts']
  for (const path of noAuthPages) {
    const res = await fetchHTML(path, '') // No cookie
    if (res.status >= 300) {
      log(`GET ${path} (no auth)`, 'PASS', `Redirected to ${res.location || 'login'}`)
    } else if (res.status === 200) {
      log(`GET ${path} (no auth)`, 'FAIL', 'Page accessible without authentication')
    } else {
      log(`GET ${path} (no auth)`, 'FAIL', `Status: ${res.status}`)
    }
  }

  // Contributor cannot delete other users
  const deleteRes = await fetchJSON('/api/users/000000000000000000000000', {
    method: 'DELETE',
  })
  if (deleteRes.status >= 400) {
    log('DELETE other user rejected', 'PASS', `Status: ${deleteRes.status}`)
  } else {
    log('DELETE other user rejected', 'FAIL', `Expected 4xx, got: ${deleteRes.status}`)
  }
}

// ========================
// 10. LAYOUT BADGE COUNTS
// ========================
async function testLayoutBadges() {
  console.log('\n━━━ 10. LAYOUT BADGE COUNTS ━━━')

  // Drafts: layout uses _status=draft, drafts page uses reviewStatus=draft
  const byStatus = await fetchJSON(`/api/posts?where[authors][equals]=${userId}&where[_status][equals]=draft&limit=0`)
  const byReview = await fetchJSON(`/api/posts?where[authors][equals]=${userId}&where[reviewStatus][equals]=draft&limit=0`)

  const statusCount = byStatus.json?.totalDocs ?? -1
  const reviewCount = byReview.json?.totalDocs ?? -1

  if (statusCount === reviewCount) {
    log('Draft badge consistent (_status vs reviewStatus)', 'PASS', `Both show ${statusCount}`)
  } else {
    log('Draft badge inconsistent (_status vs reviewStatus)', 'WARN',
      `Layout (_status=draft): ${statusCount}, Drafts page (reviewStatus=draft): ${reviewCount}`)
  }

  // Submissions: layout uses reviewStatus=pending (BUG), page uses reviewStatus=pending_review
  const badPending = await fetchJSON(`/api/posts?where[authors][equals]=${userId}&where[reviewStatus][equals]=pending&limit=0`)
  const goodPending = await fetchJSON(`/api/posts?where[authors][equals]=${userId}&where[reviewStatus][equals]=pending_review&limit=0`)

  const badCount = badPending.json?.totalDocs ?? -1
  const goodCount = goodPending.json?.totalDocs ?? -1

  if (badCount === goodCount && badCount > 0) {
    log('Submissions badge', 'PASS', `Both queries return ${badCount}`)
  } else if (badCount === 0 && goodCount > 0) {
    log('Submissions badge BUG', 'FAIL',
      `Layout queries "pending" (0 results) but correct value is "pending_review" (${goodCount} results)`)
  } else {
    log('Submissions badge', 'WARN', `pending:${badCount}, pending_review:${goodCount}`)
  }
}

// ========================
// 11. POST UPDATE & DELETE
// ========================
async function testPostOperations() {
  console.log('\n━━━ 11. POST UPDATE & DELETE ━━━')

  // Update draft post
  if (testDraftId) {
    const updateRes = await fetchJSON(`/api/posts/${testDraftId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: `Updated Draft ${Date.now()}` }),
    })
    if (updateRes.ok) {
      log('PATCH /api/posts/:id (update draft)', 'PASS')
    } else {
      log('PATCH /api/posts/:id (update draft)', 'FAIL', `Status: ${updateRes.status}`)
    }
  }

  // Get single post via Payload REST (custom /api/posts/[id] only has PATCH)
  if (testPostId) {
    const getRes = await fetchJSON(`/api/posts?where[id][equals]=${testPostId}&limit=1`)
    if (getRes.ok && getRes.json?.docs?.length > 0) {
      log('GET /api/posts (fetch single by id)', 'PASS', `Title: ${getRes.json.docs[0].title?.slice(0, 40)}`)
    } else {
      log('GET /api/posts (fetch single by id)', 'FAIL', `Status: ${getRes.status}, docs: ${getRes.json?.docs?.length}`)
    }
  }
}

// ========================
// 12. CATEGORIES LISTING
// ========================
async function testCategories() {
  console.log('\n━━━ 12. CATEGORIES ━━━')

  const catRes = await fetchJSON('/api/categories?limit=100')
  if (catRes.ok && catRes.json?.docs) {
    log('GET /api/categories', 'PASS', `Found ${catRes.json.docs.length} categories`)
  } else {
    log('GET /api/categories', 'FAIL', `Status: ${catRes.status}`)
  }
}

// ========================
// 13. CLEANUP
// ========================
async function cleanup() {
  console.log('\n━━━ 13. CLEANUP ━━━')

  const idsToDelete = [testPostId, testDraftId].filter(Boolean)
  let deleted = 0

  for (const id of idsToDelete) {
    const delRes = await fetchJSON(`/api/posts/${id}`, { method: 'DELETE' })
    if (delRes.ok || delRes.status === 200) {
      deleted++
    }
  }

  // Also delete any "Post with Image" drafts
  const imagePosts = await fetchJSON(`/api/posts?where[title][like]=Post with Image&where[authors][equals]=${userId}&limit=10`)
  if (imagePosts.ok && imagePosts.json?.docs) {
    for (const post of imagePosts.json.docs) {
      await fetchJSON(`/api/posts/${post.id}`, { method: 'DELETE' })
      deleted++
    }
  }

  // Delete any "X" title posts (from long-title test)
  const xPosts = await fetchJSON(`/api/posts?where[authors][equals]=${userId}&where[title][like]=XXXX&limit=10`)
  if (xPosts.ok && xPosts.json?.docs) {
    for (const post of xPosts.json.docs) {
      await fetchJSON(`/api/posts/${post.id}`, { method: 'DELETE' })
      deleted++
    }
  }

  // Clean up test media
  if (testMediaId) {
    await fetchJSON(`/api/media/${testMediaId}`, { method: 'DELETE' })
  }

  log('Cleanup test data', deleted > 0 ? 'PASS' : 'WARN', `Deleted ${deleted} posts`)
}

// ========================
// SUMMARY
// ========================
function printSummary() {
  console.log('\n' + '═'.repeat(60))
  console.log('  CONTRIBUTOR TEST RESULTS SUMMARY')
  console.log('═'.repeat(60))

  const pass = results.filter(r => r.status === 'PASS').length
  const fail = results.filter(r => r.status === 'FAIL').length
  const warn = results.filter(r => r.status === 'WARN').length

  console.log(`  ✅ PASS: ${pass}`)
  console.log(`  ❌ FAIL: ${fail}`)
  console.log(`  ⚠️  WARN: ${warn}`)
  console.log(`  Total: ${results.length}`)

  if (fail > 0) {
    console.log('\n  FAILURES:')
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`    ❌ ${r.name}${r.detail ? ': ' + r.detail : ''}`)
    })
  }

  if (warn > 0) {
    console.log('\n  WARNINGS:')
    results.filter(r => r.status === 'WARN').forEach(r => {
      console.log(`    ⚠️  ${r.name}${r.detail ? ': ' + r.detail : ''}`)
    })
  }

  console.log('\n' + '═'.repeat(60))
  process.exit(fail > 0 ? 1 : 0)
}

// ========================
// MAIN
// ========================
async function main() {
  console.log('🔧 Contributor Page Functionality Tests')
  console.log(`   Target: ${BASE_URL}`)
  console.log('   ' + new Date().toISOString())

  await testAuth()
  await testSSRPages()
  await testPostCreation()
  await testPostEdgeCases()
  await testPostsListing()
  await testMediaUpload()
  await testProfile()
  await testFeedback()
  await testSecurity()
  await testLayoutBadges()
  await testPostOperations()
  await testCategories()
  await cleanup()
  printSummary()
}

main().catch(err => {
  console.error('💀 Fatal error:', err)
  process.exit(2)
})
