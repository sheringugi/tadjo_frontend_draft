import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, Send, Video, Mail, Calendar, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import trainingHero from '@/assets/training.jpeg'; // Reusing existing asset or use your specific one

const TrainingPage = () => {
  const { t } = useTranslation('common');
  const [modalOpen, setModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    dogName: '',
    breed: '',
    age: '',
    preferredTime: '',
    issues: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Booking request:", form);
    setSubmitted(true);
  };

  const openModal = () => {
    setModalOpen(true);
    setSubmitted(false);
    setForm({ name: '', email: '', dogName: '', breed: '', age: '', preferredTime: '', issues: '' });
  };

  const closeModal = () => setModalOpen(false);

  return (
    <div className="pt-24 md:pt-32">
      <div className="container mx-auto">
        {/* Hero */}
        <section className="grid md:grid-cols-2 min-h-[480px] border border-border overflow-hidden">
          <div className="bg-secondary/30 overflow-hidden">
            <img src={trainingHero} alt="Training context" className="w-full h-full object-cover" />
          </div>
          <div className="p-8 md:p-16 flex flex-col justify-center bg-background">
            <p className="text-xs tracking-wide-luxury uppercase text-muted-foreground mb-4">Dog Teaching · Online Sessions</p>
            <h1 className="text-5xl md:text-6xl font-display font-normal text-foreground mb-6 leading-tight">
              Gentle guidance for every dog
            </h1>
            <p className="text-muted-foreground mb-8 max-w-md leading-relaxed">
              Behavioural challenges are not flaws. They are calls for understanding.
              Our programme works with your dog's nature, not against it.
            </p>
            <div className="text-2xl font-display font-normal mb-8">
              CHF 350 <span className="text-sm font-normal text-muted-foreground ml-2">· full programme</span>
            </div>
            <Button variant="outline" className="w-fit rounded-none px-10 h-12 text-xs tracking-luxury uppercase" onClick={openModal}>
              Book a session
            </Button>
          </div>
        </section>

        {/* How it works */}
        <section className="py-24 border-x border-border">
          <p className="text-xs tracking-wide-luxury uppercase text-muted-foreground mb-12 text-center">How it works</p>
          <div className="grid md:grid-cols-3">
            {[
              { num: "01", title: "Tell us about your dog", desc: "Fill in our intake form with your dog's breed, age, and behavioural concerns." },
              { num: "02", title: "We review and schedule", desc: "We review your submission and reply within 48 hours with a confirmed date and payment link." },
              { num: "03", title: "Train online together", desc: "Join your personalised video session and begin the transformation with expert guidance." },
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
          <p className="text-xs tracking-wide-luxury uppercase text-muted-foreground mb-12 text-center">Behavioural issues we address</p>
          <div className="grid grid-cols-2 md:grid-cols-3">
            {[
              "Excessive barking", "Leash pulling", "Aggression towards people",
              "Aggression towards other dogs", "Separation anxiety", "Destructive behaviour",
              "Jumping on people", "Fear and anxiety", "Basic obedience",
            ].map((issue) => (
              <div className="p-6 border border-border/40 text-sm font-medium text-foreground text-center" key={issue}>
                {issue}
              </div>
            ))}
          </div>
        </section>

        {/* What is included */}
        <section className="py-24 border-x border-b border-border mb-24">
          <p className="text-xs tracking-wide-luxury uppercase text-muted-foreground mb-12 text-center">What is included</p>
          <div className="grid lg:grid-cols-5 gap-12 px-8 md:px-16">
            <div className="lg:col-span-2 space-y-6">
              <div className="text-6xl font-display font-normal">
                <span className="text-2xl align-top">CHF </span>350
              </div>
              <p className="text-xs tracking-wide-luxury uppercase text-muted-foreground italic">one-time payment · online sessions</p>
              <p className="text-muted-foreground leading-relaxed">
                A complete programme designed around your dog as an individual.
                No generic advice — every session is built on what you share with us in your intake.
              </p>
              <div className="pt-6 border-t border-border flex items-start gap-4 text-xs text-muted-foreground leading-relaxed italic">
                <Video className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                <span>All sessions are conducted via video call. You will receive written notes after
                each session and have email access to your trainer between appointments.</span>
              </div>
              <Button variant="outline" className="w-full rounded-none h-12 text-xs tracking-luxury uppercase mt-8" onClick={openModal}>
                Book a session
              </Button>
            </div>
            <div className="lg:col-span-3">
              <ul className="divide-y divide-border">
                {[
                  { icon: Calendar, name: "Intake assessment", meta: "60 min", desc: "A deep dive into your dog's history, environment, and specific behaviours." },
                  { icon: Video, name: "Training sessions", meta: "3 x 45 min", desc: "Structured online sessions where you learn techniques to apply with your dog daily." },
                  { icon: CheckCircle2, name: "Progress review", meta: "30 min", desc: "A final check-in to assess progress and set you up for long-term success." },
                  { icon: Mail, name: "Email support", meta: "4 weeks", desc: "Direct access to your trainer throughout the programme for questions between sessions." },
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
                    <h2 className="text-3xl font-display font-normal mb-2 text-foreground">Book your <em>session</em></h2>
                    <p className="text-sm text-muted-foreground italic font-light">We will be in touch within 48 hours to confirm your schedule.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Your name</Label>
                        <Input name="name" value={form.name} onChange={handleChange} placeholder="Jane" required className="rounded-none bg-transparent border-0 border-b border-border focus:border-foreground transition-colors" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Email address</Label>
                        <Input name="email" type="email" value={form.email} onChange={handleChange} placeholder="jane@email.com" required className="rounded-none bg-transparent border-0 border-b border-border focus:border-foreground transition-colors" />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Dog's name</Label>
                        <Input name="dogName" value={form.dogName} onChange={handleChange} placeholder="Dollar" required className="rounded-none bg-transparent border-0 border-b border-border focus:border-foreground transition-colors" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Breed</Label>
                        <Input name="breed" value={form.breed} onChange={handleChange} placeholder="Mixed breed" required className="rounded-none bg-transparent border-0 border-b border-border focus:border-foreground transition-colors" />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Dog's age</Label>
                        <Input name="age" value={form.age} onChange={handleChange} placeholder="2 years" required className="rounded-none bg-transparent border-0 border-b border-border focus:border-foreground transition-colors" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Preferred time</Label>
                        <Select value={form.preferredTime} onValueChange={(v) => setForm({...form, preferredTime: v})} required>
                          <SelectTrigger className="rounded-none bg-transparent border-0 border-b border-border focus:ring-0 focus:ring-offset-0 px-0 focus:border-foreground transition-colors h-10 text-left">
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent className="rounded-none z-[110]">
                            <SelectItem value="morning">Weekday mornings</SelectItem>
                            <SelectItem value="afternoon">Weekday afternoons</SelectItem>
                            <SelectItem value="weekend">Weekends</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Describe the issues</Label>
                      <Textarea name="issues" value={form.issues} onChange={handleChange} rows={3} placeholder="Tell us what you are experiencing..." required className="rounded-none bg-transparent border-0 border-b border-border focus:border-foreground transition-colors resize-none" />
                    </div>
                    <Button type="submit" className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-none h-12 text-xs tracking-luxury uppercase">
                      <Send className="w-4 h-4 mr-2" />
                      Send request
                    </Button>
                  </form>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-6">✦</div>
                  <h3 className="text-2xl font-display mb-4">Thank you</h3>
                  <p className="text-muted-foreground font-light italic leading-relaxed">We have received your request and will be in touch<br />within 48 hours to confirm your session.</p>
                  <Button variant="outline" className="mt-10 rounded-none h-12 text-xs tracking-luxury uppercase px-12" onClick={closeModal}>
                    Close
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