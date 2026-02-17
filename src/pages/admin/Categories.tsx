import { useState, useEffect } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { adminFetch } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
  description: string;
}

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState({ id: '', name: '', description: '' });
  const { toast } = useToast();

  const loadCategories = async () => {
    const res = await adminFetch('/categories/');
    if (res.ok) setCategories(await res.json());
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await adminFetch('/categories/', {
        method: 'POST',
        body: JSON.stringify(newCategory)
      });
      if (res.ok) {
        toast({ title: "Category created" });
        setNewCategory({ id: '', name: '', description: '' });
        loadCategories();
      } else {
        throw new Error('Failed');
      }
    } catch (e) {
      toast({ title: "Error", description: "Could not create category", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure? This cannot be undone.')) return;
    try {
      const res = await adminFetch(`/categories/${id}`, { method: 'DELETE' });
      if (res.ok || res.status === 204) {
        toast({ title: "Category deleted" });
        loadCategories();
      }
    } catch (e) {
      toast({ title: "Error", description: "Could not delete category", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-display">Categories</h1>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Create Form */}
        <div className="bg-card p-6 border border-border h-fit">
          <h2 className="font-medium mb-4">Add New Category</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label>ID (slug)</Label>
              <Input placeholder="e.g. collars" value={newCategory.id} onChange={e => setNewCategory({...newCategory, id: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input placeholder="e.g. Collars" value={newCategory.name} onChange={e => setNewCategory({...newCategory, name: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input placeholder="Short description" value={newCategory.description} onChange={e => setNewCategory({...newCategory, description: e.target.value})} />
            </div>
            <Button type="submit" className="w-full">Create Category</Button>
          </form>
        </div>

        {/* List */}
        <div className="md:col-span-2 space-y-4">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between p-4 bg-card border border-border">
              <div>
                <h3 className="font-medium">{cat.name}</h3>
                <p className="text-sm text-muted-foreground">{cat.description}</p>
                <p className="text-xs text-muted-foreground font-mono mt-1">ID: {cat.id}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id)} className="text-destructive hover:bg-destructive/10">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {categories.length === 0 && (
            <p className="text-muted-foreground text-center py-8">No categories found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;