'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useApp } from '@/lib/app-context';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ChevronLeft, 
  Plus,
  Search,
  MapPin,
  Phone,
  Leaf,
  Truck,
  Filter,
  ShoppingBag,
  MessageCircle,
  Star,
  X,
  Camera,
  ChevronRight
} from 'lucide-react';
import type { MarketplaceListing } from '@/lib/types';

const mockListings: MarketplaceListing[] = [
  {
    id: '1',
    farmerId: 'f1',
    farmerName: 'Ramesh Kumar',
    farmerLocation: 'Dehradun, UK',
    farmerPhone: '+91 98765 43210',
    productName: 'Fresh Tomatoes',
    productNameHi: 'ताज़े टमाटर',
    category: 'vegetables',
    quantity: 50,
    unit: 'kg',
    pricePerUnit: 40,
    description: 'Organic tomatoes grown without pesticides. Fresh from farm.',
    descriptionHi: 'जैविक टमाटर बिना कीटनाशक के उगाए। खेत से ताज़े।',
    images: [],
    harvestDate: '2024-02-10',
    organic: true,
    delivery: true,
    createdAt: new Date(),
    status: 'active',
  },
  {
    id: '2',
    farmerId: 'f2',
    farmerName: 'Geeta Devi',
    farmerLocation: 'Haridwar, UK',
    farmerPhone: '+91 98765 43211',
    productName: 'Wheat',
    productNameHi: 'गेहूं',
    category: 'grains',
    quantity: 10,
    unit: 'quintal',
    pricePerUnit: 2400,
    description: 'Premium quality wheat. Clean and ready for milling.',
    descriptionHi: 'प्रीमियम गुणवत्ता वाला गेहूं। साफ और पिसाई के लिए तैयार।',
    images: [],
    harvestDate: '2024-02-05',
    organic: false,
    delivery: true,
    createdAt: new Date(),
    status: 'active',
  },
  {
    id: '3',
    farmerId: 'f3',
    farmerName: 'Suresh Singh',
    farmerLocation: 'Rishikesh, UK',
    farmerPhone: '+91 98765 43212',
    productName: 'Fresh Milk',
    productNameHi: 'ताज़ा दूध',
    category: 'dairy',
    quantity: 20,
    unit: 'litre',
    pricePerUnit: 60,
    description: 'Pure cow milk from healthy cows. Daily fresh supply.',
    descriptionHi: 'स्वस्थ गायों का शुद्ध दूध। दैनिक ताज़ी आपूर्ति।',
    images: [],
    harvestDate: '2024-02-12',
    organic: true,
    delivery: true,
    createdAt: new Date(),
    status: 'active',
  },
  {
    id: '4',
    farmerId: 'f4',
    farmerName: 'Parvati Rawat',
    farmerLocation: 'Pauri, UK',
    farmerPhone: '+91 98765 43213',
    productName: 'Apples',
    productNameHi: 'सेब',
    category: 'fruits',
    quantity: 100,
    unit: 'kg',
    pricePerUnit: 120,
    description: 'Fresh Himalayan apples. Sweet and juicy.',
    descriptionHi: 'ताज़े हिमालयी सेब। मीठे और रसीले।',
    images: [],
    harvestDate: '2024-02-08',
    organic: true,
    delivery: false,
    createdAt: new Date(),
    status: 'active',
  },
];

const categories = [
  { id: 'all', label: 'All', labelHi: 'सभी' },
  { id: 'vegetables', label: 'Vegetables', labelHi: 'सब्ज़ियां' },
  { id: 'fruits', label: 'Fruits', labelHi: 'फल' },
  { id: 'grains', label: 'Grains', labelHi: 'अनाज' },
  { id: 'dairy', label: 'Dairy', labelHi: 'डेयरी' },
];

export function MarketplaceScreen() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddListing, setShowAddListing] = useState(false);
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);
  const { preferences, setCurrentScreen } = useApp();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.listing-card',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out' }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [selectedCategory]);

  const filteredListings = mockListings.filter(listing => {
    const matchesCategory = selectedCategory === 'all' || listing.category === selectedCategory;
    const matchesSearch = listing.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.productNameHi.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'vegetables': return '🥬';
      case 'fruits': return '🍎';
      case 'grains': return '🌾';
      case 'dairy': return '🥛';
      default: return '📦';
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-background pb-28">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentScreen('home')}
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
            >
              <ChevronLeft className="w-6 h-6 text-foreground" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">
                {preferences.language === 'hi' ? 'किसान बाज़ार' : 'Farmer Market'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {preferences.language === 'hi' ? 'सीधे किसान से खरीदें' : 'Buy directly from farmers'}
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setShowAddListing(true)}
              className="rounded-full gradient-primary text-primary-foreground"
            >
              <Plus className="w-4 h-4 mr-1" />
              {preferences.language === 'hi' ? 'बेचें' : 'Sell'}
            </Button>
          </div>

          {/* Search Bar */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder={preferences.language === 'hi' ? 'खोजें...' : 'Search products...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 rounded-xl bg-muted border-0"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2">
              <Filter className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Categories */}
          <div className="mt-4 flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {preferences.language === 'hi' ? cat.labelHi : cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Listings */}
      <div className="px-6 pt-4 space-y-4">
        {filteredListings.map((listing) => (
          <Card
            key={listing.id}
            onClick={() => setSelectedListing(listing)}
            className="listing-card p-4 cursor-pointer hover:border-primary/50 transition-all"
          >
            <div className="flex gap-4">
              {/* Product Image Placeholder */}
              <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                <span className="text-4xl">{getCategoryIcon(listing.category)}</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {preferences.language === 'hi' ? listing.productNameHi : listing.productName}
                    </h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      {listing.farmerLocation}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary text-lg">
                      ₹{listing.pricePerUnit}
                    </p>
                    <p className="text-xs text-muted-foreground">/{listing.unit}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <span className="text-xs bg-muted px-2 py-1 rounded-full">
                    {listing.quantity} {listing.unit}
                  </span>
                  {listing.organic && (
                    <span className="text-xs bg-green-500/10 text-green-600 px-2 py-1 rounded-full flex items-center gap-1">
                      <Leaf className="w-3 h-3" />
                      {preferences.language === 'hi' ? 'जैविक' : 'Organic'}
                    </span>
                  )}
                  {listing.delivery && (
                    <span className="text-xs bg-blue-500/10 text-blue-600 px-2 py-1 rounded-full flex items-center gap-1">
                      <Truck className="w-3 h-3" />
                      {preferences.language === 'hi' ? 'डिलीवरी' : 'Delivery'}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    {listing.farmerName}
                  </p>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-3 h-3 fill-current" />
                    <span className="text-xs font-medium">4.8</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {filteredListings.length === 0 && (
          <div className="text-center py-12">
            <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              {preferences.language === 'hi' ? 'कोई उत्पाद नहीं मिला' : 'No products found'}
            </p>
          </div>
        )}
      </div>

      {/* Listing Detail Modal */}
      {selectedListing && (
        <div className="fixed inset-0 z-50 bg-foreground/50" onClick={() => setSelectedListing(null)}>
          <div 
            className="absolute bottom-0 left-0 right-0 bg-background rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 rounded-full bg-muted mx-auto mb-4" />
            <button 
              onClick={() => setSelectedListing(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Product Header */}
            <div className="flex gap-4 mb-6">
              <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                <span className="text-5xl">{getCategoryIcon(selectedListing.category)}</span>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground">
                  {preferences.language === 'hi' ? selectedListing.productNameHi : selectedListing.productName}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  {selectedListing.organic && (
                    <span className="text-xs bg-green-500/10 text-green-600 px-2 py-1 rounded-full flex items-center gap-1">
                      <Leaf className="w-3 h-3" />
                      {preferences.language === 'hi' ? 'जैविक' : 'Organic'}
                    </span>
                  )}
                  {selectedListing.delivery && (
                    <span className="text-xs bg-blue-500/10 text-blue-600 px-2 py-1 rounded-full flex items-center gap-1">
                      <Truck className="w-3 h-3" />
                      {preferences.language === 'hi' ? 'डिलीवरी उपलब्ध' : 'Delivery Available'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Price Card */}
            <Card className="p-4 bg-primary/5 border-primary/20 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {preferences.language === 'hi' ? 'मूल्य' : 'Price'}
                  </p>
                  <p className="text-3xl font-bold text-primary">
                    ₹{selectedListing.pricePerUnit}
                    <span className="text-base font-normal text-muted-foreground">/{selectedListing.unit}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    {preferences.language === 'hi' ? 'उपलब्ध' : 'Available'}
                  </p>
                  <p className="text-xl font-bold text-foreground">
                    {selectedListing.quantity} {selectedListing.unit}
                  </p>
                </div>
              </div>
            </Card>

            {/* Description */}
            <div className="mb-6">
              <h3 className="font-semibold text-foreground mb-2">
                {preferences.language === 'hi' ? 'विवरण' : 'Description'}
              </h3>
              <p className="text-muted-foreground">
                {preferences.language === 'hi' ? selectedListing.descriptionHi : selectedListing.description}
              </p>
            </div>

            {/* Farmer Info */}
            <Card className="p-4 mb-6">
              <h3 className="font-semibold text-foreground mb-3">
                {preferences.language === 'hi' ? 'किसान विवरण' : 'Farmer Details'}
              </h3>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl">👨‍🌾</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{selectedListing.farmerName}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {selectedListing.farmerLocation}
                  </p>
                  <div className="flex items-center gap-1 text-amber-500 mt-1">
                    <Star className="w-3 h-3 fill-current" />
                    <span className="text-xs font-medium">4.8 (23 reviews)</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-xl h-14"
                onClick={() => window.open(`tel:${selectedListing.farmerPhone}`)}
              >
                <Phone className="w-5 h-5 mr-2" />
                {preferences.language === 'hi' ? 'कॉल करें' : 'Call'}
              </Button>
              <Button
                className="flex-1 rounded-xl h-14 bg-[#25D366] hover:bg-[#128C7E] text-white"
                onClick={() => window.open(`https://wa.me/${selectedListing.farmerPhone.replace(/\s/g, '')}?text=${encodeURIComponent(`Hi, I'm interested in your ${selectedListing.productName}`)}`)}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                WhatsApp
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Listing Modal */}
      {showAddListing && (
        <div className="fixed inset-0 z-50 bg-foreground/50" onClick={() => setShowAddListing(false)}>
          <div 
            className="absolute bottom-0 left-0 right-0 bg-background rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 rounded-full bg-muted mx-auto mb-4" />
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">
                {preferences.language === 'hi' ? 'उत्पाद लिस्ट करें' : 'List Your Product'}
              </h2>
              <button 
                onClick={() => setShowAddListing(false)}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Add Photo */}
            <div className="mb-6">
              <button className="w-full h-40 rounded-2xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-2 hover:border-primary/50 transition-colors">
                <Camera className="w-10 h-10 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {preferences.language === 'hi' ? 'फोटो जोड़ें' : 'Add Photos'}
                </p>
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {preferences.language === 'hi' ? 'उत्पाद का नाम' : 'Product Name'}
                </label>
                <Input placeholder={preferences.language === 'hi' ? 'जैसे: टमाटर, गेहूं' : 'e.g., Tomatoes, Wheat'} className="rounded-xl" />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {preferences.language === 'hi' ? 'श्रेणी' : 'Category'}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {categories.slice(1).map((cat) => (
                    <button
                      key={cat.id}
                      className="p-3 rounded-xl bg-muted text-center hover:bg-primary/10 transition-colors"
                    >
                      <span className="text-2xl block mb-1">{getCategoryIcon(cat.id)}</span>
                      <span className="text-xs">{preferences.language === 'hi' ? cat.labelHi : cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {preferences.language === 'hi' ? 'मात्रा' : 'Quantity'}
                  </label>
                  <Input type="number" placeholder="50" className="rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {preferences.language === 'hi' ? 'इकाई' : 'Unit'}
                  </label>
                  <select className="w-full h-10 px-3 rounded-xl bg-muted border-0">
                    <option value="kg">Kg</option>
                    <option value="quintal">Quintal</option>
                    <option value="dozen">Dozen</option>
                    <option value="litre">Litre</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {preferences.language === 'hi' ? 'मूल्य प्रति इकाई (₹)' : 'Price per Unit (₹)'}
                </label>
                <Input type="number" placeholder="40" className="rounded-xl" />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {preferences.language === 'hi' ? 'विवरण' : 'Description'}
                </label>
                <textarea 
                  className="w-full h-24 px-4 py-3 rounded-xl bg-muted border-0 resize-none"
                  placeholder={preferences.language === 'hi' ? 'अपने उत्पाद के बारे में बताएं...' : 'Tell about your product...'}
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 rounded accent-primary" />
                  <span className="text-sm">{preferences.language === 'hi' ? 'जैविक' : 'Organic'}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 rounded accent-primary" />
                  <span className="text-sm">{preferences.language === 'hi' ? 'डिलीवरी उपलब्ध' : 'Delivery Available'}</span>
                </label>
              </div>
            </div>

            <Button className="w-full mt-6 h-14 rounded-xl gradient-primary text-primary-foreground text-lg font-semibold">
              {preferences.language === 'hi' ? 'उत्पाद लिस्ट करें' : 'List Product'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
