import { useState, type FormEvent } from 'react';
import { CheckCircle2, Send } from 'lucide-react';
import FormField from '@/components/forms/FormField';
import { useApp } from '@/hooks/useApp';
import { isValidEmail } from '@/utils/validation';

interface ContactValues {
  name: string;
  email: string;
  subject: string;
  message: string;
}

type ContactErrors = Partial<Record<keyof ContactValues, string>>;

const EMPTY: ContactValues = { name: '', email: '', subject: '', message: '' };

export default function ContactForm() {
  const { notify } = useApp();
  const [values, setValues] = useState<ContactValues>(EMPTY);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [sent, setSent] = useState(false);

  const update = (key: keyof ContactValues, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: ContactErrors = {};
    if (!values.name.trim()) nextErrors.name = 'Please enter your name.';
    if (!values.email.trim()) nextErrors.email = 'Please enter your email address.';
    else if (!isValidEmail(values.email)) nextErrors.email = 'Enter a valid email, for example name@example.com.';
    if (!values.subject.trim()) nextErrors.subject = 'Please add a subject.';
    if (values.message.trim().length < 20) nextErrors.message = 'Your message should be at least 20 characters.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSent(true);
    notify('Message validated. Nothing was sent.');
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center animate-fade-up">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success/15 text-success">
          <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
        </span>
        <h3 className="text-xl font-bold text-ink">Thanks, your message is validated</h3>
        <p className="max-w-md text-sm text-muted">
          This form does not send email yet. In the full product your message would reach the AIKYA team.
        </p>
        <button
          type="button"
          onClick={() => {
            setValues(EMPTY);
            setSent(false);
          }}
          className="btn-secondary"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-5 sm:grid-cols-2">
      <FormField id="contact-name" label="Name" error={errors.name}>
        <input id="contact-name" className="field" value={values.name} onChange={(e) => update('name', e.target.value)} aria-invalid={!!errors.name} />
      </FormField>
      <FormField id="contact-email" label="Email" error={errors.email}>
        <input id="contact-email" type="email" className="field" value={values.email} onChange={(e) => update('email', e.target.value)} aria-invalid={!!errors.email} />
      </FormField>
      <div className="sm:col-span-2">
        <FormField id="contact-subject" label="Subject" error={errors.subject}>
          <input id="contact-subject" className="field" value={values.subject} onChange={(e) => update('subject', e.target.value)} aria-invalid={!!errors.subject} />
        </FormField>
      </div>
      <div className="sm:col-span-2">
        <FormField id="contact-message" label="Message" error={errors.message} hint="At least 20 characters.">
          <textarea id="contact-message" rows={5} className="field resize-y" value={values.message} onChange={(e) => update('message', e.target.value)} aria-invalid={!!errors.message} />
        </FormField>
      </div>
      <div className="sm:col-span-2 flex justify-end">
        <button type="submit" className="btn-primary">
          <Send className="h-4 w-4" aria-hidden="true" />
          Send Message
        </button>
      </div>
    </form>
  );
}
