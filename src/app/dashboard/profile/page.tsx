'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard-layout'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { User, Mail, Calendar } from 'lucide-react'

interface UserProfile {
  id: string
  email?: string
  user_metadata?: {
    first_name?: string
    last_name?: string
    nickname?: string
  }
  created_at?: string
}

interface ProfileData {
  id: string
  first_name?: string
  last_name?: string
  nickname?: string
  email?: string
}

export default function Profile() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        setEmail(user.email || '')
        
        // Fetch profile data from profiles table
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, nickname, email')
          .eq('id', user.id)
          .single()
        
        if (profile) {
          setProfileData(profile)
          setFirstName(profile.first_name || '')
          setLastName(profile.last_name || '')
          setNickname(profile.nickname || '')
        } else {
          // Fallback to auth metadata if no profile found
          setFirstName(user.user_metadata?.first_name || '')
          setLastName(user.user_metadata?.last_name || '')
          setNickname(user.user_metadata?.nickname || '')
        }
      }
    }

    getUser()
  }, [supabase])

  const parseFullName = (name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return { firstName: '', lastName: '' }
    
    const parts = trimmed.split(/\s+/)
    if (parts.length === 1) {
      return { firstName: parts[0], lastName: '' }
    }
    
    const firstName = parts[0]
    const lastName = parts.slice(1).join(' ')
    return { firstName, lastName }
  }

  const handleFirstNameChange = (value: string) => {
    setFirstName(value)
    
    // Parse if contains spaces
    if (value.includes(' ') && value.trim().split(/\s+/).length > 1) {
      const { firstName, lastName } = parseFullName(value)
      setFirstName(firstName)
      setLastName(lastName)
      
      // Focus nickname field after parsing
      setTimeout(() => {
        const nicknameField = document.getElementById('nickname')
        nicknameField?.focus()
      }, 0)
    }
  }

  const handleLastNameChange = (value: string) => {
    setLastName(value)
    
    // Parse if contains spaces and first name is empty
    if (value.includes(' ') && value.trim().split(/\s+/).length > 1 && !firstName.trim()) {
      const { firstName, lastName } = parseFullName(value)
      setFirstName(firstName)
      setLastName(lastName)
      
      // Focus nickname field after parsing
      setTimeout(() => {
        const nicknameField = document.getElementById('nickname')
        nicknameField?.focus()
      }, 0)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      if (!user) {
        setError('User not found')
        return
      }

      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: firstName.trim() || null,
          last_name: lastName.trim() || null,
          nickname: nickname.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (profileError) {
        setError(profileError.message)
        return
      }

      // Update auth metadata for consistency
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          first_name: firstName.trim() || null,
          last_name: lastName.trim() || null,
          nickname: nickname.trim() || null,
        }
      })

      if (authError) {
        console.warn('Auth metadata update failed:', authError.message)
        // Don't fail the whole operation for this
      }

      setMessage('Profile updated successfully!')
      
      // Refresh user data
      const { data: { user: updatedUser } } = await supabase.auth.getUser()
      if (updatedUser) {
        setUser(updatedUser)
      }

    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const userInitials = firstName?.[0] + lastName?.[0] || email?.[0]?.toUpperCase() || 'U'

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600">Manage your personal information and account settings</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details and contact information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First name</Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => handleFirstNameChange(e.target.value)}
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => handleLastNameChange(e.target.value)}
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nickname">Nickname (Optional)</Label>
                  <Input
                    id="nickname"
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Enter your nickname"
                  />
                  <p className="text-xs text-gray-500">
                    If set, your nickname will be displayed instead of your full name.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500">
                    Email address cannot be changed. Contact support if you need to update it.
                  </p>
                </div>
                {error && (
                  <div className="text-sm text-red-600">{error}</div>
                )}
                {message && (
                  <div className="text-sm text-green-600">{message}</div>
                )}
                <Button type="submit" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Profile'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
                <CardDescription>Your profile avatar</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarImage src="" alt="" />
                  <AvatarFallback className="text-xl">{userInitials}</AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm">
                  Change Picture
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  JPG, PNG or GIF (max. 800x800px)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">User ID</p>
                    <p className="text-xs text-gray-500">{user?.id}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Member since</p>
                    <p className="text-xs text-gray-500">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}