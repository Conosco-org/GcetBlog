#!/usr/bin/env node

/**
 * Admin Dashboard Test Script
 * Tests all admin-dashboard pages for accessibility, basic structure, and auth behavior.
 *
 * Usage:
 *   node scripts/test-admin.mjs
 *
 * Prerequisites:
 *   - Server running on http://localhost:3000
 *   - Admin user: admin@gcet.edu.in / admin123
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@gcet.edu.in'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

let passed = 0
let failed = 0
let skipped = 0

function log(status, message) {
  const icons = { PASS: '\x1b[32m✓\x1b[0m', FAIL: '\x1b[31m✗\x1b[0m', SKIP: '\x1b[33m⊘\x1b[0m', INFO: '\x1b[36mℹ\x1b[0m' }
  console.log(`  ${icons[status] || ' '} ${message}`)
}

async function loginAsAdmin() {
  try {
    const res = await fetch(`${BASE_URL}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
      redirect: 'manual',
    })

    if (!res.ok && res.status !== 200) {
      log('FAIL', `Login failed with status ${res.status}`)
      return null
    }

    const data = await res.json()
    const token = data.token
    if (!token) {
      log('FAIL', 'No token received from login')
      return null
    }

    log('PASS', `Logged in as ${ADMIN_EMAIL}`)
    return token
  } catch (err) {
    log('FAIL', `Login error: ${err.message}`)
    return null
  }
}

async function testPageLoad(token, path, expectedStatus = 200) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: {
        Cookie: `payload-token=${token}`,
      },
      redirect: 'manual',
    })

    const status = res.status

    if (expectedStatus === 'redirect') {
      if (status >= 300 && status < 400) {
        log('PASS', `${path} → redirected (${status})`)
        passed++
        return { ok: true, redirected: true, status }
      } else {
        log('FAIL', `${path} → expected redirect, got ${status}`)
        failed++
        return { ok: false, status }
      }
    }

    if (status === expectedStatus) {
      log('PASS', `${path} → ${status}`)
      passed++
      return { ok: true, status }
    } else {
      log('FAIL', `${path} → expected ${expectedStatus}, got ${status}`)
      failed++
      return { ok: false, status }
    }
  } catch (err) {
    log('FAIL', `${path} → ${err.message}`)
    failed++
    return { ok: false, error: err.message }
  }
}

async function testUnauthAccess(path) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      redirect: 'manual',
    })

    const status = res.status
    if (status >= 300 && status < 400) {
      log('PASS', `${path} (unauth) → redirected (${status})`)
      passed++
    } else if (status === 200) {
      log('FAIL', `${path} (unauth) → should redirect, got 200`)
      failed++
    } else {
      log('PASS', `${path} (unauth) → ${status}`)
      passed++
    }
  } catch (err) {
    log('FAIL', `${path} (unauth) → ${err.message}`)
    failed++
  }
}

async function testPageContent(token, path, checks) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: {
        Cookie: `payload-token=${token}`,
      },
      redirect: 'follow',
    })

    if (res.status !== 200) {
      log('FAIL', `${path} → status ${res.status}`)
      failed++
      return
    }

    const html = await res.text()

    for (const check of checks) {
      if (check.type === 'contains') {
        if (html.includes(check.value)) {
          log('PASS', `${path} contains "${check.label}"`)
          passed++
        } else {
          log('FAIL', `${path} missing "${check.label}"`)
          failed++
        }
      }
      if (check.type === 'notContains') {
        if (!html.includes(check.value)) {
          log('PASS', `${path} does not contain "${check.label}"`)
          passed++
        } else {
          log('FAIL', `${path} should not contain "${check.label}"`)
          failed++
        }
      }
    }
  } catch (err) {
    log('FAIL', `${path} content check → ${err.message}`)
    failed++
  }
}

async function run() {
  console.log('\n\x1b[1m🔧 Admin Dashboard Test Suite\x1b[0m')
  console.log(`   Base URL: ${BASE_URL}\n`)

  // 1. Auth Tests
  console.log('\x1b[1m📋 Authentication Tests\x1b[0m')
  const token = await loginAsAdmin()
  if (!token) {
    console.log('\n\x1b[31m✗ Cannot proceed without authentication\x1b[0m')
    process.exit(1)
  }

  // 2. Unauthenticated access
  console.log('\n\x1b[1m🔒 Unauthenticated Access Tests\x1b[0m')
  await testUnauthAccess('/admin-dashboard')
  await testUnauthAccess('/admin-dashboard/users')
  await testUnauthAccess('/admin-dashboard/posts')

  // 3. Page Load Tests (authenticated)
  console.log('\n\x1b[1m📄 Page Load Tests (Authenticated)\x1b[0m')
  const pages = [
    '/admin-dashboard',
    '/admin-dashboard/users',
    '/admin-dashboard/posts',
    '/admin-dashboard/queue',
    '/admin-dashboard/comments',
    '/admin-dashboard/requests',
    '/admin-dashboard/logs',
    '/admin-dashboard/profile',
  ]

  for (const page of pages) {
    await testPageLoad(token, page)
  }

  // 4. /admin redirect test
  console.log('\n\x1b[1m🔄 Redirect Tests\x1b[0m')
  await testPageLoad(token, '/admin', 'redirect')

  // 5. Content structure checks
  console.log('\n\x1b[1m🧪 Content Structure Tests\x1b[0m')
  await testPageContent(token, '/admin-dashboard', [
    { type: 'contains', value: 'Admin Dashboard', label: 'Page title' },
    { type: 'contains', value: 'Total Users', label: 'Stats card' },
    { type: 'contains', value: 'Quick Actions', label: 'Quick actions section' },
    { type: 'notContains', value: 'v2.4.1', label: 'Hardcoded version string removed' },
  ])

  await testPageContent(token, '/admin-dashboard/users', [
    { type: 'contains', value: 'User Management', label: 'Page title' },
    { type: 'notContains', value: 'Regular Users', label: 'Invalid role card removed' },
  ])

  await testPageContent(token, '/admin-dashboard/logs', [
    { type: 'contains', value: 'Activity Logs', label: 'Page title' },
  ])

  // Summary
  console.log('\n\x1b[1m━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m')
  console.log(`  \x1b[32m${passed} passed\x1b[0m  \x1b[31m${failed} failed\x1b[0m  \x1b[33m${skipped} skipped\x1b[0m`)
  console.log('\x1b[1m━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m\n')

  process.exit(failed > 0 ? 1 : 0)
}

run()
