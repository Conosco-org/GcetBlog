'use client'

import { Settings as SettingsIcon, Bell, Workflow, FileText, Save, Download, Upload } from 'lucide-react'
import { useState } from 'react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Workspace Settings</h1>
            <p className="text-gray-600">Configure your editorial workspace and preferences</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Settings
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Import Settings
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('general')}
              className={`px-6 py-4 text-sm font-medium flex items-center gap-2 border-b-2 transition ${
                activeTab === 'general'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-600 border-transparent hover:text-gray-900'
              }`}
            >
              <SettingsIcon className="w-4 h-4" />
              General
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-6 py-4 text-sm font-medium flex items-center gap-2 border-b-2 transition ${
                activeTab === 'notifications'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-600 border-transparent hover:text-gray-900'
              }`}
            >
              <Bell className="w-4 h-4" />
              Notifications
            </button>
            <button
              onClick={() => setActiveTab('workflow')}
              className={`px-6 py-4 text-sm font-medium flex items-center gap-2 border-b-2 transition ${
                activeTab === 'workflow'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-600 border-transparent hover:text-gray-900'
              }`}
            >
              <Workflow className="w-4 h-4" />
              Workflow
            </button>
            <button
              onClick={() => setActiveTab('guidelines')}
              className={`px-6 py-4 text-sm font-medium flex items-center gap-2 border-b-2 transition ${
                activeTab === 'guidelines'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-600 border-transparent hover:text-gray-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              Guidelines
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* General Preferences */}
        {activeTab === 'general' && (
          <>
            <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <SettingsIcon className="w-5 h-5 text-gray-600" />
                <h2 className="text-xl font-bold text-gray-900">General Preferences</h2>
              </div>

              <div className="space-y-6">
                {/* Default Post Status */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Default Post Status
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
                    <option>Draft</option>
                    <option>Pending Review</option>
                    <option>Published</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Default status for new posts</p>
                </div>

                {/* Auto-save Interval */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                    />
                    <span className="text-sm text-gray-600">10s</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>10s</span>
                    <span>30s</span>
                    <span>300s</span>
                  </div>
                </div>

                {/* Media Upload Limit */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Media Upload Limit (MB)
                  </label>
                  <input
                    type="number"
                    defaultValue="50"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Maximum file size for media uploads</p>
                </div>

                {/* Editor Theme */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Editor Theme
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="theme"
                        value="light"
                        defaultChecked
                        className="text-blue-600"
                      />
                      <span className="text-sm text-gray-700">Light Theme</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="theme"
                        value="dark"
                        className="text-blue-600"
                      />
                      <span className="text-sm text-gray-700">Dark Theme</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="theme"
                        value="auto"
                        className="text-blue-600"
                      />
                      <span className="text-sm text-gray-700">Auto (System)</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Interface Customization */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Interface Customization</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Compact View</p>
                    <p className="text-xs text-gray-500">Use condensed interface layout</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Show Line Numbers</p>
                    <p className="text-xs text-gray-500">Display line numbers in editor</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Syntax Highlighting</p>
                    <p className="text-xs text-gray-500">Enable code syntax highlighting</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Auto-complete</p>
                    <p className="text-xs text-gray-500">Enable text auto-completion</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Editor View
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm">
                    <option>Visual Editor</option>
                    <option>Code Editor</option>
                    <option>Split View</option>
                  </select>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="lg:col-span-3 bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-5 h-5 text-gray-600" />
              <h2 className="text-xl font-bold text-gray-900">Notification Preferences</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700">Content Notifications</h3>
                {['New post submissions', 'Post approvals', 'Post rejections', 'Comment moderation needed'].map((item) => (
                  <div key={item} className="flex items-center justify-between py-2 border-b last:border-0">
                    <span className="text-sm text-gray-700">{item}</span>
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600" />
                  </div>
                ))}
              </div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700">System Notifications</h3>
                {['Weekly summary email', 'Storage warnings', 'Security alerts', 'System updates'].map((item) => (
                  <div key={item} className="flex items-center justify-between py-2 border-b last:border-0">
                    <span className="text-sm text-gray-700">{item}</span>
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Workflow Tab */}
        {activeTab === 'workflow' && (
          <div className="lg:col-span-3 bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Workflow className="w-5 h-5 text-gray-600" />
              <h2 className="text-xl font-bold text-gray-900">Workflow Settings</h2>
            </div>
            <p className="text-gray-600 mb-4">Configure approval workflows and editorial processes</p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Approval Process
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
                  <option>Single Approval (Editor)</option>
                  <option>Dual Approval (Editor + Admin)</option>
                  <option>Auto-publish (Trusted Authors)</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="text-sm font-medium text-gray-700">Require category for posts</p>
                  <p className="text-xs text-gray-500">Posts must have a category assigned</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600" />
              </div>
              
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="text-sm font-medium text-gray-700">Auto-publish scheduled posts</p>
                  <p className="text-xs text-gray-500">Automatically publish posts at scheduled time</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600" />
              </div>
            </div>
          </div>
        )}

        {/* Guidelines Tab */}
        {activeTab === 'guidelines' && (
          <div className="lg:col-span-3 bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-5 h-5 text-gray-600" />
              <h2 className="text-xl font-bold text-gray-900">Editorial Guidelines</h2>
            </div>
            <textarea
              className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your editorial guidelines here..."
              defaultValue="1. All posts must be original content\n2. Proper citations required for references\n3. Minimum word count: 500 words\n4. Images must have alt text\n5. Follow AP style guidelines"
            />
          </div>
        )}
      </div>
    </div>
  )
}
