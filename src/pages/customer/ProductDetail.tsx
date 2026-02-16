import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Minus, Plus, Heart } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { products, addToCart } from '@/lib/store';
import { getSupplierForProduct } from '@/lib/suppliers';
import { useToast } from '@/hooks/use-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const { toast } = useToast();

  const product = products.find(p => p.id === id);
  const supplier = product ? getSupplierForProduct(product.id) : undefined;
  const relatedProducts = products.filter(p => p.id !== id && p.category === product?.category).slice(0, 4);

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-display text-foreground mb-4">Product not found</h1>
          <Link to="/products">
            <Button className="rounded-none text-xs tracking-luxury uppercase">Back to Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast({
      title: "Added to bag",
      description: `${quantity} × ${product.name} has been added to your bag.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-28 md:pt-36 pb-24">
        <div className="container mx-auto">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-10"
          >
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-xs tracking-luxury uppercase text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Collection
            </Link>
          </motion.div>

          {/* Product Details */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="aspect-[3/4] overflow-hidden bg-secondary">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {product.badge && (
                <div className="absolute top-6 left-6">
                  <span className="text-[10px] tracking-luxury uppercase bg-background/95 backdrop-blur-sm px-3 py-1.5 text-foreground">
                    {product.badge === 'bestseller' ? 'Best Seller' : 
                     product.badge === 'new' ? 'New' : 
                     product.badge === 'limited' ? 'Limited Edition' : ''}
                  </span>
                </div>
              )}
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-8"
            >
              <div>
                <p className="text-xs tracking-wide uppercase text-muted-foreground mb-3">
                  {product.material}
                </p>
                <h1 className="text-3xl md:text-4xl font-display font-normal text-foreground mb-4">
                  {product.name}
                </h1>
                <p className="text-xl text-foreground">
                  CHF {product.price.toFixed(0)}
                </p>
              </div>

              {/* Description */}
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>

              {/* Color */}
              {product.color && (
                <div>
                  <p className="text-xs tracking-luxury uppercase text-muted-foreground mb-2">Color</p>
                  <p className="text-foreground">{product.color}</p>
                </div>
              )}

              {/* Quantity & Add to Cart */}
              <div className="space-y-4">
                <div className="flex items-center gap-6">
                  <p className="text-xs tracking-luxury uppercase text-muted-foreground">Quantity</p>
                  <div className="flex items-center border border-border">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-none"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-none"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    size="lg"
                    className="flex-1 bg-foreground text-background hover:bg-foreground/90 rounded-none h-12 text-xs tracking-luxury uppercase"
                    onClick={handleAddToCart}
                  >
                    Add to Bag
                  </Button>

                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-12 w-12 rounded-none border-foreground"
                  >
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Shipping Note */}
              <div className="border-t border-border pt-6 space-y-2">
                <p className="text-sm text-muted-foreground">
                  Complimentary shipping on orders over CHF 150. Estimated delivery: {product.shippingDays} business days.
                </p>
                {supplier && (
                  <p className="text-xs text-muted-foreground">
                    Sourced from: <span className="text-foreground">{supplier.type === 'alibaba' ? 'Partner manufacturer' : 'Tanzanian artisan collective'}</span>
                    {' '}• ~{supplier.defaultLeadTimeDays} day lead time
                  </p>
                )}
              </div>

              {/* Tabs */}
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-8">
                  <TabsTrigger
                    value="details"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-0 text-xs tracking-luxury uppercase"
                  >
                    Details
                  </TabsTrigger>
                  <TabsTrigger
                    value="care"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-0 text-xs tracking-luxury uppercase"
                  >
                    Care
                  </TabsTrigger>
                  <TabsTrigger
                    value="shipping"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-0 text-xs tracking-luxury uppercase"
                  >
                    Shipping
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="mt-6">
                  <ul className="space-y-2">
                    {product.specifications.map((spec, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        • {spec}
                      </li>
                    ))}
                  </ul>
                </TabsContent>
                <TabsContent value="care" className="mt-6">
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• Wipe clean with a damp cloth</p>
                    <p>• Condition leather regularly with a quality leather conditioner</p>
                    <p>• Store in a cool, dry place away from direct sunlight</p>
                    <p>• Complimentary lifetime care service available</p>
                  </div>
                </TabsContent>
                <TabsContent value="shipping" className="mt-6">
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• Complimentary shipping on orders over CHF 150</p>
                    <p>• Express shipping available at checkout</p>
                    <p>• International shipping to 30+ countries</p>
                    <p>• 30-day returns on all orders</p>
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-24"
            >
              <div className="text-center mb-12">
                <p className="text-xs tracking-wide-luxury uppercase text-muted-foreground mb-3">
                  You May Also Like
                </p>
                <h2 className="text-3xl font-display font-normal text-foreground">
                  Related Pieces
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {relatedProducts.map((p, index) => (
                  <ProductCard key={p.id} product={p} index={index} />
                ))}
              </div>
            </motion.section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;