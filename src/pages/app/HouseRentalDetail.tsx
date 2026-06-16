import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import type { HouseRentalWithRelations, HouseRentalReview } from '@/integrations/supabase/types'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Home,
  MapPin,
  Bed,
  Bath,
  Phone,
  Send,
  Star,
  ChevronLeft,
  Image as ImageIcon,
} from 'lucide-react'

const DEFAULT_IMAGE = '/placeholder.svg'

export default function HouseRentalDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [rental, setRental] = useState<HouseRentalWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [userRating, setUserRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [messageDialogOpen, setMessageDialogOpen] = useState(false)
  const [messageText, setMessageText] = useState('')

  useEffect(() => {
    if (id) fetchRental()
  }, [id])

  async function fetchRental() {
    const { data, error } = await supabase
      .from('house_rentals')
      .select('*, user:users(full_name, phone, email), reviews:house_rental_reviews(*, user:users(full_name))')
      .eq('id', id)
      .single()

    if (data && !error) {
      setRental(data)
    }
    setLoading(false)
  }

  async function handleSubmitReview() {
    if (!user || !rental || userRating === 0 || reviewComment.trim().length < 10) return
    setSubmittingReview(true)

    const { error } = await supabase.from('house_rental_reviews').insert({
      rental_id: rental.id,
      user_id: user.id,
      rating: userRating,
      comment: reviewComment.trim(),
    })

    if (!error) {
      setUserRating(0)
      setReviewComment('')
      fetchRental()
    }
    setSubmittingReview(false)
  }

  async function handleDeleteReview(reviewId: string) {
    if (!confirm('Delete your review?')) return
    const { error } = await supabase.from('house_rental_reviews').delete().eq('id', reviewId)
    if (!error) fetchRental()
  }

  function handleSendMessage() {
    alert('Message sent!')
    setMessageDialogOpen(false)
    setMessageText('')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-10 w-32 mb-6" />
          <Skeleton className="aspect-video w-full rounded-xl mb-4" />
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div>
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!rental) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Home className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Listing not found</h2>
          <p className="text-muted-foreground mb-6">This property listing doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/rentals')}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Rentals
          </Button>
        </div>
      </div>
    )
  }

  const images = (rental.images?.length ?? 0) > 0 ? rental.images : [DEFAULT_IMAGE]
  const reviews = ((rental as any).reviews || []).sort(
    (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
    : 0
  const userReview = user ? reviews.find((r: any) => r.user_id === user.id) : null
  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r: any) => r.rating === star).length,
  }))

  const contactLabel = rental.contact_type === 'broker' ? 'Broker'
    : rental.contact_type === 'agent' ? 'Agent' : 'Owner'

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <Button variant="ghost" onClick={() => navigate('/rentals')} className="mb-6">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Rentals
        </Button>

        {/* Image Gallery */}
        <div className="mb-6">
          <div className="aspect-video bg-muted rounded-xl overflow-hidden mb-3">
            <img
              src={(images ?? [DEFAULT_IMAGE])[selectedImage]}
              alt={rental.title}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_IMAGE }}
            />
          </div>
          {(images ?? []).length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {(images ?? []).map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    i === selectedImage ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${rental.title} ${i + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_IMAGE }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Two-column layout */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left column — Property details */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{rental.title}</h1>
                <Badge variant={rental.listing_type === 'sale' ? 'default' : 'secondary'}>
                  {rental.listing_type === 'sale' ? 'For Sale' : 'For Rent'}
                </Badge>
              </div>
              <div className="text-2xl font-bold text-primary mb-2">
                {rental.listing_type === 'sale'
                  ? `ETB ${rental.price.toLocaleString()}`
                  : `ETB ${rental.price.toLocaleString()}/mo`}
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{rental.location}</span>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm">
              <span className="flex items-center gap-1">
                <Bed className="h-4 w-4" />
                {rental.bedrooms} bedrooms
              </span>
              <span className="flex items-center gap-1">
                <Bath className="h-4 w-4" />
                {rental.bathrooms} bathrooms
              </span>
              {rental.square_feet && (
                <span className="text-muted-foreground">
                  {rental.square_feet.toLocaleString()} sqft
                </span>
              )}
            </div>

            <hr />

            <div>
              <h2 className="font-semibold text-lg mb-3">About this property</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">{rental.description}</p>
            </div>

            {(rental.amenities ?? []).length > 0 && (
              <div>
                <h2 className="font-semibold text-lg mb-3">Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {(rental.amenities ?? []).map((amenity: string) => (
                    <Badge key={amenity} variant="outline">{amenity}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <hr />
            <div>
              <h2 className="font-semibold text-lg mb-4">Reviews ({reviews.length})</h2>

              {/* Review summary bar */}
              {reviews.length > 0 && (
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-8">
                      <div className="text-center">
                        <div className="text-4xl font-bold">{avgRating.toFixed(1)}</div>
                        <div className="flex items-center gap-0.5 mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= Math.round(avgRating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-muted-foreground'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{reviews.length} reviews</p>
                      </div>
                      <div className="flex-1 space-y-1">
                        {ratingDistribution.map(({ star, count }) => (
                          <div key={star} className="flex items-center gap-2 text-sm">
                            <span className="w-8">{star} star</span>
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-yellow-400 rounded-full"
                                style={{ width: `${reviews.length > 0 ? (count / reviews.length) * 100 : 0}%` }}
                              />
                            </div>
                            <span className="w-6 text-muted-foreground">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Write a review */}
              {user && !userReview && (
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-3">Rate this property</h3>
                    <div className="flex items-center gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setUserRating(star)}
                        >
                          <Star
                            className={`h-6 w-6 cursor-pointer transition-colors ${
                              star <= (hoverRating || userRating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-muted-foreground'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="review">Your review (min 10 characters)</Label>
                      <Textarea
                        id="review"
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Share your experience with this property..."
                        rows={3}
                      />
                    </div>
                    <Button
                      className="mt-3"
                      onClick={handleSubmitReview}
                      disabled={userRating === 0 || reviewComment.trim().length < 10 || submittingReview}
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Review list */}
              <div className="space-y-4">
                {reviews.map((review: any) => (
                  <Card key={review.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center font-semibold text-sm">
                            {(review.user?.full_name || 'A')[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{review.user?.full_name || 'Anonymous'}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3 w-3 ${
                                star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                      {user && review.user_id === user.id && (
                        <div className="flex gap-2 mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive h-7 text-xs"
                            onClick={() => handleDeleteReview(review.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Right column — Contact card */}
          <div>
            <div className="sticky top-4">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold text-lg">Contact {contactLabel}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {rental.contact_type || 'owner'}
                    </Badge>
                  </div>
                  <p className="font-medium">{rental.contact_name || (rental as any).user?.full_name || 'Unknown'}</p>

                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {rental.contact_phone || (rental as any).user?.phone ? (
                      <a
                        href={`tel:${rental.contact_phone || (rental as any).user?.phone}`}
                        className="text-primary hover:underline"
                      >
                        {rental.contact_phone || (rental as any).user?.phone}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">No phone listed</span>
                    )}
                  </div>

                  <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full">
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Send a Message</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-3">
                        <Label htmlFor="message">Your message</Label>
                        <Textarea
                          id="message"
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          placeholder="I'm interested in this property..."
                          rows={4}
                        />
                        <Button
                          className="w-full"
                          onClick={handleSendMessage}
                          disabled={!messageText.trim()}
                        >
                          Send
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <hr />

                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">
                      Listed by {(rental as any).user?.full_name || 'Unknown'}
                    </p>
                    <p>
                      Listed on {new Date(rental.created_at ?? '').toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
