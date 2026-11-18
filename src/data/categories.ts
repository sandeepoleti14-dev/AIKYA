import type { LucideIcon } from 'lucide-react';
import {
  Award,
  BookOpen,
  Briefcase,
  Code,
  Presentation,
  Rocket,
  Trophy,
  Users,
  Wrench,
} from 'lucide-react';
import type { Category } from '@/types';

interface CategoryMeta extends Category {
  icon: LucideIcon;
}

export const OPPORTUNITY_CATEGORIES: CategoryMeta[] = [
  { id: 'hackathons', label: 'Hackathons', description: 'Build something real in a weekend with teams.', icon: Code },
  { id: 'workshops', label: 'Workshops', description: 'Focused sessions to learn a new tool.', icon: Wrench },
  { id: 'webinars', label: 'Webinars', description: 'Talks and live sessions from practitioners.', icon: Presentation },
  { id: 'competitions', label: 'Competitions', description: 'Challenge yourself against the best.', icon: Trophy },
  { id: 'conferences', label: 'Conferences', description: 'Meet the community and learn from speakers.', icon: Users },
];

export const JOB_CATEGORIES: CategoryMeta[] = [
  { id: 'jobs', label: 'Jobs', description: 'India-based roles from selected official job boards.', icon: Briefcase },
];

export const TECH_DOMAINS = [
  'Artificial Intelligence and Machine Learning',
  'Cybersecurity',
  'Cloud Computing',
  'Software Development',
  'Web Development',
  'App Development',
  'Data Science and Analytics',
  'Internet of Things',
  'Blockchain and Web3',
  'UI/UX Design',
  'DevOps',
  'Networking',
  'Open Source',
];

export const LEARN_CATEGORIES: CategoryMeta[] = [
  { id: 'web-development', label: 'Web Development', description: 'Build for the browser, end to end.', icon: Code },
  { id: 'app-development', label: 'App Development', description: 'Ship mobile and cross-platform apps.', icon: Rocket },
  { id: 'artificial-intelligence', label: 'Artificial Intelligence', description: 'Models, prompts and intelligent systems.', icon: Award },
  { id: 'machine-learning', label: 'Machine Learning', description: 'Train, evaluate and deploy models.', icon: Wrench },
  { id: 'data-science', label: 'Data Science', description: 'Turn raw data into decisions.', icon: BookOpen },
  { id: 'cybersecurity', label: 'Cybersecurity', description: 'Defend systems and understand threats.', icon: Users },
  { id: 'cloud-computing', label: 'Cloud Computing', description: 'Run and scale software in the cloud.', icon: Presentation },
  { id: 'ui-ux-design', label: 'UI/UX Design', description: 'Design interfaces people love to use.', icon: Award },
  { id: 'programming', label: 'Programming', description: 'Core languages and problem solving.', icon: Code },
  { id: 'entrepreneurship', label: 'Entrepreneurship', description: 'Validate ideas and build companies.', icon: Rocket },
];

export const ALL_CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  [...OPPORTUNITY_CATEGORIES, ...JOB_CATEGORIES, ...LEARN_CATEGORIES].map((c) => [c.id, c.label]),
);
