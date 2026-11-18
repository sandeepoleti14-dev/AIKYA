import { Mail, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import ContactForm from '@/pages/Contact/ContactForm';
import Reveal from '@/components/ui/Reveal';

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-20 px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <header className="mx-auto max-w-3xl text-center animate-fade-up">
        <p className="eyebrow mb-3">Contact and submit</p>
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">Share an opportunity or say hello</h1>
        <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">
          Know an opportunity that other students should see? Share it with the Aikya Community for review, or send us a general message.
        </p>
      </header>

      <section id="submit" aria-labelledby="submit-heading" className="scroll-mt-28 mx-auto max-w-3xl">
        <Reveal className="card p-6 sm:p-10">
          <div className="mb-8 flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-electric/15 text-electric">
              <Mail className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 id="submit-heading" className="text-2xl font-bold text-ink">Share with the Aikya Community</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Opportunities are published only after an administrator reviews and approves them. Sign in to track your submission.
              </p>
            </div>
          </div>
          <Link to="/community/share" className="btn-primary">Share an Opportunity</Link>
        </Reveal>
      </section>

      <section id="contact" aria-labelledby="contact-heading" className="scroll-mt-28 mx-auto max-w-3xl">
        <Reveal className="card p-6 sm:p-10">
          <div className="mb-8 flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet/15 text-violet">
              <MessageSquare className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 id="contact-heading" className="text-2xl font-bold text-ink">Contact us</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">Questions, partnerships or feedback about AIKYA.</p>
            </div>
          </div>
          <ContactForm />
        </Reveal>
      </section>
    </div>
  );
}
