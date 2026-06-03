import { useState, useEffect } from 'react';
import { Save, Layout, GraduationCap, Info, Loader2, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { adminFetch } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

const PAGES = [
  { slug: 'home', name: 'Home Page', icon: Layout },
  { slug: 'about', name: 'About Us', icon: Info },
  { slug: 'training', name: 'Training', icon: GraduationCap },
];

const ContentManagement = () => {
  const [selectedPage, setSelectedPage] = useState(PAGES[0].slug);
  const [selectedLang, setSelectedLang] = useState('en');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  // Using a record to store dynamic fields based on the page structure
  const { t, i18n } = useTranslation('common');
  const [formData, setFormData] = useState<Record<string, string>>({});
  
  const { toast } = useToast();

  const loadPageContent = async (slug: string, lang: string) => {
    setLoading(true);
    
    // Define the default values based on translations as a baseline
    const defaults: Record<string, string> = {};
    const tOptions = { lng: lang };

    if (slug === 'home') {
      defaults.hero_subheading = t('hero.subheading', tOptions);
      defaults.hero_heading1 = t('hero.heading1', tOptions);
      defaults.hero_heading2 = t('hero.heading2', tOptions);
      defaults.hero_description = t('hero.description', tOptions);
      defaults.story_heading = t('home.storyHeading', tOptions);
      defaults.story_snippet = t('home.storyText1', tOptions) + '\n\n' + t('home.storyText2', tOptions);
      defaults.story_button_text = t('home.storyButton', tOptions);
    } else if (slug === 'about') {
      defaults.hero_heading = t('about.heroHeading', tOptions);
      defaults.hero_subheading = t('about.heroSubheading', tOptions);
      defaults.story_title = t('about.storyTitle', tOptions);
      defaults.story_full = t('about.storyText1', tOptions) + '\n\n' + t('about.storyText2', tOptions) + '\n\n' + t('about.storyText3', tOptions) + '\n\n' + t('about.storyText4', tOptions) + '\n\n' + t('about.storyText5', tOptions);
      defaults.mission_subheading = t('about.missionSubheading', tOptions);
      defaults.mission_heading = t('about.missionHeading', tOptions);
      defaults.mission_description = t('about.missionDescription', tOptions);
      defaults.mission1_title = t('about.mission1Title', tOptions);
      defaults.mission1_desc = t('about.mission1Desc', tOptions);
      defaults.mission2_title = t('about.mission2Title', tOptions);
      defaults.mission2_desc = t('about.mission2Desc', tOptions);
      defaults.mission3_title = t('about.mission3Title', tOptions);
      defaults.mission3_desc = t('about.mission3Desc', tOptions);
      defaults.values_subheading = t('about.valuesSubheading', tOptions);
      defaults.values_heading = t('about.valuesHeading', tOptions);
      defaults.value1_title = t('about.value1Title', tOptions);
      defaults.value1_desc = t('about.value1Desc', tOptions);
      defaults.value2_title = t('about.value2Title', tOptions);
      defaults.value2_desc = t('about.value2Desc', tOptions);
      defaults.value3_title = t('about.value3Title', tOptions);
      defaults.value3_desc = t('about.value3Desc', tOptions);
      defaults.cta_heading = t('about.ctaHeading', tOptions);
      defaults.cta_description = t('about.ctaDescription', tOptions);
      defaults.cta_button_text = t('about.ctaButton', tOptions);
    } else if (slug === 'training') {
      defaults.hero_sub = t('training.heroSub', tOptions);
      defaults.hero_heading = t('training.heroHeading', tOptions);
      defaults.hero_description = t('training.heroDescription', tOptions);
      defaults.program_price = '350';
      defaults.price_suffix = t('training.priceSuffix', tOptions);
      defaults.how_it_works_heading = t('training.howItWorksHeading', tOptions);
      defaults.step1_title = t('training.step1Title', tOptions);
      defaults.step1_desc = t('training.step1Desc', tOptions);
      defaults.step2_title = t('training.step2Title', tOptions);
      defaults.step2_desc = t('training.step2Desc', tOptions);
      defaults.step3_title = t('training.step3Title', tOptions);
      defaults.step3_desc = t('training.step3Desc', tOptions);
      defaults.issues_heading = t('training.issuesHeading', tOptions);
      defaults.included_heading = t('training.includedHeading', tOptions);
      defaults.program_description = t('training.includedDescription', tOptions);
      defaults.item1_title = t('training.itemAssessmentTitle', tOptions);
      defaults.item1_meta = t('training.itemAssessmentMeta', tOptions);
      defaults.item1_desc = t('training.itemAssessmentDesc', tOptions);
      defaults.item2_title = t('training.itemSessionsTitle', tOptions);
      defaults.item2_meta = t('training.itemSessionsMeta', tOptions);
      defaults.item2_desc = t('training.itemSessionsDesc', tOptions);
      defaults.item3_title = t('training.itemReviewTitle', tOptions);
      defaults.item3_meta = t('training.itemReviewMeta', tOptions);
      defaults.item3_desc = t('training.itemReviewDesc', tOptions);
      defaults.item4_title = t('training.itemSupportTitle', tOptions);
      defaults.item4_meta = t('training.itemSupportMeta', tOptions);
      defaults.item4_desc = t('training.itemSupportDesc', tOptions);
      defaults.issues_list = [
        t('training.issueBarking', tOptions), t('training.issueLeash', tOptions), t('training.issueAggressionPeople', tOptions),
        t('training.issueAggressionDogs', tOptions), t('training.issueAnxiety', tOptions), t('training.issueDestruction', tOptions),
        t('training.issueJumping', tOptions), t('training.issueFear', tOptions), t('training.issueObedience', tOptions),
      ].join(', ');
      defaults.video_note = t('training.videoNote', tOptions);
      defaults.modal_heading = t('training.modalHeading', tOptions);
      defaults.modal_subheading = t('training.modalSub', tOptions);
      defaults.form_button = t('training.formButton', tOptions);
      defaults.success_heading = t('training.successHeading', tOptions);
      defaults.success_description = t('training.successDescription', tOptions);
    }
    try {
      const res = await adminFetch(`/admin/pages/${slug}/?lang=${lang}`);
      if (res.ok) {
        const data = await res.json();
        // Merge: Values saved in the database override the baseline translations
        setFormData({ ...defaults, ...(data.content || {}) });
      } else {
        // If no database entry exists yet, pre-fill with translations
        setFormData(defaults);
      }
    } catch (error) {
      console.error("Failed to load page content", error);
      setFormData(defaults);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPageContent(selectedPage, selectedLang);
  }, [selectedPage, selectedLang]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await adminFetch(`/admin/pages/${selectedPage}/?lang=${selectedLang}`, {
        method: 'PUT',
        body: JSON.stringify({ content: formData }),
      });
      if (res.ok) {
        toast({ title: 'Success', description: `${selectedPage} content updated.` });
      } else {
        throw new Error();
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update content.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const renderFields = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin mb-2" />
          <p>Loading page structure...</p>
        </div>
      );
    }

    switch (selectedPage) {
      case 'home':
        return (
          <>
            <div className="space-y-2">
              <Label>Hero Subheading</Label>
              <Input value={formData.hero_subheading || ''} onChange={e => handleInputChange('hero_subheading', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Hero Heading (Line 1)</Label>
              <Input value={formData.hero_heading1 || ''} onChange={e => handleInputChange('hero_heading1', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Hero Heading (Line 2)</Label>
              <Input value={formData.hero_heading2 || ''} onChange={e => handleInputChange('hero_heading2', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Hero Description</Label>
              <Textarea value={formData.hero_description || ''} onChange={e => handleInputChange('hero_description', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Our Story Heading</Label>
              <Input value={formData.story_heading || ''} onChange={e => handleInputChange('story_heading', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Our Story Snippet (Home Page)</Label>
              <Textarea className="h-32" value={formData.story_snippet || ''} onChange={e => handleInputChange('story_snippet', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Our Story Button Text</Label>
              <Input value={formData.story_button_text || ''} onChange={e => handleInputChange('story_button_text', e.target.value)} />
            </div>
          </>
        );
      case 'about':
        return (
          <>
            <div className="space-y-2">
              <Label>Hero Heading</Label>
              <Input value={formData.hero_heading || ''} onChange={e => handleInputChange('hero_heading', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Hero Subheading</Label>
              <Input value={formData.hero_subheading || ''} onChange={e => handleInputChange('hero_subheading', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Story Title</Label>
              <Input value={formData.story_title || ''} onChange={e => handleInputChange('story_title', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Main Story Content</Label>
              <CardDescription className="mb-2">Enter the full "Story of Tajana & Dollar" here.</CardDescription>
              <Textarea className="min-h-[300px]" value={formData.story_full || ''} onChange={e => handleInputChange('story_full', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Mission Subheading</Label>
              <Input value={formData.mission_subheading || ''} onChange={e => handleInputChange('mission_subheading', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Mission Heading</Label>
              <Input value={formData.mission_heading || ''} onChange={e => handleInputChange('mission_heading', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Mission Statement</Label>
              <Textarea value={formData.mission_description || ''} onChange={e => handleInputChange('mission_description', e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
              <div className="space-y-2">
                <Label>Mission 1 Title</Label>
                <Input value={formData.mission1_title || ''} onChange={e => handleInputChange('mission1_title', e.target.value)} />
                <Textarea value={formData.mission1_desc || ''} onChange={e => handleInputChange('mission1_desc', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Mission 2 Title</Label>
                <Input value={formData.mission2_title || ''} onChange={e => handleInputChange('mission2_title', e.target.value)} />
                <Textarea value={formData.mission2_desc || ''} onChange={e => handleInputChange('mission2_desc', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Mission 3 Title</Label>
                <Input value={formData.mission3_title || ''} onChange={e => handleInputChange('mission3_title', e.target.value)} />
                <Textarea value={formData.mission3_desc || ''} onChange={e => handleInputChange('mission3_desc', e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Values Subheading</Label>
              <Input value={formData.values_subheading || ''} onChange={e => handleInputChange('values_subheading', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Values Heading</Label>
              <Input value={formData.values_heading || ''} onChange={e => handleInputChange('values_heading', e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
              <div className="space-y-2">
                <Label>Value 1 Title</Label>
                <Input value={formData.value1_title || ''} onChange={e => handleInputChange('value1_title', e.target.value)} />
                <Textarea value={formData.value1_desc || ''} onChange={e => handleInputChange('value1_desc', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Value 2 Title</Label>
                <Input value={formData.value2_title || ''} onChange={e => handleInputChange('value2_title', e.target.value)} />
                <Textarea value={formData.value2_desc || ''} onChange={e => handleInputChange('value2_desc', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Value 3 Title</Label>
                <Input value={formData.value3_title || ''} onChange={e => handleInputChange('value3_title', e.target.value)} />
                <Textarea value={formData.value3_desc || ''} onChange={e => handleInputChange('value3_desc', e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>CTA Heading</Label>
              <Input value={formData.cta_heading || ''} onChange={e => handleInputChange('cta_heading', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>CTA Description</Label>
              <Textarea value={formData.cta_description || ''} onChange={e => handleInputChange('cta_description', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>CTA Button Text</Label>
              <Input value={formData.cta_button_text || ''} onChange={e => handleInputChange('cta_button_text', e.target.value)} />
            </div>
          </>
        );
      case 'training':
        return (
          <>
            <div className="space-y-2">
              <Label>Hero Subheading</Label>
              <Input value={formData.hero_sub || ''} onChange={e => handleInputChange('hero_sub', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Hero Heading</Label>
              <Input value={formData.hero_heading || ''} onChange={e => handleInputChange('hero_heading', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Hero Description</Label>
              <Textarea value={formData.hero_description || ''} onChange={e => handleInputChange('hero_description', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Program Price (CHF)</Label>
                <Input value={formData.program_price || ''} onChange={e => handleInputChange('program_price', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Price Suffix</Label>
                <Input value={formData.price_suffix || ''} onChange={e => handleInputChange('price_suffix', e.target.value)} />
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h3 className="font-medium text-sm border-b pb-2">How It Works</h3>
              <div className="space-y-2">
                <Label>Section Heading</Label>
                <Input value={formData.how_it_works_heading || ''} onChange={e => handleInputChange('how_it_works_heading', e.target.value)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Step 1 Title & Description</Label>
                  <Input placeholder="Title" value={formData.step1_title || ''} onChange={e => handleInputChange('step1_title', e.target.value)} />
                  <Textarea placeholder="Description" value={formData.step1_desc || ''} onChange={e => handleInputChange('step1_desc', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Step 2 Title & Description</Label>
                  <Input placeholder="Title" value={formData.step2_title || ''} onChange={e => handleInputChange('step2_title', e.target.value)} />
                  <Textarea placeholder="Description" value={formData.step2_desc || ''} onChange={e => handleInputChange('step2_desc', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Step 3 Title & Description</Label>
                  <Input placeholder="Title" value={formData.step3_title || ''} onChange={e => handleInputChange('step3_title', e.target.value)} />
                  <Textarea placeholder="Description" value={formData.step3_desc || ''} onChange={e => handleInputChange('step3_desc', e.target.value)} />
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <Label>Behavioural Issues Heading</Label>
              <Input value={formData.issues_heading || ''} onChange={e => handleInputChange('issues_heading', e.target.value)} />
            </div>

            <div className="space-y-4 pt-4">
              <h3 className="font-medium text-sm border-b pb-2">What is Included</h3>
              <div className="space-y-2">
                <Label>Included Heading</Label>
                <Input value={formData.included_heading || ''} onChange={e => handleInputChange('included_heading', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Summary Description</Label>
                <Textarea value={formData.program_description || ''} onChange={e => handleInputChange('program_description', e.target.value)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                <div className="space-y-2 p-3 border">
                  <Label>Item 1 (Intake)</Label>
                  <Input placeholder="Title" value={formData.item1_title || ''} onChange={e => handleInputChange('item1_title', e.target.value)} />
                  <Input placeholder="Meta" value={formData.item1_meta || ''} onChange={e => handleInputChange('item1_meta', e.target.value)} />
                  <Textarea placeholder="Description" value={formData.item1_desc || ''} onChange={e => handleInputChange('item1_desc', e.target.value)} />
                </div>
                <div className="space-y-2 p-3 border">
                  <Label>Item 2 (Sessions)</Label>
                  <Input placeholder="Title" value={formData.item2_title || ''} onChange={e => handleInputChange('item2_title', e.target.value)} />
                  <Input placeholder="Meta" value={formData.item2_meta || ''} onChange={e => handleInputChange('item2_meta', e.target.value)} />
                  <Textarea placeholder="Description" value={formData.item2_desc || ''} onChange={e => handleInputChange('item2_desc', e.target.value)} />
                </div>
                <div className="space-y-2 p-3 border">
                  <Label>Item 3 (Review)</Label>
                  <Input placeholder="Title" value={formData.item3_title || ''} onChange={e => handleInputChange('item3_title', e.target.value)} />
                  <Input placeholder="Meta" value={formData.item3_meta || ''} onChange={e => handleInputChange('item3_meta', e.target.value)} />
                  <Textarea placeholder="Description" value={formData.item3_desc || ''} onChange={e => handleInputChange('item3_desc', e.target.value)} />
                </div>
                <div className="space-y-2 p-3 border">
                  <Label>Item 4 (Support)</Label>
                  <Input placeholder="Title" value={formData.item4_title || ''} onChange={e => handleInputChange('item4_title', e.target.value)} />
                  <Input placeholder="Meta" value={formData.item4_meta || ''} onChange={e => handleInputChange('item4_meta', e.target.value)} />
                  <Textarea placeholder="Description" value={formData.item4_desc || ''} onChange={e => handleInputChange('item4_desc', e.target.value)} />
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <Label>Behavioural Issues List (Comma separated)</Label>
              <Textarea value={formData.issues_list || ''} onChange={e => handleInputChange('issues_list', e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Video Call Note (Italicized text)</Label>
              <Input value={formData.video_note || ''} onChange={e => handleInputChange('video_note', e.target.value)} />
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-medium text-sm">Booking Dialog & Success message</h3>
              <div className="space-y-2">
                <Label>Modal Heading (use &lt;em/&gt; for italics)</Label>
                <Input value={formData.modal_heading || ''} onChange={e => handleInputChange('modal_heading', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Modal Subheading</Label>
                <Input value={formData.modal_subheading || ''} onChange={e => handleInputChange('modal_subheading', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Form Submit Button Text</Label>
                <Input value={formData.form_button || ''} onChange={e => handleInputChange('form_button', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Success Heading</Label>
                <Input value={formData.success_heading || ''} onChange={e => handleInputChange('success_heading', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Success Description (use &lt;br/&gt; for line breaks)</Label>
                <Textarea value={formData.success_description || ''} onChange={e => handleInputChange('success_description', e.target.value)} />
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display">Content Management</h1>
        <p className="text-muted-foreground text-sm">Update the text content of your customer-facing pages.</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="space-y-2">
          {PAGES.map((page) => (
            <button
              key={page.slug}
              onClick={() => setSelectedPage(page.slug)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors border ${
                selectedPage === page.slug
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-foreground border-border hover:bg-secondary'
              }`}
            >
              <page.icon className="w-4 h-4" />
              {page.name}
            </button>
          ))}
        </div>

        <div className="lg:col-span-3">
          <Card className="rounded-none border-border">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-display">Edit {PAGES.find(p => p.slug === selectedPage)?.name}</CardTitle>
                <div className="flex bg-secondary p-1 rounded-none border">
                  {['en', 'de', 'nl'].map((lang) => (
                    <button 
                      key={lang}
                      onClick={() => setSelectedLang(lang)}
                      className={`px-3 py-1 text-xs font-medium transition-colors ${selectedLang === lang ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
                    >
                      {lang === 'en' ? 'English' : lang === 'de' ? 'Deutsch' : 'Nederlands'}
                    </button>
                  ))}
                </div>
              </div>
              <CardDescription>Changes will be visible to customers immediately after saving.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {renderFields()}

                <Button type="submit" disabled={saving || loading} className="w-full lg:w-auto">
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContentManagement;