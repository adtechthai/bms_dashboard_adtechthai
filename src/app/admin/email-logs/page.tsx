'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  MailOpen,
  Search,
  Mail,
  Calendar,
  Filter,
  CheckCircle,
  XCircle,
  User,
  MoreHorizontal,
  Eye,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertTriangle,
  Clock,
} from 'lucide-react'

interface EmailLog {
  id: string
  recipient_email: string
  subject: string
  body: string
  status: 'success' | 'failed'
  error_message?: string
  sent_at: string
  sender?: {
    first_name: string
    last_name: string
    email: string
  }
  campaign?: Array<{
    campaign_id: string
    campaign: {
      id: string
      subject: string
      created_at: string
    }
  }>
}

export default function EmailLogsPage() {
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalEmails, setTotalEmails] = useState(0)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [selectedEmail, setSelectedEmail] = useState<EmailLog | null>(null)

  useEffect(() => {
    fetchEmailLogs()
  }, [page, statusFilter])

  const fetchEmailLogs = async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      })

      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }

      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim())
      }

      const response = await fetch(`/api/admin/email-logs?${params}`)
      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Failed to fetch email logs')
        return
      }

      setEmailLogs(result.emailLogs || [])
      setTotalPages(result.pagination.totalPages || 1)
      setTotalEmails(result.pagination.total || 0)
    } catch (error) {
      console.error('Error fetching email logs:', error)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    fetchEmailLogs()
  }

  const handleViewDetails = (emailLog: EmailLog) => {
    setSelectedEmail(emailLog)
    setShowDetailsDialog(true)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" />
            Success
          </Badge>
        )
      case 'failed':
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Failed
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getSuccessRate = () => {
    if (emailLogs.length === 0) return 0
    const successful = emailLogs.filter(log => log.status === 'success').length
    return Math.round((successful / emailLogs.length) * 100)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-gray-600">Track all individual emails sent to users with detailed status and error information</p>
          </div>
        </div>

        {/* Global Messages */}
        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MailOpen className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">{totalEmails}</div>
                  <div className="text-sm text-gray-600">Total Emails</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {emailLogs.filter(log => log.status === 'success').length}
                  </div>
                  <div className="text-sm text-gray-600">Successful</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {emailLogs.filter(log => log.status === 'failed').length}
                  </div>
                  <div className="text-sm text-gray-600">Failed</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Send className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold text-purple-600">{getSuccessRate()}%</div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MailOpen className="h-5 w-5" />
                  Individual Email Logs
                </CardTitle>
                <CardDescription>
                  Detailed tracking of every email sent to each user
                </CardDescription>
              </div>
              <div className="flex gap-2 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search emails..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10 w-[200px]"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleSearch} size="sm">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="text-gray-500">Loading email logs...</div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Email Logs Table */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Sender</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sent At</TableHead>
                      <TableHead>Error</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {emailLogs.map((emailLog) => (
                      <TableRow key={emailLog.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {emailLog.recipient_email[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{emailLog.recipient_email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px] truncate" title={emailLog.subject}>
                            {emailLog.subject}
                          </div>
                        </TableCell>
                        <TableCell>
                          {emailLog.sender ? (
                            <div className="text-sm">
                              <div className="font-medium">
                                {emailLog.sender.first_name} {emailLog.sender.last_name}
                              </div>
                              <div className="text-gray-500">{emailLog.sender.email}</div>
                            </div>
                          ) : (
                            <span className="text-gray-500">System</span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(emailLog.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3 text-gray-500" />
                            <span className="text-sm">{formatDate(emailLog.sent_at)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {emailLog.error_message ? (
                            <div className="flex items-center space-x-1">
                              <AlertTriangle className="h-3 w-3 text-red-500" />
                              <span className="text-sm text-red-600 truncate max-w-[150px]" title={emailLog.error_message}>
                                {emailLog.error_message}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleViewDetails(emailLog)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {emailLogs.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    {searchTerm || statusFilter !== 'all'
                      ? 'No emails found matching your filters.'
                      : 'No emails found.'}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4">
                    <div className="text-sm text-gray-500">
                      Page {page} of {totalPages} ({totalEmails} total emails)
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page - 1)}
                        disabled={page <= 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page + 1)}
                        disabled={page >= totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Email Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Details
              </DialogTitle>
              <DialogDescription>
                Detailed information about this email
              </DialogDescription>
            </DialogHeader>
            
            {selectedEmail && (
              <div className="space-y-4 py-4 overflow-y-auto max-h-[60vh]">
                {/* Email Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium">Recipient</div>
                    <div className="text-sm text-gray-600">{selectedEmail.recipient_email}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Status</div>
                    <div className="text-sm">{getStatusBadge(selectedEmail.status)}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Sent At</div>
                    <div className="text-sm text-gray-600">{formatDate(selectedEmail.sent_at)}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Sender</div>
                    <div className="text-sm text-gray-600">
                      {selectedEmail.sender
                        ? `${selectedEmail.sender.first_name} ${selectedEmail.sender.last_name} (${selectedEmail.sender.email})`
                        : 'System'}
                    </div>
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <div className="text-sm font-medium">Subject</div>
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {selectedEmail.subject}
                  </div>
                </div>

                {/* Body */}
                <div>
                  <div className="text-sm font-medium">Message Body</div>
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg max-h-40 overflow-y-auto whitespace-pre-wrap">
                    {selectedEmail.body}
                  </div>
                </div>

                {/* Error Message */}
                {selectedEmail.error_message && (
                  <div>
                    <div className="text-sm font-medium text-red-600">Error Message</div>
                    <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                      {selectedEmail.error_message}
                    </div>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}