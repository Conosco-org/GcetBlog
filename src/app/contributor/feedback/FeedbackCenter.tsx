'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { 
  AlertCircle, 
  HelpCircle, 
  Star, 
  MessageSquare, 
  Clock,
  CheckCircle,
  Send,
  Eye
} from 'lucide-react'
import { formatDateTime } from '@/utilities/formatDateTime'
import type { User, Feedback, Post } from '@/payload-types'

interface FeedbackStats {
  critical: number
  suggestions: number
  praise: number
  questions: number
}

interface FeedbackCenterProps {
  feedback: Feedback[]
  stats: FeedbackStats
  user: User
}

export default function FeedbackCenter({ feedback, stats, user }: FeedbackCenterProps) {
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread' | string>('all')
  const { toast } = useToast()

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'suggestions': return <HelpCircle className="w-4 h-4 text-blue-500" />
      case 'praise': return <Star className="w-4 h-4 text-yellow-500" />
      case 'questions': return <MessageSquare className="w-4 h-4 text-purple-500" />
      default: return <MessageSquare className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'suggestions': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'praise': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'questions': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const handleSendMessage = async () => {
    if (!selectedFeedback || !newMessage.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/feedback/${selectedFeedback.id}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      toast({
        title: 'Success',
        description: 'Message sent successfully',
      })

      setNewMessage('')
      // Refresh the page to show the new message
      window.location.reload()
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredFeedback = feedback.filter((item) => {
    if (filter === 'all') return true
    if (filter === 'unread') return item.status === 'active'
    return item.type === filter
  })

  return (
    <div className="p-8 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Feedback Center</h1>
        <p className="text-muted-foreground">Communicate with editors and track feedback on your submissions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-red-600 text-sm font-medium mb-1">Critical Issues</p>
                <p className="text-4xl font-bold text-red-700">{stats.critical}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-blue-600 text-sm font-medium mb-1">Suggestions</p>
                <p className="text-4xl font-bold text-blue-700">{stats.suggestions}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <HelpCircle className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-yellow-600 text-sm font-medium mb-1">Praise</p>
                <p className="text-4xl font-bold text-yellow-700">{stats.praise}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50/50">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-purple-600 text-sm font-medium mb-1">Questions</p>
                <p className="text-4xl font-bold text-purple-700">{stats.questions}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Conversations
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant={filter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant={filter === 'unread' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('unread')}
                  >
                    Unread
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto">
                {filteredFeedback.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No conversations yet</p>
                  </div>
                ) : (
                  filteredFeedback.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedFeedback?.id === item.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      }`}
                      onClick={() => setSelectedFeedback(item)}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs">
                            {typeof item.editor === 'object' && item.editor?.name ? item.editor.name.charAt(0) : 'E'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium truncate">{item.title}</p>
                            <Badge className={`text-xs ${getTypeColor(item.type)}`}>
                              {item.type}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Conversation with {typeof item.editor === 'object' && item.editor?.name ? item.editor.name : 'Editor'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDateTime(item.updatedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conversation Detail */}
        <div className="lg:col-span-2">
          {selectedFeedback ? (
            <Card className="h-fit">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 mb-2">
                      {getTypeIcon(selectedFeedback.type)}
                      {selectedFeedback.title}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Post: {selectedFeedback.title}</span>
                      <span>•</span>
                      <span>With Editor</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-auto"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Article
                      </Button>
                    </div>
                  </div>
                  <Badge className={getTypeColor(selectedFeedback.type)}>
                    {selectedFeedback.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {/* Messages */}
                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                  {selectedFeedback.messages?.map((message: any, index: number) => (
                    <div key={index} className="flex gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs">
                          {typeof message.sender === 'object' && message.sender?.name ? message.sender.name.charAt(0) : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium">
                            {typeof message.sender === 'object' && message.sender?.name ? message.sender.name : 'User'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {message.timestamp ? formatDateTime(message.timestamp) : ''}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>
                      </div>
                    </div>
                  )) || (
                    <p className="text-muted-foreground text-center py-4">No messages yet</p>
                  )}
                </div>

                {/* Reply Form */}
                <Separator className="my-4" />
                <div className="space-y-3">
                  <Textarea
                    placeholder="Type your reply..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="min-h-[80px]"
                    disabled={isLoading}
                  />
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleSendMessage}
                      disabled={isLoading || !newMessage.trim()}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send Reply
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-96 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Select a Conversation</h3>
                <p>Choose a conversation from the left to view and respond to feedback</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}