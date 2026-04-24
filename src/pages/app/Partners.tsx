import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building2, Globe, Handshake, CheckCircle, Mail, Phone } from 'lucide-react'

export default function Partners() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Partner with Harar Mart</h1>
        <p className="text-xl text-muted-foreground mb-12">
          Join our ecosystem of partners and help us transform African B2B trade. We offer strategic partnerships for organizations aligned with our mission.
        </p>

        {/* Why Partner */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">Why Partner with Us?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Access to African Markets</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect with verified suppliers and buyers across Ethiopia and expanding African markets.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Trusted Platform</h3>
                  <p className="text-sm text-muted-foreground">
                    Leverage our verified supplier network and secure transaction infrastructure.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Handshake className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Mutual Growth</h3>
                  <p className="text-sm text-muted-foreground">
                    Build lasting relationships that drive value for both our organizations and our users.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Impact-Driven</h3>
                  <p className="text-sm text-muted-foreground">
                    Contribute to economic development and empower African businesses globally.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Partnership Types */}
        <h2 className="text-3xl font-bold mb-6">Partnership Opportunities</h2>
        <div className="space-y-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Strategic Alliances</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Partner with us for long-term strategic collaboration. Ideal for trade organizations, chambers of commerce, and industry associations.
              </p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Joint marketing initiatives
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Co-branded events and webinars
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Access to our supplier network
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Technology Partners</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Integrate your technology with our platform. Perfect for payment processors, logistics providers, and SaaS solutions.
              </p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  API integration opportunities
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Co-development of features
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Revenue sharing models
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Channel Partners</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Help us reach new markets and users. Ideal for agencies, consultants, and regional representatives.
              </p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Commission-based referrals
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Marketing support and materials
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Training and onboarding
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Current Partners */}
        <h2 className="text-3xl font-bold mb-6">Our Partners</h2>
        <Card className="mb-12">
          <CardContent className="p-8">
            <p className="text-muted-foreground mb-6">
              We're proud to collaborate with leading organizations across Africa and beyond:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex items-center justify-center p-4 border rounded-lg bg-muted/50">
                <span className="font-semibold text-sm">Ethiopian Chamber of Commerce</span>
              </div>
              <div className="flex items-center justify-center p-4 border rounded-lg bg-muted/50">
                <span className="font-semibold text-sm">Africa Trade Center</span>
              </div>
              <div className="flex items-center justify-center p-4 border rounded-lg bg-muted/50">
                <span className="font-semibold text-sm">Ethiopian Exporters Association</span>
              </div>
              <div className="flex items-center justify-center p-4 border rounded-lg bg-muted/50">
                <span className="font-semibold text-sm">COMESA</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Interested in Partnering?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Let's discuss how we can work together to create value for both our organizations.
            </p>
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <span className="font-semibold">partners@haramart.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary" />
                <span className="font-semibold">+251919054807</span>
              </div>
            </div>
            <Button size="lg" className="w-full md:w-auto">
              Start a Conversation
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
