import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, ExternalLink, FileText, Award } from 'lucide-react'

export default function Press() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Press & Media</h1>
        <p className="text-xl text-muted-foreground mb-12">
          Latest news, updates, and media coverage about Harar Mart's journey to transform African B2B trade.
        </p>

        {/* Media Contact */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">Media Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              For press inquiries, interview requests, or media partnerships, please contact:
            </p>
            <div className="space-y-2">
              <p className="font-semibold">press@haramart.com</p>
              <p className="text-sm text-muted-foreground">+251919054807</p>
              <p className="text-sm text-muted-foreground">Harar, Ethiopia</p>
            </div>
          </CardContent>
        </Card>

        {/* Latest News */}
        <h2 className="text-3xl font-bold mb-6">Latest News</h2>
        <div className="space-y-6 mb-12">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-3 mb-3">
                <Calendar className="h-5 w-5 text-primary mt-1" />
                <span className="text-sm text-muted-foreground">December 2025</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Harar Mart Launches Platform Connecting Ethiopian Suppliers to Global Markets</h3>
              <p className="text-muted-foreground mb-4">
                Harar Mart officially launches its B2B marketplace, enabling Ethiopian businesses to connect with international buyers. The platform features verified supplier profiles, secure payment processing, and comprehensive buyer protection.
              </p>
              <a href="#" className="text-primary hover:underline flex items-center gap-1 text-sm">
                Read More <ExternalLink className="h-4 w-4" />
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-3 mb-3">
                <Calendar className="h-5 w-5 text-primary mt-1" />
                <span className="text-sm text-muted-foreground">November 2025</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Harar Mart Secures Strategic Partnership with Ethiopian Chamber of Commerce</h3>
              <p className="text-muted-foreground mb-4">
                In a move to strengthen Ethiopia's export capabilities, Harar Mart partners with the Ethiopian Chamber of Commerce to provide training and resources for local suppliers looking to expand internationally.
              </p>
              <a href="#" className="text-primary hover:underline flex items-center gap-1 text-sm">
                Read More <ExternalLink className="h-4 w-4" />
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-3 mb-3">
                <Calendar className="h-5 w-5 text-primary mt-1" />
                <span className="text-sm text-muted-foreground">October 2025</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Over 500 Ethiopian Suppliers Join Harar Mart Platform in First Month</h3>
              <p className="text-muted-foreground mb-4">
                Just one month after launch, Harar Mart welcomes over 500 verified suppliers from across Ethiopia, spanning industries from coffee and textiles to manufacturing and handicrafts.
              </p>
              <a href="#" className="text-primary hover:underline flex items-center gap-1 text-sm">
                Read More <ExternalLink className="h-4 w-4" />
              </a>
            </CardContent>
          </Card>
        </div>

        {/* Press Kit */}
        <h2 className="text-3xl font-bold mb-6">Press Kit</h2>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground mb-6">
              Download our press kit for high-resolution logos, company overview, executive bios, and brand assets.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <a href="#" className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted transition-colors">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">Company Overview</p>
                  <p className="text-sm text-muted-foreground">PDF, 2.4 MB</p>
                </div>
              </a>
              <a href="#" className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted transition-colors">
                <Award className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">Logo Package</p>
                  <p className="text-sm text-muted-foreground">ZIP, 15.8 MB</p>
                </div>
              </a>
              <a href="#" className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted transition-colors">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">Executive Bios</p>
                  <p className="text-sm text-muted-foreground">PDF, 1.1 MB</p>
                </div>
              </a>
              <a href="#" className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted transition-colors">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">Brand Guidelines</p>
                  <p className="text-sm text-muted-foreground">PDF, 3.2 MB</p>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
