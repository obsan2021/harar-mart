import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Briefcase, Building2, Heart } from 'lucide-react'

export default function Careers() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Join Our Team</h1>
        <p className="text-xl text-muted-foreground mb-12">
          Build the future of global trade with us. We're looking for passionate individuals to help connect businesses worldwide.
        </p>

        {/* Why Join Us */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">Why Work at Harar Mart?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Impactful Work</h3>
                  <p className="text-sm text-muted-foreground">
                    Help transform African businesses and connect them to global markets.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Heart className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Inclusive Culture</h3>
                  <p className="text-sm text-muted-foreground">
                    We value diversity and create an environment where everyone thrives.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Beautiful Location</h3>
                  <p className="text-sm text-muted-foreground">
                    Work from historic Harar, a UNESCO World Heritage site in Ethiopia.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Growth Opportunities</h3>
                  <p className="text-sm text-muted-foreground">
                    Learn and grow with a fast-paced startup environment.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Open Positions */}
        <h2 className="text-3xl font-bold mb-6">Open Positions</h2>
        <div className="space-y-4 mb-12">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">Full Stack Developer</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      Harar, Ethiopia (Remote Optional)
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      Full-time
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    We're looking for an experienced full stack developer to help build and scale our B2B marketplace platform.
                  </p>
                </div>
                <Button>Apply Now</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">Business Development Manager</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      Harar, Ethiopia
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      Full-time
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Help us expand our supplier network and connect with new buyers across Africa and globally.
                  </p>
                </div>
                <Button>Apply Now</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">Customer Success Specialist</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      Harar, Ethiopia (Remote Optional)
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      Full-time
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Support our buyers and suppliers to ensure successful transactions on our platform.
                  </p>
                </div>
                <Button>Apply Now</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">Marketing Manager</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      Harar, Ethiopia (Remote Optional)
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      Full-time
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Lead our marketing efforts to grow brand awareness and acquire new users across target markets.
                  </p>
                </div>
                <Button>Apply Now</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* How to Apply */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">How to Apply</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Interested in joining our team? Send your resume and a brief cover letter explaining why you're excited about Harar Mart to:
            </p>
            <p className="font-semibold mb-4">careers@haramart.com</p>
            <p className="text-sm text-muted-foreground">
              We review all applications and will get back to qualified candidates within 2 weeks. Even if you don't see a position that matches your skills, feel free to reach out – we're always looking for talented people to join our growing team.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
