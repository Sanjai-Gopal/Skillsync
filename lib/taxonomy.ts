import { Domain, Role, Goal } from './types';

export interface SkillDefinition {
  name: string;
  domain: Domain;
  category?: string;
}

export const DOMAINS: { id: Domain; label: string; icon: string; description: string }[] = [
  { id: 'frontend', label: 'Frontend', icon: 'Layout', description: 'React, Next.js, Vue, Web UI' },
  { id: 'backend', label: 'Backend', icon: 'Server', description: 'Node.js, Python, Go, APIs & DBs' },
  { id: 'ai_ml', label: 'AI/ML', icon: 'Cpu', description: 'LLMs, PyTorch, RAG, scikit-learn' },
  { id: 'design', label: 'Design & UI/UX', icon: 'Palette', description: 'Figma, Design Systems, UX research' },
  { id: 'product', label: 'Product & PM', icon: 'Compass', description: 'Roadmapping, User Stories, Pitching' },
  { id: 'devops', label: 'DevOps & Cloud', icon: 'Cloud', description: 'Docker, CI/CD, AWS, Kubernetes' },
  { id: 'data', label: 'Data Engineering', icon: 'Database', description: 'SQL, ETL, Pipelines, Analytics' },
  { id: 'mobile', label: 'Mobile Dev', icon: 'Smartphone', description: 'React Native, Flutter, Swift, Kotlin' },
];

export const ALL_DOMAINS: Domain[] = [
  'frontend',
  'backend',
  'ai_ml',
  'design',
  'product',
  'devops',
  'data',
  'mobile',
];

export const SKILLS_TAXONOMY: SkillDefinition[] = [
  // Frontend
  { name: 'React', domain: 'frontend' },
  { name: 'Next.js', domain: 'frontend' },
  { name: 'Tailwind CSS', domain: 'frontend' },
  { name: 'TypeScript', domain: 'frontend' },
  { name: 'Vue.js', domain: 'frontend' },
  // Backend
  { name: 'Node.js', domain: 'backend' },
  { name: 'PostgreSQL', domain: 'backend' },
  { name: 'Go', domain: 'backend' },
  { name: 'Python (FastAPI)', domain: 'backend' },
  { name: 'GraphQL', domain: 'backend' },
  // AI/ML
  { name: 'PyTorch', domain: 'ai_ml' },
  { name: 'scikit-learn', domain: 'ai_ml' },
  { name: 'LLM Prompt Engineering', domain: 'ai_ml' },
  { name: 'LangChain & RAG', domain: 'ai_ml' },
  { name: 'Hugging Face', domain: 'ai_ml' },
  // Design
  { name: 'Figma', domain: 'design' },
  { name: 'UI Prototyping', domain: 'design' },
  { name: 'Design Systems', domain: 'design' },
  { name: 'User Research', domain: 'design' },
  // Product
  { name: 'Product Management', domain: 'product' },
  { name: 'Agile & Scrums', domain: 'product' },
  { name: 'Pitching & Decks', domain: 'product' },
  // DevOps
  { name: 'Docker', domain: 'devops' },
  { name: 'CI/CD Pipelines', domain: 'devops' },
  { name: 'AWS Cloud', domain: 'devops' },
  // Data
  { name: 'SQL & Analytics', domain: 'data' },
  { name: 'Data Pipelines', domain: 'data' },
  { name: 'Pandas & NumPy', domain: 'data' },
  // Mobile
  { name: 'React Native', domain: 'mobile' },
  { name: 'Flutter', domain: 'mobile' },
  { name: 'Swift / iOS', domain: 'mobile' },
];

export const ROLES: { id: Role; label: string }[] = [
  { id: 'Frontend', label: 'Frontend Developer' },
  { id: 'Backend', label: 'Backend Developer' },
  { id: 'AI/ML', label: 'AI/ML Engineer' },
  { id: 'UI/UX', label: 'UI/UX Designer' },
  { id: 'PM', label: 'Product Manager' },
];

export const TRACKS: string[] = [
  'AI & Emerging Tech',
  'Web & Mobile',
  'Fintech & Web3',
  'Open Innovation',
  'Healthcare & BioTech',
  'Social Good & Climate',
];

export const GOALS: { id: Goal; label: string; description: string }[] = [
  { id: 'win', label: 'Win the Hackathon', description: 'Competing for top prizes and podium finishes' },
  { id: 'learn', label: 'Learn & Upskill', description: 'Experimenting with unfamiliar tech stacks' },
  { id: 'ship_startup', label: 'Ship a Startup MVP', description: 'Building a real product to launch afterwards' },
  { id: 'network', label: 'Network & Meet Friends', description: 'Meeting ambitious builders and mentors' },
  { id: 'portfolio', label: 'Portfolio Project', description: 'Creating a high-caliber showcase project' },
  { id: 'fun', label: 'Have Fun & Build', description: 'Enjoying the hackathon sprint experience' },
];

export const TIME_BLOCKS = [
  { id: 'morning', label: 'Morning', hours: [6, 7, 8, 9], range: '06:00 - 10:00' },
  { id: 'midday', label: 'Midday', hours: [10, 11, 12, 13], range: '10:00 - 14:00' },
  { id: 'afternoon', label: 'Afternoon', hours: [14, 15, 16, 17], range: '14:00 - 18:00' },
  { id: 'evening', label: 'Evening', hours: [18, 19, 20, 21], range: '18:00 - 22:00' },
  { id: 'night', label: 'Night', hours: [22, 23, 0, 1], range: '22:00 - 02:00' },
  { id: 'late', label: 'Late', hours: [2, 3, 4, 5], range: '02:00 - 06:00' },
] as const;
