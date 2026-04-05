# Post Workflow Diagram

## Current vs Proposed Workflow

### CURRENT WORKFLOW (Has Issues)
```
┌─────────────────────────────────────────────────────────────────┐
│ CONTRIBUTOR                                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Create Draft                                                │
│     _status: 'draft'                                            │
│     reviewStatus: 'draft'                                       │
│                                                                  │
│  2. Submit for Review                                           │
│     _status: 'draft'                                            │
│     reviewStatus: 'pending_review'                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ EDITOR REVIEW QUEUE                                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Editor has 3 options:                                          │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   APPROVE    │  │   FEEDBACK   │  │    REJECT    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│         │                  │                  │                 │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
    ┌─────────┐      ┌─────────────┐    ┌──────────────┐
    │ PUBLISH │      │ ISSUE: Stays│    │ DELETE POST  │
    │         │      │ as pending  │    │ + Create     │
    │ _status:│      │ review!     │    │ Rejection    │
    │published│      │ Should go   │    │ Notification │
    └─────────┘      │ to draft!   │    └──────────────┘
                     └─────────────┘
```

### PROPOSED WORKFLOW (Fixed)
```
┌─────────────────────────────────────────────────────────────────┐
│ CONTRIBUTOR DRAFTS PAGE                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  TAB 1: CURRENT DRAFTS                                          │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ reviewStatus: 'draft' AND no editorFeedback            │    │
│  │ Actions: [Edit] [Delete] [Submit for Review]           │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  TAB 2: REQUESTING CHANGES                                      │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ reviewStatus: 'draft' AND has editorFeedback           │    │
│  │ Shows: Editor feedback prominently                      │    │
│  │ Actions: [Edit] [Delete] [Resubmit for Review]         │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  TAB 3: PENDING REVIEW                                          │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ reviewStatus: 'pending_review'                          │    │
│  │ Actions: [View Only] (no edit/delete while reviewing)  │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  SECTION: REJECTED POSTS (from RejectionNotifications)         │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ Post was deleted, showing rejection reason              │    │
│  │ Actions: None (informational only)                      │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ Submit for Review
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ EDITOR REVIEW QUEUE                                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  TAB 1: POST APPROVALS                                          │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ reviewStatus: 'pending_review'                          │    │
│  │ Actions: [Approve] [Request Changes] [Reject]           │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  TAB 2: COMMENT MODERATION                                      │
│  TAB 3: PUBLISHING SCHEDULE                                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
          │                  │                  │
          │                  │                  │
          ▼                  ▼                  ▼
    ┌─────────┐      ┌─────────────┐    ┌──────────────┐
    │ APPROVE │      │REQUEST CHANGE│    │    REJECT    │
    │         │      │              │    │              │
    │ Set:    │      │ Set:         │    │ Action:      │
    │ review  │      │ reviewStatus │    │ 1. Create    │
    │ Status: │      │ = 'draft'    │    │ Rejection    │
    │approved │      │              │    │ Notification │
    │         │      │ Add:         │    │ 2. Delete    │
    │ Then    │      │ editorFeed   │    │ Post         │
    │ editor  │      │ back field   │    │              │
    │ can     │      │              │    │              │
    │ publish │      │ Goes to      │    │              │
    │         │      │ "Requesting  │    │              │
    │         │      │ Changes" tab │    │              │
    └─────────┘      └─────────────┘    └──────────────┘
                             │
                             │ Contributor edits
                             ▼
                     ┌─────────────┐
                     │ Back to     │
                     │ "Requesting │
                     │ Changes"    │
                     │ tab in      │
                     │ Contributor │
                     │ Drafts      │
                     └─────────────┘
```

## State Transitions

### Contributor Actions:
```
CURRENT DRAFTS
  ├─ [Edit] → Stay in CURRENT DRAFTS
  ├─ [Delete] → Remove from database
  └─ [Submit for Review] → Move to PENDING REVIEW

REQUESTING CHANGES
  ├─ [Edit] → Stay in REQUESTING CHANGES
  ├─ [Delete] → Remove from database
  └─ [Resubmit for Review] → Move to PENDING REVIEW (clears editorFeedback)

PENDING REVIEW
  └─ [View Only] → Wait for editor action
```

### Editor Actions:
```
PENDING REVIEW
  ├─ [Approve] → reviewStatus: 'approved' (editor can then publish)
  ├─ [Request Changes] → reviewStatus: 'draft' + editorFeedback
  │                       (goes to contributor's REQUESTING CHANGES)
  └─ [Reject] → Delete post + Create RejectionNotification
                (shows in contributor's REJECTED POSTS section)
```

## Key Differences from Current System

1. **"Request Changes" now sets reviewStatus to 'draft'** (not 'rejected')
   - This keeps the post in the database
   - Contributor can edit and resubmit
   - Shows in "Requesting Changes" tab

2. **"Reject" permanently deletes the post**
   - Creates RejectionNotification for history
   - Shows in "Rejected Posts" section (read-only)
   - Cannot be recovered

3. **Contributor can delete their own drafts**
   - Only when reviewStatus is 'draft'
   - Cannot delete while 'pending_review'

4. **Clear separation of states**
   - Current Drafts: Never submitted OR no feedback
   - Requesting Changes: Has editor feedback
   - Pending Review: Under editor review
   - Rejected: Permanently deleted (historical record only)
