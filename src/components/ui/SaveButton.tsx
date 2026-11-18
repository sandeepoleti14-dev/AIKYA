import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useApp } from '@/hooks/useApp';

interface SaveButtonProps {
  id: string;
  title: string;
  className?: string;
}

export default function SaveButton({ id, title, className = '' }: SaveButtonProps) {
  const { isSaved, toggleSaved, notify } = useApp();
  const saved = isSaved(id);

  const handleClick = () => {
    const nowSaved = toggleSaved(id);
    notify(nowSaved ? `"${title}" saved to your dashboard` : `"${title}" removed from saved`);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${title} from saved` : `Save ${title}`}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition duration-300 active:scale-90 ${
        saved
          ? 'border-violet/50 bg-violet/15 text-violet-accent'
          : 'border-line/10 text-muted hover:border-violet/40 hover:text-ink'
      } ${className}`}
    >
      {saved ? (
        <BookmarkCheck className="h-[18px] w-[18px] animate-fade-in" aria-hidden="true" />
      ) : (
        <Bookmark className="h-[18px] w-[18px]" aria-hidden="true" />
      )}
    </button>
  );
}
