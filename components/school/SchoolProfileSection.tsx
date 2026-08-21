import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { School, MapPin, Phone, Mail, Globe, Award, Edit, Save, X } from 'lucide-react'
import { SchoolProfile } from './hooks/useSchoolManagement'

interface SchoolProfileSectionProps {
  profile: SchoolProfile | null
  loading: boolean
  onUpdate: (data: Partial<SchoolProfile>) => Promise<void>
}

export const SchoolProfileSection: React.FC<SchoolProfileSectionProps> = ({
  profile,
  loading,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    schoolName: profile?.schoolName || '',
    schoolCode: profile?.schoolCode || '',
    address: profile?.address || '',
    city: profile?.city || '',
    state: profile?.state || '',
    pincode: profile?.pincode || '',
    phone: profile?.phone || '',
    email: profile?.email || '',
    website: profile?.website || '',
    principalName: profile?.principalName || '',
    principalEmail: profile?.principalEmail || '',
    principalPhone: profile?.principalPhone || '',
    motto: profile?.motto || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onUpdate(formData)
    setIsEditing(false)
  }

  if (loading && !profile) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <School className="mx-auto h-8 w-8 animate-pulse text-muted-foreground mb-2" />
          <p className="text-muted-foreground">Loading institutional profile...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{profile?.schoolName || 'School Profile'}</CardTitle>
            <CardDescription>
              Code: <span className="font-mono">{profile?.schoolCode || 'SCH-001'}</span> • Affiliation: {profile?.board || 'State Board'}
            </CardDescription>
          </div>
          <Button
            variant={isEditing ? 'outline' : 'default'}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? <X className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </Button>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="schoolName">Institution Name</Label>
                  <Input
                    id="schoolName"
                    value={formData.schoolName}
                    onChange={(e) => setFormData(prev => ({ ...prev, schoolName: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="schoolCode">Institution Code</Label>
                  <Input
                    id="schoolCode"
                    value={formData.schoolCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, schoolCode: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Official Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Official Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="principalName">Principal / Dean Name</Label>
                  <Input
                    id="principalName"
                    value={formData.principalName}
                    onChange={(e) => setFormData(prev => ({ ...prev, principalName: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website URL</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Campus Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold">Campus Address</p>
                    <p className="text-sm text-muted-foreground">
                      {profile?.address || '123 Academic Avenue'}, {profile?.city || 'Education City'}, {profile?.state || 'State'} - {profile?.pincode || '100001'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold">Contact Numbers</p>
                    <p className="text-sm text-muted-foreground">{profile?.phone || '+91 98765 43210'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold">Email & Inquiries</p>
                    <p className="text-sm text-muted-foreground">{profile?.email || 'admin@school.edu'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Award className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold">Head of Institution</p>
                    <p className="text-sm text-muted-foreground">{profile?.principalName || 'Dr. Principal Name'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold">Website</p>
                    <p className="text-sm text-muted-foreground">{profile?.website || 'https://school.edu'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
