import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { adminFetch } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
}

const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    category_id: '',
    material: '',
    color: '',
    badge: '',
    shipping_days: '3',
    in_stock: true
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [specs, setSpecs] = useState<{spec: string}[]>([]);
  const [images, setImages] = useState<{url: string, alt_text: string}[]>([]);
  
  // New item states
  const [newSpec, setNewSpec] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    const loadData = async () => {
      // Fetch categories
      const catRes = await adminFetch('/categories/');
      if (catRes.ok) setCategories(await catRes.json());

      if (isEditing) {
        const prodRes = await adminFetch(`/products/${id}`);
        if (prodRes.ok) {
          const prod = await prodRes.json();
          setFormData({
            name: prod.name,
            description: prod.description || '',
            price: prod.price,
            image_url: prod.image_url || '',
            category_id: prod.category_id,
            material: prod.material || '',
            color: prod.color || '',
            badge: prod.badge || '',
            shipping_days: prod.shipping_days?.toString() || '3',
            in_stock: prod.in_stock
          });
          
          // Fetch specs and images
          const specsRes = await adminFetch(`/products/${id}/specifications/`);
          if (specsRes.ok) setSpecs(await specsRes.json());

          const imgsRes = await adminFetch(`/products/${id}/images/`);
          if (imgsRes.ok) setImages(await imgsRes.json());
        }
      }
    };
    loadData();
  }, [id, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = isEditing ? `/products/${id}` : '/products/';
      const method = isEditing ? 'PUT' : 'POST';
      
      const res = await adminFetch(url, {
        method,
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          shipping_days: parseInt(formData.shipping_days),
          // Only send specs/images on create, backend handles them separately on update
          specifications: isEditing ? undefined : [], 
          images: isEditing ? undefined : []
        })
      });

      if (!res.ok) throw new Error('Failed to save product');
      
      const savedProduct = await res.json();
      toast({ title: "Success", description: "Product saved successfully." });
      
      if (!isEditing) {
        navigate(`/admin/products/${savedProduct.id}`);
      }
    } catch (error) {
      toast({ title: "Error", description: "Could not save product.", variant: "destructive" });
    }
  };

  const handleAddSpec = async () => {
    if (!isEditing || !newSpec) return;
    try {
      const res = await adminFetch(`/products/${id}/specifications/`, {
        method: 'POST',
        body: JSON.stringify({ spec: newSpec })
      });
      if (res.ok) {
        const added = await res.json();
        setSpecs([...specs, added]);
        setNewSpec('');
        toast({ title: "Specification added" });
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to add spec", variant: "destructive" });
    }
  };

  const handleAddImage = async () => {
    if (!isEditing || !newImageUrl) return;
    try {
      const res = await adminFetch(`/products/${id}/images/`, {
        method: 'POST',
        body: JSON.stringify({ url: newImageUrl, alt_text: formData.name, sort_order: images.length })
      });
      if (res.ok) {
        const added = await res.json();
        setImages([...images, added]);
        setNewImageUrl('');
        toast({ title: "Image added" });
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to add image", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/products')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-3xl font-display">{isEditing ? 'Edit Product' : 'New Product'}</h1>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General Info</TabsTrigger>
          <TabsTrigger value="specs" disabled={!isEditing}>Specifications</TabsTrigger>
          <TabsTrigger value="images" disabled={!isEditing}>Images</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Product Name</Label>
                  <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={formData.category_id}
                    onChange={e => setFormData({...formData, category_id: e.target.value})}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Main Image URL</Label>
                <Input value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} placeholder="https://..." required />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea className="h-32" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Price (CHF)</Label>
                  <Input type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>Material</Label>
                  <Input value={formData.material} onChange={e => setFormData({...formData, material: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <Input value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Badge (Optional)</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.badge}
                    onChange={e => setFormData({...formData, badge: e.target.value})}
                  >
                    <option value="">None</option>
                    <option value="new">New</option>
                    <option value="bestseller">Best Seller</option>
                    <option value="limited">Limited</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Shipping Days</Label>
                  <Input type="number" value={formData.shipping_days} onChange={e => setFormData({...formData, shipping_days: e.target.value})} />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Save Product Details
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="specs" className="space-y-6 max-w-2xl">
          <div className="bg-card border border-border p-6">
            <h3 className="font-medium mb-4">Current Specifications</h3>
            <ul className="space-y-2 mb-6">
              {specs.map((s, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {s.spec}
                </li>
              ))}
              {specs.length === 0 && <p className="text-sm text-muted-foreground italic">No specifications added.</p>}
            </ul>

            <div className="flex gap-2">
              <Input 
                placeholder="Add new specification..." 
                value={newSpec} 
                onChange={e => setNewSpec(e.target.value)} 
              />
              <Button onClick={handleAddSpec} disabled={!newSpec}>Add</Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="images" className="space-y-6 max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((img, i) => (
              <div key={i} className="aspect-square bg-secondary overflow-hidden relative group">
                <img src={img.url} alt={img.alt_text} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>

          <div className="bg-card border border-border p-6 max-w-2xl">
            <h3 className="font-medium mb-4">Add New Image</h3>
            <div className="flex gap-2">
              <Input 
                placeholder="Image URL (https://...)" 
                value={newImageUrl} 
                onChange={e => setNewImageUrl(e.target.value)} 
              />
              <Button onClick={handleAddImage} disabled={!newImageUrl}>Add</Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Enter a direct link to an image.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminProductForm;