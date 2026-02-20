import { useState, useEffect } from 'react';
import { Star, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { customerFetch, isCustomerAuthenticated, getCurrentUser } from '@/lib/auth';

interface Review {
  id: string;
  rating: number;
  title?: string;
  body?: string;
  created_at: string;
  user_id: string;
}

export default function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const isAuthenticated = isCustomerAuthenticated();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';
        const res = await fetch(`${apiUrl}/products/${productId}/reviews/`);
        if (res.ok) {
          setReviews(await res.json());
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchReviews();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast({ title: "Please log in", description: "You must be logged in to leave a review.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const user = await getCurrentUser();
      
      const res = await customerFetch('/reviews/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          user_id: user.id,
          rating,
          title,
          body
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Failed to submit review');
      }

      toast({ title: "Review submitted", description: "Thank you for your feedback!" });
      setReviews([...reviews, await res.json()]);
      setTitle('');
      setBody('');
      setRating(5);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-12">
      <h2 className="text-2xl font-display">Customer Reviews</h2>
      
      <div className="grid md:grid-cols-2 gap-12">
        <div className="space-y-8">
          {reviews.length === 0 ? (
            <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
          ) : (
            reviews.map(review => (
              <div key={review.id} className="border-b border-border pb-8">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{review.title}</span>
                </div>
                <p className="text-muted-foreground mb-4">{review.body}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <User className="w-3 h-3" />
                  <span>Verified Buyer</span>
                  <span>•</span>
                  <span>{new Date(review.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="bg-secondary/30 p-8 border border-border h-fit">
          <h3 className="font-display text-xl mb-6">Write a Review</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star className={`w-6 h-6 ${star <= rating ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required className="rounded-none bg-background" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Review</Label>
              <Textarea id="body" value={body} onChange={e => setBody(e.target.value)} required className="rounded-none bg-background resize-none" rows={5} />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full rounded-none">
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}