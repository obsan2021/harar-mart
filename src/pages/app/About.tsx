import { Card, CardContent } from '@/components/ui/card'
import { Building2, Globe, Users, Shield, Target, Award } from 'lucide-react'

export default function About() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">About Harar Mart</h1>
        <p className="text-xl text-muted-foreground mb-12">
          Your trusted global B2B marketplace connecting buyers with verified suppliers worldwide.
        </p>

        {/* Mission */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-3">Our Mission</h2>
                <p className="text-muted-foreground">
                  To revolutionize global trade by providing a secure, transparent, and efficient platform that connects businesses across borders. We believe in empowering Ethiopian and African businesses to participate in the global marketplace while maintaining the highest standards of quality and trust.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vision */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-3">Our Vision</h2>
                <p className="text-muted-foreground">
                  To become Africa's leading B2B marketplace, bridging the gap between local suppliers and international buyers. We envision a world where geographical boundaries don't limit business opportunities, and where every verified supplier can reach customers globally.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Values */}
        <h2 className="text-3xl font-bold mb-6">Our Core Values</h2>
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Trust & Security</h3>
                  <p className="text-sm text-muted-foreground">
                    We verify every supplier to ensure safe and reliable transactions for all our users.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Customer First</h3>
                  <p className="text-sm text-muted-foreground">
                    Our users are at the heart of everything we do. We prioritize your success and satisfaction.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Award className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Quality Excellence</h3>
                  <p className="text-sm text-muted-foreground">
                    We maintain the highest standards in product quality and supplier verification.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Local Impact</h3>
                  <p className="text-sm text-muted-foreground">
                    Rooted in Harar, Ethiopia, we're committed to empowering local businesses and contributing to African economic growth.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Story */}
        <Card>
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-4">Our Story</h2>
            <p className="text-muted-foreground mb-4">
              Founded in the historic city of Harar, Ethiopia, Harar Mart was born from a simple observation: African businesses, particularly Ethiopian suppliers, faced significant challenges accessing global markets. Language barriers, trust issues, and lack of verification systems kept many excellent suppliers from reaching their full potential.
            </p>
            <p className="text-muted-foreground mb-4">
              Our founders, passionate about connecting Ethiopia to the world, set out to build a platform that would solve these challenges. We created a marketplace that not only connects buyers and suppliers but also provides the trust and security needed for international trade.
            </p>
            <p className="text-muted-foreground">
              Today, Harar Mart serves as a bridge between Ethiopian businesses and the world, while also welcoming suppliers from across the globe. We're proud to be based in Harar, a UNESCO World Heritage site known for its rich trading history, and we carry that legacy forward in the digital age.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
