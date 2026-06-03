import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation, Trans } from 'react-i18next';
import { X, Send, Video, Mail, Calendar, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import trainingHero from '@/assets/training.jpeg'; // Reusing existing asset or use your specific one
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { usePageContent } from '@/hooks/usePageContent';

const TrainingPage = () => {
  const { t } = useTranslation('common');
  const { toast } = useToast();
  const navigate = useNavigate();
  const { content, loading } = usePageContent('training');
  const [modalOpen, setModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loadingServices, setLoadingServices] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    dogName: '',
    breed: '',
    age: '',
    preferredTime: '',
    issues: '',
  });

  // Fetch available services to find the training program ID
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/services/`);
        if (response.ok) {
          const data = await response.json();
          // Find the service that represents the training program (CHF 350)
          const trainingService = data.find((s: any) => s.price === 350 || s.name.toLowerCase().includes('training'));
          if (trainingService) {
            setServiceId(trainingService.id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch services:", error);
      } finally {
        setLoadingServices(false);
      }
    };

    fetchServices();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: t('auth.loginRequired', { defaultValue: 'Login Required' }),
        description: t('auth.pleaseLoginToBook', { defaultValue: 'Please log in to book a session.' }),
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    if (!serviceId) {
      toast({
        title: "Service Error",
        description: "Training program not found in catalog. Please contact support.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/bookings/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          service_id: serviceId,
          dog_name: form.dogName,
          dog_breed: form.breed,
          dog_age: form.age,
          preferred_time: form.preferredTime,
          issues: form.issues,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create booking");
      }
    } catch (error: any) {
      toast({
        title: "Booking Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openModal = () => {
    setModalOpen(true);
    setSubmitted(false);
    setForm({ name: '', email: '', dogName: '', breed: '', age: '', preferredTime: '', issues: '' });
  };

  const closeModal = () => setModalOpen(false);

  if (loading || loadingServices) return null;

  return (
    <div className="pt-24 md:pt-32">
      <div className="container mx-auto">
        {/* Hero */}
        <section className="grid md:grid-cols-2 min-h-[480px] border border-border overflow-hidden">
          <div className="bg-secondary/30 overflow-hidden">
            <img src={trainingHero} alt="Training context" className="w-full h-full object-cover" />
          </div>
          <div className="p-8 md:p-16 flex flex-col justify-center bg-background">
            <p className="text-xs tracking-wide-luxury uppercase text-muted-foreground mb-4">
              {content.hero_sub || t('training.heroSub')}
            </p>
            <h1 className="text-5xl md:text-6xl font-display font-normal text-foreground mb-6 leading-tight">
              {content.hero_heading || t('training.heroHeading')}
            </h1>
            <p className="text-muted-foreground mb-8 max-w-md leading-relaxed">
              {content.hero_description || t('training.heroDescription')}
            </p>
            <div className="text-2xl font-display font-normal mb-8">
              CHF {content.program_price || '350'} <span className="text-sm font-normal text-muted-foreground ml-2">· {content.price_suffix || t('training.priceSuffix')}</span>
            </div>
            <Button variant="outline" className="w-fit rounded-none px-10 h-12 text-xs tracking-luxury uppercase" onClick={openModal}>
              {t('training.buttonBook')}
            </Button>
          </div>
        </section>

        {/* How it works */}
        <section className="py-24 border-x border-border">
          <p className="text-xs tracking-wide-luxury uppercase text-muted-foreground mb-12 text-center">
            {content.how_it_works_heading || t('training.howItWorksHeading')}
          </p>
          <div className="grid md:grid-cols-3">
            {[
              { num: "01", title: content.step1_title || t('training.step1Title'), desc: content.step1_desc || t('training.step1Desc') },
              { num: "02", title: content.step2_title || t('training.step2Title'), desc: content.step2_desc || t('training.step2Desc') },
              { num: "03", title: content.step3_title || t('training.step3Title'), desc: content.step3_desc || t('training.step3Desc') },
            ].map((step, i) => (
              <div className={`p-8 ${i < 2 ? 'md:border-r border-border' : ''} ${i > 0 ? 'border-t md:border-t-0 border-border' : ''}`} key={step.num}>
                <div className="text-4xl font-display text-muted-foreground/30 mb-6 italic">{step.num}</div>
                <h3 className="font-display text-xl mb-4">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Behavioural issues */}
        <section className="py-24 border border-border">
          <p className="text-xs tracking-wide-luxury uppercase text-muted-foreground mb-12 text-center">
            {content.issues_heading || t('training.issuesHeading')}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3">
            {(content.issues_list 
              ? content.issues_list.split(',').map(i => i.trim())
              : [
                  t('training.issueBarking'), t('training.issueLeash'), t('training.issueAggressionPeople'),
                  t('training.issueAggressionDogs'), t('training.issueAnxiety'), t('training.issueDestruction'),
                  t('training.issueJumping'), t('training.issueFear'), t('training.issueObedience'),
                ]
            ).map((issue) => (
              <div className="p-6 border border-border/40 text-sm font-medium text-foreground text-center" key={issue}>
                {issue}
              </div>
            ))}
          </div>
        </section>

        {/* What is included */}
        <section className="py-24 border-x border-b border-border mb-24">
          <p className="text-xs tracking-wide-luxury uppercase text-muted-foreground mb-12 text-center">
            {content.included_heading || t('training.includedHeading')}
          </p>
          <div className="grid lg:grid-cols-5 gap-12 px-8 md:px-16">
            <div className="lg:col-span-2 space-y-6">
              <div className="text-6xl font-display font-normal">
                <span className="text-2xl align-top">CHF </span>{content.program_price || '350'}
              </div>
              <p className="text-xs tracking-wide-luxury uppercase text-muted-foreground italic">{t('training.includedSub')}</p>
              <p className="text-muted-foreground leading-relaxed">
                {content.program_description || t('training.includedDescription')}
              </p>
              <div className="pt-6 border-t border-border flex items-start gap-4 text-xs text-muted-foreground leading-relaxed italic">
                <Video className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                <span>{content.video_note || t('training.videoNote')}</span>
              </div>
              <Button variant="outline" className="w-full rounded-none h-12 text-xs tracking-luxury uppercase mt-8" onClick={openModal}>
                {t('training.buttonBook')}
              </Button>
            </div>
            <div className="lg:col-span-3">
              <ul className="divide-y divide-border">
                {[
                  { icon: Calendar, name: content.item1_title || t('training.itemAssessmentTitle'), meta: content.item1_meta || t('training.itemAssessmentMeta'), desc: content.item1_desc || t('training.itemAssessmentDesc') },
                  { icon: Video, name: content.item2_title || t('training.itemSessionsTitle'), meta: content.item2_meta || t('training.itemSessionsMeta'), desc: content.item2_desc || t('training.itemSessionsDesc') },
                  { icon: CheckCircle2, name: content.item3_title || t('training.itemReviewTitle'), meta: content.item3_meta || t('training.itemReviewMeta'), desc: content.item3_desc || t('training.itemReviewDesc') },
                  { icon: Mail, name: content.item4_title || t('training.itemSupportTitle'), meta: content.item4_meta || t('training.itemSupportMeta'), desc: content.item4_desc || t('training.itemSupportDesc') },
                ].map((item) => (
                  <li className="py-6 first:pt-0 last:pb-0" key={item.name}>
                    <div className="flex justify-between items-baseline mb-2">
                      <h4 className="text-foreground font-display text-xl font-normal flex items-center gap-3">
                        <item.icon className="w-4 h-4 text-muted-foreground" />
                        {item.name}
                      </h4>
                      <span className="text-xs tracking-widest uppercase text-muted-foreground">{item.meta}</span>
                    </div>
                    <p className="text-sm text-muted-foreground ml-7 leading-relaxed font-light">{item.desc}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-background w-full max-w-xl max-h-[90vh] overflow-y-auto border border-border p-8 md:p-12 relative shadow-2xl"
            >
              <button onClick={closeModal} className="absolute top-6 right-6 text-muted-foreground hover:text-foreground">
                <X className="w-6 h-6" />
              </button>

              {!submitted ? (
                <>
                  <div className="mb-10">
                    <h2 className="text-3xl font-display font-normal mb-2 text-foreground">
                      <Trans 
                        defaults={content.modal_heading || t('training.modalHeading')} 
                        components={{ em: <em /> }} 
                      />
                    </h2>
                    <p className="text-sm text-muted-foreground italic font-light">
                      {content.modal_subheading || t('training.modalSub')}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">{t('training.formName')}</Label>
                        <Input name="name" value={form.name} onChange={handleChange} placeholder={t('training.formNamePlaceholder')} required className="rounded-none bg-transparent border-0 border-b border-border focus:border-foreground transition-colors" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">{t('training.formEmail')}</Label>
                        <Input name="email" type="email" value={form.email} onChange={handleChange} placeholder={t('training.formEmailPlaceholder')} required className="rounded-none bg-transparent border-0 border-b border-border focus:border-foreground transition-colors" />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">{t('training.formDogName')}</Label>
                        <Input name="dogName" value={form.dogName} onChange={handleChange} placeholder={t('training.formDogNamePlaceholder')} required className="rounded-none bg-transparent border-0 border-b border-border focus:border-foreground transition-colors" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">{t('training.formBreed')}</Label>
                        <Input name="breed" value={form.breed} onChange={handleChange} placeholder={t('training.formBreedPlaceholder')} required className="rounded-none bg-transparent border-0 border-b border-border focus:border-foreground transition-colors" />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">{t('training.formAge')}</Label>
                        <Input name="age" value={form.age} onChange={handleChange} placeholder={t('training.formAgePlaceholder')} required className="rounded-none bg-transparent border-0 border-b border-border focus:border-foreground transition-colors" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">{t('training.formTime')}</Label>
                        <Select value={form.preferredTime} onValueChange={(v) => setForm({...form, preferredTime: v})} required>
                          <SelectTrigger className="rounded-none bg-transparent border-0 border-b border-border focus:ring-0 focus:ring-offset-0 px-0 focus:border-foreground transition-colors h-10 text-left">
                            <SelectValue placeholder={t('training.formTimePlaceholder')} />
                          </SelectTrigger>
                          <SelectContent className="rounded-none z-[110]">
                            <SelectItem value="morning">{t('training.timeMorning')}</SelectItem>
                            <SelectItem value="afternoon">{t('training.timeAfternoon')}</SelectItem>
                            <SelectItem value="weekend">{t('training.timeWeekend')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">{t('training.formIssues')}</Label>
                      <Textarea name="issues" value={form.issues} onChange={handleChange} rows={3} placeholder={t('training.formIssuesPlaceholder')} required className="rounded-none bg-transparent border-0 border-b border-border focus:border-foreground transition-colors resize-none" />
                    </div>
                    <Button 
                      type="submit" 
                      disabled={submitting || loadingServices}
                      className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-none h-12 text-xs tracking-luxury uppercase"
                    >
                      {submitting ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      {submitting ? t('common.sending', { defaultValue: 'Sending...' }) : (content.form_button || t('training.formButton'))}
                    </Button>
                  </form>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-6">✦</div>
                  <h3 className="text-2xl font-display mb-4">
                    {content.success_heading || t('training.successHeading')}
                  </h3>
                  <p className="text-muted-foreground font-light italic leading-relaxed">
                    <Trans 
                      defaults={content.success_description || t('training.successDescription')} 
                      components={{ br: <br /> }} 
                    />
                  </p>
                  <Button variant="outline" className="mt-10 rounded-none h-12 text-xs tracking-luxury uppercase px-12" onClick={closeModal}>
                    {t('training.buttonClose')}
                  </Button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TrainingPage;