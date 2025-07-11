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
  History,
  Search,
  Mail,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  MoreHorizontal,
  Eye,
  ChevronLeft,
  ChevronRight,
  Send,
  User,
  TrendingUp,
  Timer,
} from 'lucide-react'

interface EmailCampaign {
  id: string
  subject: string
  body: string
  total_recipients: number
  successful_count: number
  failed_count: number
  delay_between_emails: number
  status: 'pending' | 'sending' | 'completed' | 'failed'
  started_at: string
  completed_at: string
  created_at: string
  sender_first_name: string
  sender_last_name: string
  sender_email: string
  success_rate: number
  duration_seconds: number
}

interface CampaignRecipient {
  id: string
  recipient_email: string
  recipient_name: string
  status: 'pending' | 'sent' | 'failed'
  error_message: string
  sent_at: string
  created_at: string
}

interface CampaignDetails {
  campaign: EmailCampaign
  recipients: CampaignRecipient[]
  statusCounts: {
    pending: number
    sent: number
    failed: number
  }
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default function EmailHistoryPage() {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null)
  const [campaignDetails, setCampaignDetails] = useState<CampaignDetails | null>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)

  useEffect(() => {
    fetchCampaigns()
  }, [page])

  const fetchCampaigns = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/admin/email-history?page=${page}&limit=20`)
      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Failed to fetch email history')
        return
      }

      setCampaigns(result.campaigns || [])
      setTotalPages(result.pagination.totalPages || 1)
    } catch (error) {
      console.error('Error fetching campaigns:', error)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const fetchCampaignDetails = async (campaignId: string) => {
    setDetailsLoading(true)
    try {
      const response = await fetch(`/api/admin/email-history/${campaignId}`)
      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Failed to fetch campaign details')
        return
      }

      setCampaignDetails(result)
    } catch (error) {
      console.error('Error fetching campaign details:', error)
      setError('Failed to fetch campaign details')
    } finally {
      setDetailsLoading(false)
    }
  }

  const handleViewDetails = (campaignId: string) => {
    setSelectedCampaignId(campaignId)
    setShowDetailsDialog(true)
    fetchCampaignDetails(campaignId)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (seconds: number) => {
    if (!seconds) return 'N/A'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>
      case 'sending':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Sending</Badge>
      case 'pending':
        return <Badge variant="outline">Pending</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getRecipientStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="default" className="bg-green-100 text-green-800">Sent</Badge>
      case 'pending':
        return <Badge variant="outline">Pending</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.sender_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${campaign.sender_first_name} ${campaign.sender_last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-gray-600">View and manage email campaign history and performance</p>
          </div>
        </div>

        {/* Global Messages */}
        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>
        )}

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Email Campaign History
                </CardTitle>
                <CardDescription>
                  Track all email campaigns sent through the messenger system
                </CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-[250px]"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="text-gray-500">Loading email history...</div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Campaigns Table */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Sender</TableHead>
                      <TableHead>Recipients</TableHead>
                      <TableHead>Success Rate</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCampaigns.map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{campaign.subject}</div>
                            <div className="text-sm text-gray-500 truncate max-w-[200px]">
                              {campaign.body.substring(0, 60)}...
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {campaign.sender_first_name?.[0] || campaign.sender_email[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-sm font-medium">
                                {campaign.sender_first_name} {campaign.sender_last_name}
                              </div>
                              <div className="text-xs text-gray-500">{campaign.sender_email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm font-medium">{campaign.total_recipients} total</div>
                            <div className="flex items-center space-x-2 text-xs">
                              <span className="text-green-600">{campaign.successful_count} sent</span>
                              {campaign.failed_count > 0 && (
                                <span className="text-red-600">{campaign.failed_count} failed</span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="text-sm font-medium">
                              {campaign.success_rate ? `${campaign.success_rate}%` : 'N/A'}
                            </div>
                            {campaign.success_rate >= 90 ? (
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : campaign.success_rate >= 70 ? (
                              <TrendingUp className="h-4 w-4 text-yellow-600" />
                            ) : (
                              <TrendingUp className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Timer className="h-3 w-3 text-gray-500" />
                            <span className="text-sm">{formatDuration(campaign.duration_seconds)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{formatDate(campaign.created_at)}</div>
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
                              <DropdownMenuItem onClick={() => handleViewDetails(campaign.id)}>
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

                {filteredCampaigns.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    {searchTerm 
                      ? 'No campaigns found matching your search.' 
                      : 'No email campaigns found.'}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4">
                    <div className="text-sm text-gray-500">
                      Page {page} of {totalPages}
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

        {/* Campaign Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Campaign Details
              </DialogTitle>
              <DialogDescription>
                Detailed information about the email campaign and its recipients
              </DialogDescription>
            </DialogHeader>
            
            {detailsLoading ? (
              <div className="flex justify-center py-8">
                <div className="text-gray-500">Loading campaign details...</div>
              </div>
            ) : campaignDetails ? (
              <div className="space-y-6 py-4 overflow-y-auto max-h-[60vh]">
                {/* Campaign Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Campaign Info</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <div className="text-sm font-medium">Subject</div>
                        <div className="text-sm text-gray-600">{campaignDetails.campaign.subject}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Sender</div>
                        <div className="text-sm text-gray-600">
                          {campaignDetails.campaign.sender_first_name} {campaignDetails.campaign.sender_last_name}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Created</div>
                        <div className="text-sm text-gray-600">{formatDate(campaignDetails.campaign.created_at)}</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Statistics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-lg font-bold text-green-600">{campaignDetails.statusCounts.sent}</div>
                          <div className="text-xs text-gray-600">Sent</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-red-600">{campaignDetails.statusCounts.failed}</div>
                          <div className="text-xs text-gray-600">Failed</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-blue-600">{campaignDetails.statusCounts.pending}</div>
                          <div className="text-xs text-gray-600">Pending</div>
                        </div>
                      </div>
                      <div className="text-center pt-2">
                        <div className="text-sm font-medium">Success Rate: {campaignDetails.campaign.success_rate || 0}%</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recipients Table */}
                <div>
                  <div className="text-lg font-medium mb-3">Recipients ({campaignDetails.recipients.length})</div>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Sent At</TableHead>
                          <TableHead>Error</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {campaignDetails.recipients.map((recipient) => (
                          <TableRow key={recipient.id}>
                            <TableCell className="font-mono text-sm">{recipient.recipient_email}</TableCell>
                            <TableCell>{recipient.recipient_name || 'N/A'}</TableCell>
                            <TableCell>{getRecipientStatusBadge(recipient.status)}</TableCell>
                            <TableCell className="text-sm">{formatDate(recipient.sent_at)}</TableCell>
                            <TableCell className="text-sm text-red-600 max-w-[200px] truncate">
                              {recipient.error_message || '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            ) : null}

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