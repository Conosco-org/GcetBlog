import { Banner } from '@payloadcms/ui/elements/Banner'
import React from 'react'

import { SeedButton } from './SeedButton'
import './index.scss'

const baseClass = 'before-dashboard'

const BeforeDashboard: React.FC = () => {
  return (
    <div className={baseClass}>
      <Banner className={`${baseClass}__banner`} type="success">
        <h4>Welcome to GCET Tech Blog Dashboard!</h4>
      </Banner>
      Here&apos;s what you can do:
      <ul className={`${baseClass}__instructions`}>
        <li>
          <SeedButton />
          {' with sample pages and posts to get started, then '}
          <a href="/" target="_blank">
            visit the blog
          </a>
          {' to see the results.'}
        </li>
        <li>
          Create and manage blog posts, pages, and media files from the collections in the sidebar.
        </li>
        <li>
          Review and approve role upgrade requests from contributors who want to become editors.
        </li>
        <li>
          Monitor activity through the Admin Logs collection to track changes made by team members.
        </li>
        <li>
          Manage user accounts and permissions based on roles (Admin, Editor, Contributor).
        </li>
      </ul>
      {'For questions or support, contact the GCET IT department or visit '}
      <a
        href="https://gcettbr.ac.in"
        rel="noopener noreferrer"
        target="_blank"
      >
        GCET Official Website
      </a>
      .
    </div>
  )
}

export default BeforeDashboard
