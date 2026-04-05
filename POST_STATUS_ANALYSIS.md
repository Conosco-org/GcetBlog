# Post Status Analysis - GCET Blog Platform

## Current Status System

A post in the GCET Blog platform has **TWO separate status fields**:

### 1. `_status` (Payload CMS Built-in)
**Purpose**: Controls publication state in Payload CMS
**Values**:
- `draft` - Post is not published, only visible in admin/editor
- `published` - Post is live on the website

**Who Controls**: Editors and Admins only
**Why**: This is Payload's native draft/publish system for content visibility

### 2. `reviewStatus` (Custom Field)
**Purpose**: Tracks the editorial review workflow
**Values**:
- `draft` - Contributor is working on it
- `pending_review` - Submitted for editor review
- `approved` - Editor approved, ready to publish
- `rejected` - Editor rejected, needs revision

**Who Controls**: Editors and Admins only (contributors cannot change this)
**Why**: Separates editorial workflow from publication state

## Why Two Status Fields?

### Scenario Examples:

**Example 1: Draft Post**
```
_status: 'draft'
reviewStatus: 'draft'
```
Contributor is writing, not submitted yet. Not visible on website.

**Example 2: Submitted for Review**
```
_status: 'draft'
reviewStatus: 'pending_review'
```
Contributor submitted, editor reviewing. Still not visible on website.

**Example 3: Approved but Not Published**
```
_status: 'draft'
reviewStatus: 'approved'
```
Editor approved, but not published yet (maybe scheduled for later).

**Example 4: Published Post**
```
_status: 'published'
reviewStatus: 'approved'
```
Post is live on the website.

**Example 5: Rejected Post**
```
_status: 'draft'
reviewStatus: 'rejected'
editorFeedback: "Please add more details..."
```
Editor rejected, contributor needs to revise.

## Current Workflow Issues

### Problem 1: When Editor Requests Changes
Currently, when editor clicks "Request Changes":
- Post stays as `reviewStatus: 'pending_review'` (WRONG!)
- Should go back to `reviewStatus: 'draft'` (CORRECT!)
- Should add `editorFeedback` field with comments

### Problem 2: Contributor Drafts Page Confusion
Currently shows:
- All posts with `reviewStatus: 'draft'` OR `reviewStatus: 'rejected'`
- But doesn't distinguish between:
  - Posts never submitted (true drafts)
  - Posts with editor feedback (requesting changes)
  - Posts rejected and deleted (shown via RejectionNotifications)

### Problem 3: No Delete Permission
Contributors cannot delete their own drafts currently.

## Proposed Solution

### New Status Flow:

1. **Current Drafts** (`reviewStatus: 'draft'` AND no `editorFeedback`)
   - Never submitted OR editor requested changes and contributor is revising
   - Actions: Edit, Delete, Submit for Review

2. **Requesting Changes** (`reviewStatus: 'draft'` AND has `editorFeedback`)
   - Editor sent feedback, waiting for contributor to revise
   - Actions: Edit, Delete, Resubmit for Review
   - Show editor feedback prominently

3. **Pending Review** (`reviewStatus: 'pending_review'`)
   - Submitted, waiting for editor review
   - Actions: View only (cannot edit while under review)

4. **Rejected Posts** (Shown via RejectionNotifications collection)
   - Post was permanently deleted by editor
   - Show rejection reason
   - No actions (post is gone, just informational)

### Key Changes Needed:

1. **Editor "Request Changes" Action**:
   - Set `reviewStatus: 'draft'` (not 'rejected')
   - Add `editorFeedback` with comments
   - Keep post in database (don't delete)
   - Notify contributor

2. **Contributor Drafts Page**:
   - 3 tabs: "Current Drafts", "Requesting Changes", "Pending Review"
   - Remove "Rejected Posts" section (use RejectionNotifications instead)
   - Add Delete button for drafts
   - Add Edit button for all states

3. **Access Control**:
   - Allow contributors to delete their own posts (when `reviewStatus: 'draft'`)
   - Keep edit access (already implemented)

## Questions for Clarification

1. Should contributors be able to delete posts that are `pending_review`?
   - Recommendation: NO - once submitted, only editor can reject

2. Should we show "Rejected Posts" from RejectionNotifications in drafts page?
   - Recommendation: YES - but as read-only informational cards, no "Mark as Read"

3. When editor "Requests Changes", should it automatically notify contributor?
   - Recommendation: YES - via email or in-app notification

4. Should there be a limit on how many times a post can be resubmitted?
   - Recommendation: NO - allow unlimited revisions

Please confirm these assumptions before I proceed with implementation.
