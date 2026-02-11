/**
 * Editor Page Functionality Test Script
 * Tests all editor API endpoints and page functionality
 * Run: node scripts/test-editor.mjs
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
let AUTH_COOKIE = ''
let userId = ''
let testPostId = ''
let testCategoryId = ''
let testMediaId = ''

const results = []
function log(name, status, detail = '') {
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️'
  results.push({ name, status, detail })
  console.log(`${icon} [${status}] ${name}${detail ? ' — ' + detail : ''}`)
}

async function fetchJSON(path, options = {}) {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`
  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Cookie: AUTH_COOKIE,
    },
    redirect: 'manual',
  })
  const text = await res.text()
  let json = null
  try { json = JSON.parse(text) } catch {}
  return { status: res.status, json, text, headers: res.headers, ok: res.ok }
}

// ========================
// 1. AUTH
// ========================
async function testAuth() {
  console.log('\n━━━ 1. AUTHENTICATION ━━━')
  
  // Login as editor
  const loginRes = await fetch(`${BASE_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'editor@gmail.com', password: 'editor' }),
    redirect: 'manual',
  })
  const setCookieHeader = loginRes.headers.get('set-cookie')
  const loginJson = await loginRes.json().catch(() => null)

  if (loginRes.ok && loginJson?.user) {
    AUTH_COOKIE = setCookieHeader || ''
    userId = loginJson.user.id
    log('Login as editor', 'PASS', `User: ${loginJson.user.email}, Role: ${loginJson.user.role}`)
  } else {
    // Try with payload-token from body
    if (loginJson?.token) {
      AUTH_COOKIE = `payload-token=${loginJson.token}`
      userId = loginJson.user?.id || ''
      log('Login as editor', 'PASS', `Token auth, User: ${loginJson.user?.email}`)
    } else {
      log('Login as editor', 'FAIL', `Status: ${loginRes.status}, ${JSON.stringify(loginJson)}`)
      console.log('\n⛔ Cannot continue without auth. Provide valid editor credentials.')
      process.exit(1)
    }
  }

  // Test /api/users/me
  const meRes = await fetchJSON('/api/users/me')
  if (meRes.ok) {
    log('GET /api/users/me', 'PASS', JSON.stringify(meRes.json))
  } else {
    log('GET /api/users/me', 'FAIL', `Status: ${meRes.status}`)
  }

  // Test /api/auth/me
  const authMeRes = await fetchJSON('/api/auth/me')
  if (authMeRes.ok) {
    log('GET /api/auth/me', 'PASS')
  } else {
    log('GET /api/auth/me', 'FAIL', `Status: ${authMeRes.status}`)
  }
}

// ========================
// 2. CATEGORIES
// ========================
async function testCategories() {
  console.log('\n━━━ 2. CATEGORIES ━━━')

  // List categories (Payload REST)
  const listRes = await fetchJSON('/api/categories')
  if (listRes.ok && listRes.json?.docs) {
    log('GET /api/categories (list)', 'PASS', `Found ${listRes.json.docs.length} categories`)
  } else {
    log('GET /api/categories (list)', 'FAIL', `Status: ${listRes.status}`)
  }

  // Create category
  const createRes = await fetchJSON('/api/categories/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: `Test-${Date.now()}` }),
  })
  if (createRes.ok && (createRes.json?.doc || createRes.json?.id)) {
    testCategoryId = createRes.json.doc?.id || createRes.json.id
    log('POST /api/categories/create', 'PASS', `ID: ${testCategoryId}`)
  } else {
    log('POST /api/categories/create', 'FAIL', `Status: ${createRes.status}, ${createRes.text?.slice(0, 200)}`)
  }

  // Update category
  if (testCategoryId) {
    const updateRes = await fetchJSON(`/api/categories/${testCategoryId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: `Updated-${Date.now()}` }),
    })
    if (updateRes.ok) {
      log('PATCH /api/categories/:id', 'PASS')
    } else {
      log('PATCH /api/categories/:id', 'FAIL', `Status: ${updateRes.status}, ${updateRes.text?.slice(0, 200)}`)
    }
  }

  // Delete category
  if (testCategoryId) {
    const deleteRes = await fetchJSON(`/api/categories/${testCategoryId}`, {
      method: 'DELETE',
    })
    if (deleteRes.ok) {
      log('DELETE /api/categories/:id', 'PASS')
    } else {
      log('DELETE /api/categories/:id', 'FAIL', `Status: ${deleteRes.status}, ${deleteRes.text?.slice(0, 200)}`)
    }
  }
}

// ========================
// 3. MEDIA UPLOAD
// ========================
async function testMedia() {
  console.log('\n━━━ 3. MEDIA UPLOAD ━━━')

  // Create a tiny test PNG (1x1 pixel)
  const pngBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  )

  // Upload via custom /api/media route
  const formData = new FormData()
  const blob = new Blob([pngBuffer], { type: 'image/png' })
  formData.append('file', blob, 'test-upload.png')
  formData.append('alt', 'Test upload')

  const uploadRes = await fetch(`${BASE_URL}/api/media`, {
    method: 'POST',
    headers: { Cookie: AUTH_COOKIE },
    body: formData,
    redirect: 'manual',
  })
  const uploadText = await uploadRes.text()
  let uploadJson = null
  try { uploadJson = JSON.parse(uploadText) } catch {}

  if (uploadRes.ok && uploadJson?.doc) {
    testMediaId = uploadJson.doc.id
    log('POST /api/media (upload)', 'PASS', `ID: ${testMediaId}, URL: ${uploadJson.cloudinaryUrl || uploadJson.doc.url}`)
  } else {
    log('POST /api/media (upload)', 'FAIL', `Status: ${uploadRes.status}, Response: ${uploadText.slice(0, 300)}`)
    // Try to identify the specific error
    if (uploadText.includes('CLOUDINARY') || uploadText.includes('cloudinary')) {
      log('  → Cloudinary config', 'FAIL', 'Cloudinary environment variables may be missing or invalid')
    }
    if (uploadText.includes('ENOENT') || uploadText.includes('no such file')) {
      log('  → File system', 'FAIL', 'public/media directory may not exist')
    }
    if (uploadText.includes('Unauthorized') || uploadRes.status === 401) {
      log('  → Auth', 'FAIL', 'Upload requires authentication')
    }
    if (uploadText.includes('Forbidden') || uploadRes.status === 403) {
      log('  → Access', 'FAIL', 'User role may not have upload permission')
    }
  }

  // List media (Payload REST)
  const listRes = await fetchJSON('/api/media?limit=5')
  if (listRes.ok && listRes.json?.docs) {
    log('GET /api/media (list)', 'PASS', `Found ${listRes.json.totalDocs} media items`)
  } else {
    log('GET /api/media (list)', 'FAIL', `Status: ${listRes.status}`)
  }
}

// ========================
// 4. POSTS
// ========================
async function testPosts() {
  console.log('\n━━━ 4. POSTS ━━━')

  // Create post via /api/posts
  const createRes = await fetchJSON('/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: `Test Post ${Date.now()}`,
      content: {
        root: {
          type: 'root',
          children: [{ type: 'paragraph', children: [{ type: 'text', text: 'Test content for automated testing', version: 1 }], version: 1 }],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      },
      _status: 'draft',
    }),
  })
  if (createRes.ok && (createRes.json?.post || createRes.json?.doc)) {
    testPostId = createRes.json.post?.id || createRes.json.doc?.id
    const slug = createRes.json.post?.slug || createRes.json.doc?.slug
    log('POST /api/posts (create)', 'PASS', `ID: ${testPostId}, Slug: ${slug || 'MISSING!'}`)
    if (!slug) {
      log('  → Slug generation', 'WARN', 'No slug generated — /api/posts does not auto-generate slugs')
    }
  } else {
    log('POST /api/posts (create)', 'FAIL', `Status: ${createRes.status}, ${createRes.text?.slice(0, 300)}`)
  }

  // Create post via /api/posts/create (alternate endpoint)
  const createRes2 = await fetchJSON('/api/posts/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: `Test Post Alt ${Date.now()}`,
      content: {
        root: {
          type: 'root',
          children: [{ type: 'paragraph', children: [{ type: 'text', text: 'Alt endpoint test', version: 1 }], version: 1 }],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      },
    }),
  })
  if (createRes2.ok && (createRes2.json?.post || createRes2.json?.doc)) {
    const altPost = createRes2.json.post || createRes2.json.doc
    const altSlug = altPost.slug
    log('POST /api/posts/create (alt)', 'PASS', `Slug: ${altSlug || 'MISSING'}`)
    // Cleanup
    try { await fetchJSON(`/api/posts/${altPost.id}`, { method: 'DELETE' }) } catch {}
  } else {
    log('POST /api/posts/create (alt)', 'FAIL', `Status: ${createRes2.status}, ${createRes2.text?.slice(0, 300)}`)
  }

  // Update post
  if (testPostId) {
    const updateRes = await fetchJSON(`/api/posts/${testPostId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: `Updated Test Post ${Date.now()}` }),
    })
    if (updateRes.ok) {
      log('PATCH /api/posts/:id (update)', 'PASS')
    } else {
      log('PATCH /api/posts/:id (update)', 'FAIL', `Status: ${updateRes.status}, ${updateRes.text?.slice(0, 200)}`)
    }
  }

  // List posts (Payload REST)
  const listRes = await fetchJSON('/api/posts?limit=3&draft=true')
  if (listRes.ok && listRes.json?.docs) {
    log('GET /api/posts (list)', 'PASS', `Found ${listRes.json.totalDocs} posts`)
  } else {
    log('GET /api/posts (list)', 'FAIL', `Status: ${listRes.status}`)
  }
}

// ========================
// 5. USER PROFILE
// ========================
async function testProfile() {
  console.log('\n━━━ 5. USER PROFILE ━━━')

  if (!userId) {
    log('Profile tests', 'SKIP', 'No userId')
    return
  }

  // Get full user
  const userRes = await fetchJSON(`/api/users/${userId}`)
  if (userRes.ok && (userRes.json?.name || userRes.json?.email)) {
    log('GET /api/users/:id (full profile)', 'PASS', `Name: ${userRes.json.name}`)
  } else {
    log('GET /api/users/:id (full profile)', 'FAIL', `Status: ${userRes.status}, ${userRes.text?.slice(0, 200)}`)
  }

  // Update name
  const updateRes = await fetchJSON(`/api/users/${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: userRes.json?.name || 'editor' }),
  })
  if (updateRes.ok) {
    log('PATCH /api/users/:id (update name)', 'PASS')
  } else {
    log('PATCH /api/users/:id (update name)', 'FAIL', `Status: ${updateRes.status}, ${updateRes.text?.slice(0, 200)}`)
  }
}

// ========================
// 6. COMMENTS
// ========================
async function testComments() {
  console.log('\n━━━ 6. COMMENTS ━━━')

  // List comments
  const listRes = await fetchJSON('/api/comments?limit=5')
  if (listRes.ok && listRes.json?.docs !== undefined) {
    log('GET /api/comments (list)', 'PASS', `Found ${listRes.json.totalDocs} comments`)
  } else {
    log('GET /api/comments (list)', 'FAIL', `Status: ${listRes.status}, ${listRes.text?.slice(0, 200)}`)
  }

  // List pending comments
  const pendingRes = await fetchJSON('/api/comments?where[status][equals]=pending&limit=5')
  if (pendingRes.ok) {
    log('GET /api/comments?status=pending', 'PASS', `Found ${pendingRes.json?.totalDocs || 0} pending`)
  } else {
    log('GET /api/comments?status=pending', 'FAIL', `Status: ${pendingRes.status}`)
  }
}

// ========================
// 7. ADMIN STATS
// ========================
async function testAdminStats() {
  console.log('\n━━━ 7. ADMIN STATS ━━━')

  const statsRes = await fetchJSON('/api/admin/stats')
  if (statsRes.ok && statsRes.json) {
    log('GET /api/admin/stats', 'PASS', JSON.stringify(statsRes.json))
  } else if (statsRes.status === 403) {
    log('GET /api/admin/stats', 'PASS', 'Correctly restricted to admins (403 for editor)')
  } else {
    log('GET /api/admin/stats', 'FAIL', `Status: ${statsRes.status}, ${statsRes.text?.slice(0, 200)}`)
  }
}

// ========================
// 8. SECURITY CHECKS
// ========================
async function testSecurity() {
  console.log('\n━━━ 8. SECURITY ━━━')

  // Check if seed-posts is accessible without auth
  const seedRes = await fetch(`${BASE_URL}/api/seed-posts`, { redirect: 'manual' })
  if (seedRes.ok || seedRes.status === 200) {
    log('/api/seed-posts (no auth)', 'FAIL', 'SECURITY: Endpoint accessible without authentication!')
  } else if (seedRes.status === 401 || seedRes.status === 403) {
    log('/api/seed-posts (no auth)', 'PASS', 'Protected')
  } else {
    log('/api/seed-posts (no auth)', 'WARN', `Status: ${seedRes.status}`)
  }
}

// ========================
// 9. EDITOR PAGES (SSR)
// ========================
async function testPages() {
  console.log('\n━━━ 9. EDITOR PAGES (SSR) ━━━')

  const pages = [
    '/editor',
    '/editor/content',
    '/editor/queue',
    '/editor/comments',
    '/editor/media',
    '/editor/categories',
    '/editor/settings',
    '/editor/templates',
    '/editor/analytics',
    '/editor/activity',
    '/editor/profile',
    '/editor/posts/create',
  ]

  for (const path of pages) {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: { Cookie: AUTH_COOKIE },
      redirect: 'manual',
    })
    if (res.status === 200) {
      const html = await res.text()
      const hasError = html.includes('Internal Server Error') || html.includes('Application error') || html.includes('Server Error')
      if (hasError) {
        log(`GET ${path}`, 'FAIL', 'Page renders but contains server error')
      } else {
        log(`GET ${path}`, 'PASS')
      }
    } else if (res.status === 302 || res.status === 307) {
      const loc = res.headers.get('location')
      log(`GET ${path}`, 'WARN', `Redirect → ${loc}`)
    } else {
      log(`GET ${path}`, 'FAIL', `Status: ${res.status}`)
    }
  }

  // Test edit page with a real post
  if (testPostId) {
    // Route 1: /editor/posts/edit/:id
    const edit1 = await fetch(`${BASE_URL}/editor/posts/edit/${testPostId}`, {
      headers: { Cookie: AUTH_COOKIE },
      redirect: 'manual',
    })
    const edit1Html = await edit1.text()
    const edit1HasError = edit1Html.includes('Internal Server Error') || edit1Html.includes('Application error') || edit1Html.includes('ReferenceError') || edit1Html.includes('is not defined')
    if (edit1.status === 200 && !edit1HasError) {
      log('GET /editor/posts/edit/:id (route 1)', 'PASS')
    } else {
      log('GET /editor/posts/edit/:id (route 1)', 'FAIL', `Status: ${edit1.status}, error in HTML: ${edit1HasError}`)
    }

    // Route 2: /editor/posts/:id/edit
    const edit2 = await fetch(`${BASE_URL}/editor/posts/${testPostId}/edit`, {
      headers: { Cookie: AUTH_COOKIE },
      redirect: 'manual',
    })
    if (edit2.status === 200) {
      log('GET /editor/posts/:id/edit (route 2)', 'PASS')
    } else {
      log('GET /editor/posts/:id/edit (route 2)', 'FAIL', `Status: ${edit2.status}`)
    }
  }
}

// ========================
// CLEANUP
// ========================
async function cleanup() {
  console.log('\n━━━ CLEANUP ━━━')
  if (testPostId) {
    try {
      await fetchJSON(`/api/posts/${testPostId}`, { method: 'DELETE' })
      log('Delete test post', 'PASS')
    } catch {
      log('Delete test post', 'FAIL')
    }
  }
  if (testMediaId) {
    try {
      await fetchJSON(`/api/media/${testMediaId}`, { method: 'DELETE' })
      log('Delete test media', 'PASS')
    } catch {
      log('Delete test media', 'FAIL')
    }
  }
}

// ========================
// REPORT
// ========================
function printReport() {
  console.log('\n' + '═'.repeat(60))
  console.log('  EDITOR FUNCTIONALITY TEST REPORT')
  console.log('═'.repeat(60))
  const pass = results.filter(r => r.status === 'PASS').length
  const fail = results.filter(r => r.status === 'FAIL').length
  const warn = results.filter(r => r.status === 'WARN').length
  console.log(`  ✅ Passed: ${pass}`)
  console.log(`  ❌ Failed: ${fail}`)
  console.log(`  ⚠️  Warnings: ${warn}`)
  console.log('═'.repeat(60))

  if (fail > 0) {
    console.log('\n🔴 FAILURES:')
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`  • ${r.name}: ${r.detail}`)
    })
  }
  if (warn > 0) {
    console.log('\n🟡 WARNINGS:')
    results.filter(r => r.status === 'WARN').forEach(r => {
      console.log(`  • ${r.name}: ${r.detail}`)
    })
  }
}

// ========================
// MAIN
// ========================
async function main() {
  console.log(`\n🧪 Testing Editor Functionality @ ${BASE_URL}\n`)
  
  await testAuth()
  await testCategories()
  await testMedia()
  await testPosts()
  await testProfile()
  await testComments()
  await testAdminStats()
  await testSecurity()
  await testPages()
  await cleanup()
  printReport()
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
