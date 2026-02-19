import { useState, useEffect } from 'react';
import { Trash2, Plus, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { adminFetch } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Category {
  id: string;
  name: string;
  description: string;
  image_url?: string;
  sort_order?: number;
}

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ id: '', name: '', description: '', image_url: '', sort_order: 0 });
  const { toast } = useToast();

  const loadCategories = async () => {
    const res = await adminFetch('/categories/');
    if (res.ok) setCategories(await res.json());
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenAddDialog = () => {
    setEditingCategory(null);
    setFormData({ id: '', name: '', description: '', image_url: '', sort_order: 0 });
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({ ...category, image_url: category.image_url || '', sort_order: category.sort_order || 0 });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingCategory ? `/categories/${editingCategory.id}` : '/categories/';
    const method = editingCategory ? 'PUT' : 'POST';

    // For PUT, we only send fields that can be updated. The ID is in the URL.
    const body = editingCategory
      ? { name: formData.name, description: formData.description, image_url: formData.image_url, sort_order: Number(formData.sort_order) }
      : { ...formData, sort_order: Number(formData.sort_order) };

    try {
      const res = await adminFetch(url, {
        method,
        body: JSON.stringify(body)
      });
      if (res.ok) {
        toast({ title: `Category ${editingCategory ? 'updated' : 'created'}` });
        setIsDialogOpen(false);
        loadCategories();
      } else {
        throw new Error('Failed');
      }
    } catch (e) {
      toast({ title: "Error", description: `Could not ${editingCategory ? 'update' : 'create'} category`, variant: "destructive" });
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-display">Categories</h1>
        <Button onClick={handleOpenAddDialog} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Category
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-none border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>ID (slug)</Label>
              <Input placeholder="e.g. collars" value={formData.id} onChange={e => setFormData({ ...formData, id: e.target.value })} required disabled={!!editingCategory} />
            </div>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input placeholder="e.g. Collars" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input placeholder="Short description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input placeholder="https://..." value={formData.image_url} onChange={e => setFormData({ ...formData, image_url: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Sort Order</Label>
              <Input type="number" value={formData.sort_order} onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })} />
            </div>
            <Button type="submit" className="w-full !mt-6">{editingCategory ? 'Save Changes' : 'Create Category'}</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* List */}
      <div className="space-y-4">
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-start justify-between p-4 bg-card border border-border">
            <div className="flex gap-4">
              {cat.image_url && (
                <div className="w-16 h-16 bg-secondary flex-shrink-0">
                  <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div>
                <h3 className="font-medium">{cat.name}</h3>
                <p className="text-sm text-muted-foreground">{cat.description}</p>
                <p className="text-xs text-muted-foreground font-mono mt-1">ID: {cat.id}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(cat)}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id)} className="text-destructive hover:bg-destructive/10">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <p className="text-muted-foreground text-center py-8">No categories found.</p>
        )}
      </div>
    </div>
  );
};

export default AdminCategories;