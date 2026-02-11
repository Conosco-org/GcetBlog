'use client'

import { Settings as SettingsIcon, Bell, Workflow, FileText, Save, Download, Upload } from 'lucide-react'
import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')

  return (
    <div className="p-8 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold">Workspace Settings</h1>
            <p className="text-muted-foreground">Configure your editorial workspace and preferences</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Settings
            </Button>
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Import Settings
            </Button>
            <Button>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Card className="mb-6">
        <div className="border-b">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('general')}
              className={`px-6 py-4 text-sm font-medium flex items-center gap-2 border-b-2 transition ${
                activeTab === 'general'
                  ? 'text-primary border-primary'
                  : 'text-muted-foreground border-transparent hover:text-foreground'
              }`}
            >
              <SettingsIcon className="w-4 h-4" />
              General
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-6 py-4 text-sm font-medium flex items-center gap-2 border-b-2 transition ${
                activeTab === 'notifications'
                  ? 'text-primary border-primary'
                  : 'text-muted-foreground border-transparent hover:text-foreground'
              }`}
            >
              <Bell className="w-4 h-4" />
              Notifications
            </button>
            <button
              onClick={() => setActiveTab('workflow')}
              className={`px-6 py-4 text-sm font-medium flex items-center gap-2 border-b-2 transition ${
                activeTab === 'workflow'
                  ? 'text-primary border-primary'
                  : 'text-muted-foreground border-transparent hover:text-foreground'
              }`}
            >
              <Workflow className="w-4 h-4" />
              Workflow
            </button>
            <button
              onClick={() => setActiveTab('guidelines')}
              className={`px-6 py-4 text-sm font-medium flex items-center gap-2 border-b-2 transition ${
                activeTab === 'guidelines'
                  ? 'text-primary border-primary'
                  : 'text-muted-foreground border-transparent hover:text-foreground'
              }`}
            >
              <FileText className="w-4 h-4" />
              Guidelines
            </button>
          </nav>
        </div>
      </Card>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* General Preferences */}
        {activeTab === 'general' && (
          <>
            <Card className="lg:col-span-2 p-6">
              <div className="flex items-center gap-3 mb-6">
                <SettingsIcon className="w-5 h-5 text-muted-foreground" />
                <h2 className="text-xl font-bold">General Preferences</h2>
              </div>

              <div className="space-y-6">
                {/* Default Post Status */}
                <div>
                  <label htmlFor="defaultPostStatus" className="block text-sm font-semibold mb-2">
                    Default Post Status
                  </label>
                  <select id="defaultPostStatus" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background">
                    <option>Draft</option>
                    <option>Pending Review</option>
                    <option>Published</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">Default status for new posts</p>
                </div>

                {/* Auto-save Interval */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Auto-save Interval
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="10"
                      max="300"
                      step="10"
                      defaultValue="10"
                      className="flex-1"
                      aria-label="Auto-save interval in seconds"
                    />
                    <span className="text-sm text-muted-foreground">10s</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>10s</span>
                    <span>30s</span>
                    <span>300s</span>
                  </div>
                </div>

                {/* Media Upload Limit */}
                <div>
                  <label htmlFor="mediaUploadLimit" className="block text-sm font-semibold mb-2">
                    Media Upload Limit (MB)
                  </label>
                  <input
                    id="mediaUploadLimit"
                    type="number"
                    defaultValue="50"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Maximum file size for media uploads</p>
                </div>

                {/* Editor Theme */}
                <div>
                  <label className="block text-sm font-semibold mb-3">
                    Editor Theme
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="theme"
                        value="light"
                        defaultChecked
                        className="text-primary"
                      />
                      <span className="text-sm">Light Theme</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="theme"
                        value="dark"
                        className="text-primary"
                      />
                      <span className="text-sm">Dark Theme</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="theme"
                        value="auto"
                        className="text-primary"
                      />
                      <span className="text-sm">Auto (System)</span>
                    </label>
                  </div>
                </div>
              </div>
            </Card>

            {/* Interface Customization */}
            <Card className="p-6">
              <h2 className="text-lg font-bold mb-6">Interface Customization</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Compact View</p>
                    <p className="text-xs text-muted-foreground">Use condensed interface layout</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" aria-label="Compact View" />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Show Line Numbers</p>
                    <p className="text-xs text-muted-foreground">Display line numbers in editor</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" aria-label="Show Line Numbers" />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Syntax Highlighting</p>
                    <p className="text-xs text-muted-foreground">Enable code syntax highlighting</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" aria-label="Syntax Highlighting" />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Auto-complete</p>
                    <p className="text-xs text-muted-foreground">Enable text auto-completion</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" aria-label="Auto-complete" />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div>
                  <label htmlFor="defaultEditorView" className="block text-sm font-medium mb-2">
                    Default Editor View
                  </label>
                  <select id="defaultEditorView" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-sm">
                    <option>Visual Editor</option>
                    <option>Code Editor</option>
                    <option>Split View</option>
                  </select>
                </div>
              </div>
            </Card>
          </>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <Card className="lg:col-span-3 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-xl font-bold">Notification Preferences</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Content Notifications</h3>
                {['New post submissions', 'Post approvals', 'Post rejections', 'Comment moderation needed'].map((item) => (
                  <div key={item} className="flex items-center justify-between py-2 border-b last:border-0">
                    <span className="text-sm">{item}</span>
                    <input type="checkbox" defaultChecked className="rounded border text-primary" aria-label={item} />
                  </div>
                ))}
              </div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">System Notifications</h3>
                {['Weekly summary email', 'Storage warnings', 'Security alerts', 'System updates'].map((item) => (
                  <div key={item} className="flex items-center justify-between py-2 border-b last:border-0">
                    <span className="text-sm">{item}</span>
                    <input type="checkbox" defaultChecked className="rounded border text-primary" aria-label={item} />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Workflow Tab */}
        {activeTab === 'workflow' && (
          <Card className="lg:col-span-3 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Workflow className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-xl font-bold">Workflow Settings</h2>
            </div>
            <p className="text-muted-foreground mb-4">Configure approval workflows and editorial processes</p>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="approval-process" className="block text-sm font-semibold mb-2">
                  Approval Process
                </label>
                <select id="approval-process" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background">
                  <option>Single Approval (Editor)</option>
                  <option>Dual Approval (Editor + Admin)</option>
                  <option>Auto-publish (Trusted Authors)</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="text-sm font-medium">Require category for posts</p>
                  <p className="text-xs text-muted-foreground">Posts must have a category assigned</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded border text-primary" aria-label="Require category for posts" />
              </div>
              
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="text-sm font-medium">Auto-publish scheduled posts</p>
                  <p className="text-xs text-muted-foreground">Automatically publish posts at scheduled time</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded border text-primary" aria-label="Auto-publish scheduled posts" />
              </div>
            </div>
          </Card>
        )}

        {/* Guidelines Tab */}
        {activeTab === 'guidelines' && (
          <Card className="lg:col-span-3 p-6">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-xl font-bold">Editorial Guidelines</h2>
            </div>
            <textarea
              className="w-full h-64 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
              placeholder="Enter your editorial guidelines here..."
              defaultValue="1. All posts must be original content\n2. Proper citations required for references\n3. Minimum word count: 500 words\n4. Images must have alt text\n5. Follow AP style guidelines"
            />
          </Card>
        )}
      </div>
    </div>
  )
}
