import type { Roadmap, RoadmapStep } from '@/types';

const MDN = 'https://developer.mozilla.org/en-US/docs/Learn_web_development';
const GIT = 'https://git-scm.com/book/en/v2';
const REACT = 'https://react.dev/learn';
const NODE = 'https://nodejs.org/en/learn';
const PG = 'https://www.postgresql.org/docs/current/tutorial.html';
const SUPA = 'https://supabase.com/docs';

const FULL_STACK_STEPS: RoadmapStep[] = [
  {
    id: 'programming-foundations',
    title: 'Programming foundations',
    objective: 'Think like a programmer: variables, control flow, functions and debugging.',
    topics: ['Variables and data types', 'Loops and conditionals', 'Functions', 'Reading error messages'],
    resources: [{ label: 'MDN: Learn web development', url: MDN }],
    task: 'Write a small command-line script that converts currencies using a fixed rate table.',
    miniProject: 'A to-do list that runs in the terminal and saves items to a text file.',
  },
  {
    id: 'html-css-javascript',
    title: 'HTML, CSS and JavaScript',
    objective: 'Structure, style and make pages interactive without any framework.',
    topics: ['Semantic HTML', 'Flexbox and Grid', 'DOM events', 'Fetch and async code'],
    resources: [{ label: 'MDN: Learn web development', url: MDN }],
    task: 'Recreate a landing page from a screenshot using only HTML and CSS.',
    miniProject: 'A quiz page that scores answers and shows a result summary.',
  },
  {
    id: 'git-and-github',
    title: 'Git and GitHub',
    objective: 'Track changes, collaborate through branches and share your work.',
    topics: ['Commits and history', 'Branches and merges', 'Pull requests', 'Resolving conflicts'],
    resources: [{ label: 'Pro Git book', url: GIT }],
    task: 'Create a repository, make three commits on a branch and open a pull request.',
    miniProject: 'Publish your quiz page to GitHub with a clear README.',
  },
  {
    id: 'react',
    title: 'React',
    objective: 'Build component-based interfaces that respond to state changes.',
    topics: ['Components and props', 'State and effects', 'Forms', 'Routing basics'],
    resources: [{ label: 'React Learn', url: REACT }],
    task: 'Rebuild the quiz as React components with a reset button.',
    miniProject: 'A habit tracker with add, complete and filter features.',
  },
  {
    id: 'backend-development',
    title: 'Backend development',
    objective: 'Serve data over HTTP, validate input and protect routes.',
    topics: ['Node.js runtime', 'REST endpoints', 'Input validation', 'Authentication concepts'],
    resources: [{ label: 'Node.js Learn', url: NODE }],
    task: 'Build a small API with create, read and delete endpoints.',
    miniProject: 'A bookmarks API that your habit tracker can call.',
  },
  {
    id: 'databases',
    title: 'Databases',
    objective: 'Model data, write queries and keep information consistent.',
    topics: ['Tables and relationships', 'SQL queries', 'Indexes', 'Migrations'],
    resources: [{ label: 'PostgreSQL tutorial', url: PG }],
    task: 'Design a schema for users and their bookmarks, then query them with joins.',
    miniProject: 'Store the habit tracker data in a real database.',
  },
  {
    id: 'real-world-projects',
    title: 'Build real-world projects',
    objective: 'Combine the pieces into a complete product that solves a real problem.',
    topics: ['Project planning', 'Error handling', 'Testing basics', 'Deployment checklist'],
    resources: [{ label: 'Supabase documentation', url: SUPA }],
    task: 'Write a one-page plan with features, data model and milestones.',
    miniProject: 'A full-stack event tracker with sign-in and saved items.',
  },
  {
    id: 'portfolio-and-deployment',
    title: 'Portfolio and deployment',
    objective: 'Present your best work and put it online for others to use.',
    topics: ['Case studies', 'Hosting', 'Performance basics', 'Accessibility checks'],
    resources: [{ label: 'MDN: Learn web development', url: MDN }],
    task: 'Write a short case study for two projects and publish them live.',
    miniProject: 'A personal portfolio site linking to your deployed projects.',
  },
];

export const ROADMAPS: Roadmap[] = [
  {
    id: 'full-stack-development',
    title: 'Full-Stack Development',
    category: 'web-development',
    level: 'Beginner',
    duration: '6 months',
    summary: 'Go from first lines of code to deploying a complete web product.',
    skills: ['JavaScript', 'React', 'Node.js', 'SQL', 'Git'],
    steps: FULL_STACK_STEPS,
  },
  {
    id: 'artificial-intelligence',
    title: 'Artificial Intelligence',
    category: 'artificial-intelligence',
    level: 'Intermediate',
    duration: '5 months',
    summary: 'Understand modern AI systems and build applications on top of them.',
    skills: ['Python', 'Machine learning', 'Prompt design', 'Evaluation'],
    steps: [
      {
        id: 'python-for-ai',
        title: 'Python for AI',
        objective: 'Write clean Python and work with data in notebooks.',
        topics: ['Functions and modules', 'NumPy basics', 'Notebooks'],
        resources: [{ label: 'Kaggle Learn', url: 'https://www.kaggle.com/learn' }],
        task: 'Load a CSV file and compute summary statistics.',
        miniProject: 'A notebook that explores a public dataset.',
      },
      {
        id: 'machine-learning-basics',
        title: 'Machine learning basics',
        objective: 'Train and evaluate simple models with confidence.',
        topics: ['Regression', 'Classification', 'Train and test splits'],
        resources: [{ label: 'scikit-learn tutorial', url: 'https://scikit-learn.org/stable/tutorial/index.html' }],
        task: 'Train a classifier and report accuracy on held-out data.',
        miniProject: 'A model that predicts a simple outcome from your own data.',
      },
      {
        id: 'neural-networks',
        title: 'Neural networks',
        objective: 'Understand how deep models learn from examples.',
        topics: ['Layers and activations', 'Backpropagation', 'Overfitting'],
        resources: [{ label: 'DeepLearning.AI', url: 'https://www.deeplearning.ai/' }],
        task: 'Train a small network on an image dataset.',
        miniProject: 'An image classifier with a short accuracy report.',
      },
      {
        id: 'llm-applications',
        title: 'Building with language models',
        objective: 'Design prompts and integrate models into applications safely.',
        topics: ['Prompt structure', 'Evaluation', 'Guardrails'],
        resources: [{ label: 'DeepLearning.AI', url: 'https://www.deeplearning.ai/' }],
        task: 'Write three prompts and compare their outputs on the same inputs.',
        miniProject: 'A small assistant that answers questions from a document you provide.',
      },
    ],
  },
  {
    id: 'ui-ux-design',
    title: 'UI/UX Design',
    category: 'ui-ux-design',
    level: 'Beginner',
    duration: '3 months',
    summary: 'Learn to research, design and test experiences people enjoy using.',
    skills: ['User research', 'Wireframing', 'Visual design', 'Usability testing'],
    steps: [
      {
        id: 'design-fundamentals',
        title: 'Design fundamentals',
        objective: 'Understand hierarchy, spacing, contrast and alignment.',
        topics: ['Typography', 'Colour contrast', 'Grids and spacing'],
        resources: [{ label: 'Interaction Design Foundation', url: 'https://www.interaction-design.org/' }],
        task: 'Redesign a poorly spaced page using a consistent 8px grid.',
        miniProject: 'A one-page visual system with type scale and colours.',
      },
      {
        id: 'user-research',
        title: 'User research',
        objective: 'Learn what people need before designing anything.',
        topics: ['Interviews', 'Personas', 'Journey maps'],
        resources: [{ label: 'Nielsen Norman Group articles', url: 'https://www.nngroup.com/articles/' }],
        task: 'Interview three people about how they plan their week.',
        miniProject: 'A persona and journey map built from your interviews.',
      },
      {
        id: 'wireframing-prototyping',
        title: 'Wireframing and prototyping',
        objective: 'Turn ideas into clickable flows quickly.',
        topics: ['Low-fidelity wireframes', 'Information architecture', 'Clickable prototypes'],
        resources: [{ label: 'Figma resources', url: 'https://www.figma.com/resources/learn-design/' }],
        task: 'Sketch the three main screens of a booking flow.',
        miniProject: 'A clickable prototype of a simple app.',
      },
      {
        id: 'usability-testing',
        title: 'Usability testing',
        objective: 'Test designs with real users and improve based on evidence.',
        topics: ['Task scripts', 'Observation', 'Prioritising findings'],
        resources: [{ label: 'Nielsen Norman Group articles', url: 'https://www.nngroup.com/articles/' }],
        task: 'Run two usability sessions and list the top three problems.',
        miniProject: 'A short usability report with recommended fixes.',
      },
    ],
  },
];

export function getRoadmap(id: string): Roadmap | undefined {
  return ROADMAPS.find((roadmap) => roadmap.id === id);
}
