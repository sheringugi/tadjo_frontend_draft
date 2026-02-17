import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { adminFetch } from '@/lib/auth';

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_id: string;
  product_id: string;
}

const AdminReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const loadReviews = async () => {
      const res = await adminFetch('/admin/reviews/');
      if (res.ok) setReviews(await res.json());
    };
    loadReviews();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-display">Customer Reviews</h1>

      <div className="bg-card border border-border overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-secondary text-muted-foreground font-medium">
            <tr>
              <th className="p-4">Date</th>
              <th className="p-4">Rating</th>
              <th className="p-4">Comment</th>
              <th className="p-4">Product ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {reviews.map((review) => (
              <tr key={review.id}>
                <td className="p-4 text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</td>
                <td className="p-4">
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{review.rating}</span>
                    <Star className="w-3 h-3 fill-primary text-primary" />
                  </div>
                </td>
                <td className="p-4">{review.comment}</td>
                <td className="p-4 text-xs font-mono text-muted-foreground">{review.product_id}</td>
              </tr>
            ))}
            {reviews.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No reviews yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminReviews;