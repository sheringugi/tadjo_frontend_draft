import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { fetchProducts, Product } from '@/lib/store';

interface Category {
  id: string;
  name: string;
  productCount?: number;
}

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const initialCategory = searchParams.get('category') || '';
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory ? [initialCategory] : []
  );
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [sortBy, setSortBy] = useState('featured');

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch Products first
        const productsData = await fetchProducts();
        setProducts(productsData);

        // 2. Fetch Categories independently
        try {
          const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';
          const response = await fetch(`${apiUrl}/categories/`);
          if (response.ok) {
            const categoriesData = await response.json();
            // Calculate counts based on loaded products
            const categoriesWithCounts = categoriesData.map((cat: any) => ({
              ...cat,
              productCount: productsData.filter(p => p.category_id === cat.id).length
            }));
            setCategories(categoriesWithCounts);
          }
        } catch (catError) {
          console.error("Failed to load categories:", catError);
        }
      } catch (error) {
        console.error("Failed to load products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];
    
    if (selectedCategories.length > 0) {
      result = result.filter(p => selectedCategories.includes(p.category_id));
    }
    
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating); // Assuming rating exists on backend product
        break;
      default:
        break;
    }
    
    return result;
  }, [products, selectedCategories, priceRange, sortBy]);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 500]);
    setSearchParams({});
  };

  const FilterContent = () => (
    <div className="space-y-8">
      {/* Categories */}
      <div>
        <h4 className="text-xs tracking-luxury uppercase font-medium text-foreground mb-4">Categories</h4>
        <div className="space-y-3">
          {categories.map(category => (
            <label
              key={category.id}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <Checkbox
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={() => toggleCategory(category.id)}
                className="rounded-none"
              />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                {category.name}
              </span>
              <span className="text-xs text-muted-foreground ml-auto">
                ({category.productCount || 0})
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="text-xs tracking-luxury uppercase font-medium text-foreground mb-4">Price Range</h4>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          max={500}
          step={25}
          className="mb-4"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>CHF {priceRange[0]}</span>
          <span>CHF {priceRange[1]}+</span>
        </div>
      </div>

      {/* Clear Filters */}
      {(selectedCategories.length > 0 || priceRange[0] > 0 || priceRange[1] < 500) && (
        <Button 
          variant="outline" 
          onClick={clearFilters} 
          className="w-full rounded-none text-xs tracking-luxury uppercase"
        >
          <X className="w-4 h-4 mr-2" />
          Clear Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="pt-20 md:pt-24 pb-24">
        <div className="container mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <p className="text-xs tracking-wide-luxury uppercase text-muted-foreground mb-3">
              The Collection
            </p>
            <h1 className="text-4xl md:text-5xl font-display font-normal text-foreground mb-4">
              All Products
            </h1>
            <p className="text-muted-foreground">
              {filteredProducts.length} pieces
            </p>
          </motion.div>

          <div className="flex gap-12">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-56 flex-shrink-0">
              <div className="sticky top-36">
                <FilterContent />
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              {/* Mobile Filter & Sort */}
              <div className="flex gap-3 mb-8 lg:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="flex-1 rounded-none text-xs tracking-luxury uppercase">
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetHeader>
                      <SheetTitle className="text-xs tracking-luxury uppercase font-medium">Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-8">
                      <FilterContent />
                    </div>
                  </SheetContent>
                </Sheet>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 px-4 py-2 border border-input bg-background text-xs tracking-wide uppercase"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>

              {/* Desktop Sort */}
              <div className="hidden lg:flex justify-end mb-8">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-input bg-background text-xs tracking-wide uppercase"
                >
                  <option value="featured">Sort by: Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>

              {/* Products Grid */}
              {isLoading ? (
                <p className="text-center py-20 text-muted-foreground">Loading products...</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                  {filteredProducts.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} />
                  ))}
                </div>
              )}

              {!isLoading && filteredProducts.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-muted-foreground">No products found</p>
                  <Button 
                    variant="outline" 
                    onClick={clearFilters} 
                    className="mt-4 rounded-none text-xs tracking-luxury uppercase"
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
    </div>
  );
};

export default Products;