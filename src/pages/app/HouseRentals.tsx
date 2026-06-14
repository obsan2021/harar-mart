import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import type { HouseRental } from '@/integrations/supabase/types'
import { useAuth } from '@/contexts/AuthContext'
import { ImageUpload } from '@/components/ImageUpload'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Home,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Bed,
  Bath,
  Search,
  Filter,
  X,
  Image as ImageIcon,
} from 'lucide-react'
import { HouseRentalsSkeleton } from '@/components/app/AppSkeletons'

const AMENITIES_LIST = [
  'WiFi',
  'Parking',
  'Furnished',
  'Air Conditioning',
  'Heating',
  'Washer/Dryer',
  'Dishwasher',
  'Gym',
  'Pool',
  'Pet Friendly',
  'Balcony',
  'Elevator',
]

const DEFAULT_IMAGE = '/placeholder.svg'

export default function HouseRentals() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [rentals, setRentals] = useState<HouseRental[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRental, setEditingRental] = useState<HouseRental | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [listingType, setListingType] = useState<string | null>(null)
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(50000)
  const [bedrooms, setBedrooms] = useState<string>('any')
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    bedrooms: '1',
    bathrooms: '1',
    square_feet: '',
    location: '',
    address: '',
    images: [] as string[],
    amenities: [] as string[],
    contact_name: '',
    contact_phone: '',
    contact_type: 'owner' as 'owner' | 'broker' | 'agent',
    listing_type: 'rent' as 'rent' | 'sale',
  })

  useEffect(() => {
    fetchRentals()
  }, [])

  async function fetchRentals() {
    const { data, error } = await supabase
      .from('house_rentals')
      .select('*, user:users(*)')
      .order('created_at', { ascending: false })

    if (data && !error) {
      setRentals(data)
    }
    setLoading(false)
  }

  // Filtered rentals
  const filteredRentals = rentals.filter((rental) => {
    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      if (
        !rental.title.toLowerCase().includes(q) &&
        !rental.location.toLowerCase().includes(q) &&
        !rental.description.toLowerCase().includes(q)
      ) {
        return false
      }
    }

    // Listing type
    if (listingType && rental.listing_type !== listingType) return false

    // Price range
    if (rental.price < minPrice || rental.price > maxPrice) return false

    // Bedrooms
    if (bedrooms !== 'any') {
      const bedCount = parseInt(bedrooms)
      if (bedrooms === '4') {
        if (rental.bedrooms < 4) return false
      } else {
        if (rental.bedrooms !== bedCount) return false
      }
    }

    // Amenities
    if (selectedAmenities.length > 0) {
      const hasAll = selectedAmenities.every((a) => rental.amenities.includes(a))
      if (!hasAll) return false
    }

    return true
  })

  function resetForm() {
    setEditingRental(null)
    setFormData({
      title: '',
      description: '',
      price: '',
      bedrooms: '1',
      bathrooms: '1',
      square_feet: '',
      location: '',
      address: '',
      images: [],
      amenities: [],
      contact_name: '',
      contact_phone: '',
      contact_type: 'owner',
      listing_type: 'rent',
    })
  }

  function handleEdit(rental: HouseRental) {
    setEditingRental(rental)
    setFormData({
      title: rental.title,
      description: rental.description,
      price: rental.price.toString(),
      bedrooms: rental.bedrooms.toString(),
      bathrooms: rental.bathrooms.toString(),
      square_feet: rental.square_feet?.toString() || '',
      location: rental.location,
      address: rental.address || '',
      images: rental.images,
      amenities: rental.amenities,
      contact_name: rental.contact_name || '',
      contact_phone: rental.contact_phone || '',
      contact_type: rental.contact_type || 'owner',
      listing_type: rental.listing_type || 'rent',
    })
    setIsDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) {
      alert('Please sign in to add a rental listing')
      return
    }

    const payload = {
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price),
      bedrooms: parseInt(formData.bedrooms),
      bathrooms: parseInt(formData.bathrooms),
      square_feet: formData.square_feet ? parseInt(formData.square_feet) : null,
      location: formData.location,
      address: formData.address || null,
      images: formData.images,
      amenities: formData.amenities,
      contact_name: formData.contact_name || null,
      contact_phone: formData.contact_phone || null,
      contact_type: formData.contact_type,
      listing_type: formData.listing_type,
    }

    if (editingRental) {
      const { error } = await supabase
        .from('house_rentals')
        .update(payload)
        .eq('id', editingRental.id)
      if (error) {
        alert('Failed to update listing: ' + error.message)
      } else {
        setIsDialogOpen(false)
        fetchRentals()
      }
    } else {
      const { error } = await supabase.from('house_rentals').insert({
        ...payload,
        user_id: user.id,
      })
      if (error) {
        alert('Failed to create listing: ' + error.message)
      } else {
        setIsDialogOpen(false)
        fetchRentals()
      }
    }
    resetForm()
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this listing?')) return
    const { error } = await supabase.from('house_rentals').delete().eq('id', id)
    if (error) {
      alert('Failed to delete listing')
    } else {
      fetchRentals()
    }
  }

  function handleImageUpload(url: string) {
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, url],
    }))
  }

  function removeImage(index: number) {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  function toggleAmenity(amenity: string) {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }))
  }

  function toggleFilterAmenity(amenity: string) {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    )
  }

  if (loading) {
    return <HouseRentalsSkeleton />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-background py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">House Rentals</h1>
              <p className="text-muted-foreground text-lg">
                Find your perfect home or list your property
              </p>
            </div>
            {user && (
              <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open)
                if (!open) resetForm()
              }}>
                <DialogTrigger asChild>
                  <Button size="lg" onClick={() => resetForm()}>
                    <Plus className="h-5 w-5 mr-2" />
                    Add Listing
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingRental ? 'Edit Listing' : 'Add New Listing'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Listing Type */}
                    <div className="space-y-2">
                      <Label>Listing Type *</Label>
                      <Select
                        value={formData.listing_type}
                        onValueChange={(v) => setFormData({ ...formData, listing_type: v as 'rent' | 'sale' })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rent">For Rent</SelectItem>
                          <SelectItem value="sale">For Sale</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g., Modern 2BR Apartment in Bole"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe the property, neighborhood, nearby amenities..."
                        rows={5}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price">
                          {formData.listing_type === 'sale' ? 'Sale Price (ETB) *' : 'Monthly Rent (ETB) *'}
                        </Label>
                        <Input
                          id="price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="squareFeet">Square Feet</Label>
                        <Input
                          id="squareFeet"
                          type="number"
                          min="0"
                          value={formData.square_feet}
                          onChange={(e) => setFormData({ ...formData, square_feet: e.target.value })}
                          placeholder="Optional"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bedrooms">Bedrooms *</Label>
                        <Select
                          value={formData.bedrooms}
                          onValueChange={(v) => setFormData({ ...formData, bedrooms: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5].map((n) => (
                              <SelectItem key={n} value={n.toString()}>
                                {n} {n === 1 ? 'Bedroom' : 'Bedrooms'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bathrooms">Bathrooms *</Label>
                        <Select
                          value={formData.bathrooms}
                          onValueChange={(v) => setFormData({ ...formData, bathrooms: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4].map((n) => (
                              <SelectItem key={n} value={n.toString()}>
                                {n} {n === 1 ? 'Bathroom' : 'Bathrooms'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="location">Location *</Label>
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          placeholder="e.g., Bole, Addis Ababa"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          placeholder="Optional"
                        />
                      </div>
                    </div>

                    {/* Images */}
                    <div className="space-y-2">
                      <Label>Images</Label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.images.map((url, i) => (
                          <div key={i} className="relative group">
                            <img
                              src={url}
                              alt={`Image ${i + 1}`}
                              className="w-24 h-24 object-cover rounded-lg border"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = DEFAULT_IMAGE
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(i)}
                              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <ImageUpload bucket="house-images" onUpload={handleImageUpload} />
                      <p className="text-xs text-muted-foreground">
                        Upload images or paste URLs below
                      </p>
                      <Textarea
                        value={formData.images.join('\n')}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            images: e.target.value.split('\n').filter(Boolean),
                          })
                        }
                        rows={2}
                        placeholder="Or paste image URLs (one per line)"
                      />
                    </div>

                    {/* Amenities */}
                    <div className="space-y-2">
                      <Label>Amenities</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {AMENITIES_LIST.map((amenity) => (
                          <label
                            key={amenity}
                            className="flex items-center gap-2 text-sm cursor-pointer"
                          >
                            <Checkbox
                              checked={formData.amenities.includes(amenity)}
                              onCheckedChange={() => toggleAmenity(amenity)}
                            />
                            {amenity}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Contact Information</Label>
                      <div className="space-y-2">
                        <Label>Contact Type</Label>
                        <Select
                          value={formData.contact_type}
                          onValueChange={(v) => setFormData({ ...formData, contact_type: v as 'owner' | 'broker' | 'agent' })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="owner">Owner</SelectItem>
                            <SelectItem value="broker">Broker</SelectItem>
                            <SelectItem value="agent">Agent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact_name">Contact Name</Label>
                        <Input
                          id="contact_name"
                          value={formData.contact_name}
                          onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                          placeholder="Name shown to interested buyers"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact_phone">Contact Phone</Label>
                        <Input
                          id="contact_phone"
                          value={formData.contact_phone}
                          onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                          placeholder="+251 9XX XXX XXX"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsDialogOpen(false)
                          resetForm()
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingRental ? 'Update' : 'Create'} Listing
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="search"
                placeholder="Search by title, location, or description..."
                className="pl-10 h-12"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content: Sidebar + Grid */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className={`md:w-64 ${showFilters ? 'block' : 'hidden md:block'}`}>
            <div className="space-y-6 sticky top-4">
              {/* Listing Type */}
              <div>
                <h3 className="font-semibold mb-3">Listing Type</h3>
                <div className="space-y-2">
                  {[null, 'rent', 'sale'].map((type) => (
                    <Button
                      key={type ?? 'all'}
                      variant={listingType === type ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => setListingType(type)}
                    >
                      {type === null ? 'All Listings' : type === 'rent' ? 'For Rent' : 'For Sale'}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="font-semibold mb-3">Price Range (ETB)</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Min: {minPrice.toLocaleString()}</span>
                    <span>Max: {maxPrice.toLocaleString()}</span>
                  </div>
                  <Slider
                    value={[minPrice, maxPrice]}
                    onValueChange={(value) => { setMinPrice(value[0]); setMaxPrice(value[1]) }}
                    min={0}
                    max={50000}
                    step={500}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Bedrooms */}
              <div>
                <h3 className="font-semibold mb-3">Bedrooms</h3>
                <div className="space-y-2">
                  {[
                    { value: 'any', label: 'Any' },
                    { value: '1', label: '1 Bedroom' },
                    { value: '2', label: '2 Bedrooms' },
                    { value: '3', label: '3 Bedrooms' },
                    { value: '4', label: '4+ Bedrooms' },
                  ].map(({ value, label }) => (
                    <Button
                      key={value}
                      variant={bedrooms === value ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => setBedrooms(value)}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div>
                <h3 className="font-semibold mb-3">Amenities</h3>
                <div className="space-y-2">
                  {AMENITIES_LIST.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox
                        id={`filter-${amenity}`}
                        checked={selectedAmenities.includes(amenity)}
                        onCheckedChange={() => toggleFilterAmenity(amenity)}
                      />
                      <Label htmlFor={`filter-${amenity}`} className="text-sm cursor-pointer">
                        {amenity}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clear All Filters */}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setListingType(null)
                  setMinPrice(0)
                  setMaxPrice(50000)
                  setBedrooms('any')
                  setSelectedAmenities([])
                }}
              >
                Clear All Filters
              </Button>
            </div>
          </aside>

          {/* Results Grid */}
          <div className="flex-1">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {filteredRentals.length} listings found
              </p>
            </div>

            {filteredRentals.length === 0 ? (
              <div className="text-center py-16">
                <Home className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No listings found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery || listingType || minPrice > 0 || maxPrice < 50000 || bedrooms !== 'any' || selectedAmenities.length > 0
                    ? 'Try adjusting your filters'
                    : 'Be the first to list a property!'}
                </p>
                {user && !searchQuery && !listingType && minPrice === 0 && maxPrice === 50000 && bedrooms === 'any' && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button onClick={() => resetForm()}>
                        <Plus className="h-5 w-5 mr-2" />
                        Add Your First Listing
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Add New Listing</DialogTitle>
                      </DialogHeader>
                      <p className="text-muted-foreground">
                        Use the "Add Listing" button in the header to create your first listing.
                      </p>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRentals.map((rental) => (
                  <Card
                    key={rental.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer"
                    onClick={() => navigate(`/rentals/${rental.id}`)}
                  >
                    {/* Image */}
                    <div className="aspect-video bg-muted relative overflow-hidden">
                      {rental.images && rental.images.length > 0 ? (
                        <img
                          src={rental.images[0]}
                          alt={rental.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = DEFAULT_IMAGE
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <ImageIcon className="h-12 w-12" />
                        </div>
                      )}
                      {rental.images && rental.images.length > 1 && (
                        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                          {rental.images.length} photos
                        </div>
                      )}
                      <Badge className="absolute top-2 left-2" variant="secondary">
                        {rental.listing_type === 'sale'
                          ? `ETB ${rental.price.toLocaleString()}`
                          : `ETB ${rental.price.toLocaleString()}/mo`}
                      </Badge>
                    </div>

                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg line-clamp-1">{rental.title}</h3>
                        {user && user.id === rental.user_id && (
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEdit(rental)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleDelete(rental.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                        <MapPin className="h-4 w-4" />
                        <span>{rental.location}</span>
                      </div>

                      <div className="flex items-center gap-4 text-sm mb-3">
                        <span className="flex items-center gap-1">
                          <Bed className="h-4 w-4" />
                          {rental.bedrooms} bed
                        </span>
                        <span className="flex items-center gap-1">
                          <Bath className="h-4 w-4" />
                          {rental.bathrooms} bath
                        </span>
                        {rental.square_feet && (
                          <span className="text-muted-foreground">
                            {rental.square_feet.toLocaleString()} sqft
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {rental.description}
                      </p>

                      {rental.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {rental.amenities.slice(0, 4).map((amenity) => (
                            <Badge key={amenity} variant="outline" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                          {rental.amenities.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{rental.amenities.length - 4} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
