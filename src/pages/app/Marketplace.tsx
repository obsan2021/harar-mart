import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Home, Car, MapPin, Bed, Bath, Square, Fuel, Gauge } from 'lucide-react'

// Mock data for houses for rent
const housesForRent = [
  {
    id: 1,
    title: 'Modern 3-Bedroom Apartment',
    location: 'Harar, Ethiopia',
    price: 15000,
    period: 'monthly',
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop',
    featured: true
  },
  {
    id: 2,
    title: 'Cozy 2-Bedroom House',
    location: 'Dire Dawa, Ethiopia',
    price: 8000,
    period: 'monthly',
    bedrooms: 2,
    bathrooms: 1,
    area: 85,
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300&fit=crop',
    featured: false
  },
  {
    id: 3,
    title: 'Luxury Villa with Garden',
    location: 'Harar, Ethiopia',
    price: 35000,
    period: 'monthly',
    bedrooms: 5,
    bathrooms: 4,
    area: 300,
    image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=400&h=300&fit=crop',
    featured: true
  }
]

// Mock data for houses for sale
const housesForSale = [
  {
    id: 4,
    title: 'Family Home with Yard',
    location: 'Harar, Ethiopia',
    price: 2500000,
    bedrooms: 4,
    bathrooms: 3,
    area: 200,
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&h=300&fit=crop',
    featured: true
  },
  {
    id: 5,
    title: 'Modern Townhouse',
    location: 'Dire Dawa, Ethiopia',
    price: 1800000,
    bedrooms: 3,
    bathrooms: 2,
    area: 150,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop',
    featured: false
  },
  {
    id: 6,
    title: 'Commercial Building',
    location: 'Harar, Ethiopia',
    price: 5000000,
    bedrooms: 0,
    bathrooms: 4,
    area: 500,
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
    featured: true
  }
]

// Mock data for vehicles
const vehicles = [
  {
    id: 7,
    title: 'Toyota Corolla 2020',
    location: 'Harar, Ethiopia',
    price: 850000,
    year: 2020,
    mileage: 45000,
    fuel: 'Petrol',
    transmission: 'Automatic',
    image: 'https://images.unsplash.com/photo-1623869675781-80aa31012a5a?w=400&h=300&fit=crop',
    featured: true
  },
  {
    id: 8,
    title: 'Toyota Hilux 2019',
    location: 'Dire Dawa, Ethiopia',
    price: 1200000,
    year: 2019,
    mileage: 60000,
    fuel: 'Diesel',
    transmission: 'Manual',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400&h=300&fit=crop',
    featured: false
  },
  {
    id: 9,
    title: 'Hyundai Accent 2021',
    location: 'Harar, Ethiopia',
    price: 650000,
    year: 2021,
    mileage: 25000,
    fuel: 'Petrol',
    transmission: 'Automatic',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop',
    featured: false
  }
]

export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState('')

  const filterItems = (items: any[]) => {
    return items.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  const HouseCard = ({ house, forSale }: { house: any, forSale: boolean }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="aspect-video bg-muted rounded-lg mb-4 overflow-hidden relative">
          <img
            src={house.image}
            alt={house.title}
            className="w-full h-full object-cover"
          />
          {house.featured && (
            <Badge className="absolute top-2 right-2">Featured</Badge>
          )}
        </div>
        <h3 className="font-semibold mb-2">{house.title}</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <MapPin className="h-4 w-4" />
          {house.location}
        </div>
        <div className="text-2xl font-bold text-primary mb-3">
          Birr {house.price.toLocaleString()}
          {forSale ? '' : <span className="text-sm font-normal text-muted-foreground">/{house.period}</span>}
        </div>
        <div className="flex gap-4 text-sm text-muted-foreground mb-4">
          {house.bedrooms > 0 && (
            <div className="flex items-center gap-1">
              <Bed className="h-4 w-4" />
              {house.bedrooms} Beds
            </div>
          )}
          <div className="flex items-center gap-1">
            <Bath className="h-4 w-4" />
            {house.bathrooms} Baths
          </div>
          <div className="flex items-center gap-1">
            <Square className="h-4 w-4" />
            {house.area} m²
          </div>
        </div>
        <Button className="w-full">View Details</Button>
      </CardContent>
    </Card>
  )

  const VehicleCard = ({ vehicle }: { vehicle: any }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="aspect-video bg-muted rounded-lg mb-4 overflow-hidden relative">
          <img
            src={vehicle.image}
            alt={vehicle.title}
            className="w-full h-full object-cover"
          />
          {vehicle.featured && (
            <Badge className="absolute top-2 right-2">Featured</Badge>
          )}
        </div>
        <h3 className="font-semibold mb-2">{vehicle.title}</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <MapPin className="h-4 w-4" />
          {vehicle.location}
        </div>
        <div className="text-2xl font-bold text-primary mb-3">
          Birr {vehicle.price.toLocaleString()}
        </div>
        <div className="flex gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Gauge className="h-4 w-4" />
            {vehicle.mileage.toLocaleString()} km
          </div>
          <div className="flex items-center gap-1">
            <Fuel className="h-4 w-4" />
            {vehicle.fuel}
          </div>
          <div>{vehicle.transmission}</div>
        </div>
        <Button className="w-full">View Details</Button>
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Marketplace</h1>
        <p className="text-muted-foreground mb-6">Find houses for rent, for sale, and vehicles</p>
        
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search listings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs defaultValue="rent" className="space-y-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="rent" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Houses for Rent
          </TabsTrigger>
          <TabsTrigger value="sale" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Houses for Sale
          </TabsTrigger>
          <TabsTrigger value="vehicles" className="flex items-center gap-2">
            <Car className="h-4 w-4" />
            Vehicles
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rent" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterItems(housesForRent).map((house) => (
              <HouseCard key={house.id} house={house} forSale={false} />
            ))}
          </div>
          {filterItems(housesForRent).length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No rental properties found matching your search.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="sale" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterItems(housesForSale).map((house) => (
              <HouseCard key={house.id} house={house} forSale={true} />
            ))}
          </div>
          {filterItems(housesForSale).length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No properties for sale found matching your search.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="vehicles" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterItems(vehicles).map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
          {filterItems(vehicles).length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No vehicles found matching your search.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
