'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOutUser } from '@/lib/supabase/client-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Bell, 
  Mail, 
  Clock, 
  Calendar, 
  Shield, 
  User, 
  Key, 
  Smartphone, 
  Lock, 
  Unlock, 
  RefreshCw, 
  Copy, 
  Trash2,
  Settings as SettingsIcon,
  Eye,
  EyeOff,
  Download,
  Save
} from 'lucide-react'
import { toast } from 'sonner'

interface NotificationSettings {
  emailEnabled: boolean
  emailAddress: string
  newHighScoreTenders: boolean
  highScoreThreshold: number
  applicationUpdates: boolean
  deadlineReminders: boolean
  dailyDigest: boolean
  dailyDigestTime: string
  weeklySummary: boolean
  weeklySummaryDay: string
  weeklySummaryTime: string
}

interface AccountSettings {
  currentPassword: string
  newPassword: string
  confirmPassword: string
  newEmail: string
  confirmNewEmail: string
  twoFactorEnabled: boolean
}


export default function SettingsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'notifications' | 'account'>('notifications')
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailEnabled: true,
    emailAddress: 'user@example.com',
    newHighScoreTenders: true,
    highScoreThreshold: 75,
    applicationUpdates: true,
    deadlineReminders: true,
    dailyDigest: true,
    dailyDigestTime: '09:00',
    weeklySummary: true,
    weeklySummaryDay: 'Monday',
    weeklySummaryTime: '10:00'
  })

  const [accountSettings, setAccountSettings] = useState<AccountSettings>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    newEmail: '',
    confirmNewEmail: '',
    twoFactorEnabled: false
  })


  const [isSaving, setIsSaving] = useState(false)

  const handleSaveNotificationSettings = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      toast.success('Notification settings saved')
    }, 1000)
  }

  const handleSaveAccountSettings = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      toast.success('Account settings saved')
    }, 1000)
  }


  const handleSignOut = async () => {
    const result = await signOutUser()
    if (result.success) {
      router.push('/signin')
    }
  }

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      toast.success('Account deletion requested')
      // In a real implementation, this would call an API
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 md:pt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground mt-1">Manage your account and application preferences</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'notifications' | 'account')} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notifications">Notification Settings</TabsTrigger>
          <TabsTrigger value="account">Account Settings</TabsTrigger>
        </TabsList>

        {/* Tab 1: Notification Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <Switch
                    id="emailNotifications"
                    checked={notificationSettings.emailEnabled}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, emailEnabled: checked }))}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="emailAddress">Email Address</Label>
                  <Input
                    id="emailAddress"
                    type="email"
                    value={notificationSettings.emailAddress}
                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, emailAddress: e.target.value }))}
                    placeholder="user@example.com"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label htmlFor="highScoreThreshold">High-Score Tender Threshold</Label>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-muted-foreground w-16">70</span>
                  <Slider
                    id="highScoreThreshold"
                    min={70}
                    max={100}
                    step={5}
                    value={[notificationSettings.highScoreThreshold]}
                    onValueChange={(value) => setNotificationSettings(prev => ({ ...prev, highScoreThreshold: value[0] }))}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground w-16">100</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="newHighScoreTenders"
                    checked={notificationSettings.newHighScoreTenders}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, newHighScoreTenders: checked }))}
                  />
                  <Label htmlFor="newHighScoreTenders" className="text-sm">New high-score tenders</Label>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium mb-2">Notification Types</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="applicationUpdates"
                      checked={notificationSettings.applicationUpdates}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, applicationUpdates: checked }))}
                    />
                    <Label htmlFor="applicationUpdates">Application updates</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="deadlineReminders"
                      checked={notificationSettings.deadlineReminders}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, deadlineReminders: checked }))}
                    />
                    <Label htmlFor="deadlineReminders">Deadline reminders</Label>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <Button onClick={handleSaveNotificationSettings} disabled={isSaving} className="w-full max-w-md">
                  {isSaving ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Settings
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Account Settings */}
        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium mb-2">Change Password</h4>
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={accountSettings.currentPassword}
                      onChange={(e) => setAccountSettings(prev => ({ ...prev, currentPassword: e.target.value }))}
                      placeholder="â¢â¢â¢â¢â¢"
                    />
                  </div>
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={accountSettings.newPassword}
                      onChange={(e) => setAccountSettings(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="â¢â¢â¢â¢â¢"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={accountSettings.confirmPassword}
                      onChange={(e) => setAccountSettings(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="â¢â¢â¢â¢â¢"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium mb-2">Change Email</h4>
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="newEmail">New Email Address</Label>
                    <Input
                      id="newEmail"
                      type="email"
                      value={accountSettings.newEmail}
                      onChange={(e) => setAccountSettings(prev => ({ ...prev, newEmail: e.target.value }))}
                      placeholder="new@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmEmail">Confirm New Email</Label>
                    <Input
                      id="confirmEmail"
                      type="email"
                      value={accountSettings.confirmNewEmail}
                      onChange={(e) => setAccountSettings(prev => ({ ...prev, confirmNewEmail: e.target.value }))}
                      placeholder="new@example.com"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium mb-2">Two-Factor Authentication</h4>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="twoFactorEnabled"
                    checked={accountSettings.twoFactorEnabled}
                    onCheckedChange={(checked) => setAccountSettings(prev => ({ ...prev, twoFactorEnabled: checked }))}
                  />
                  <Label htmlFor="twoFactorEnabled">Enable 2FA</Label>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium mb-2">Sign Out</h4>
                <Button 
                  variant="outline" 
                  onClick={handleSignOut}
                  className="w-full max-w-md"
                >
                  <Unlock className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium mb-2">Delete Account</h4>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteAccount}
                  className="w-full max-w-md"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </Button>
              </div>

              <div className="flex justify-center">
                <Button onClick={handleSaveAccountSettings} disabled={isSaving} className="w-full max-w-md">
                  {isSaving ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Settings
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        </Tabs>
    </div>
  )
}
