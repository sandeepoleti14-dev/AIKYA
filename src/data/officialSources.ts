export interface OfficialSource {
  name: string;
  url: string;
  description: string;
}

export const EVENT_SOURCES: OfficialSource[] = [
  { name: 'Google Developer Events', url: 'https://developers.google.com/events/', description: 'Google’s official developer events directory.' },
  { name: 'Google Developer Groups', url: 'https://developers.google.com/community/', description: 'Find local Google developer communities and their activities.' },
  { name: 'AWS Events', url: 'https://aws.amazon.com/events/', description: 'AWS conferences, webinars, and community events.' },
  { name: 'Microsoft Events', url: 'https://events.microsoft.com/', description: 'Microsoft’s official event discovery page.' },
  { name: 'FOSS United', url: 'https://fossunited.org/', description: 'Free and open-source community events in India.' },
];

export const HACKATHON_SOURCES: OfficialSource[] = [
  { name: 'Devfolio', url: 'https://devfolio.co/', description: 'Browse hackathons on Devfolio; Aikya does not claim an unapproved listing API.' },
  { name: 'Devpost', url: 'https://devpost.com/', description: 'Browse hackathons and projects on Devpost.' },
  { name: 'Unstop', url: 'https://unstop.com/', description: 'Browse competitions and hackathons on Unstop.' },
  { name: 'Major League Hacking', url: 'https://mlh.io/', description: 'Browse official MLH hackathon listings.' },
];

export const LEARNING_SOURCES: OfficialSource[] = [
  { name: 'AWS Skill Builder', url: 'https://skillbuilder.aws/', description: 'Browse AWS training; confirm course and exam costs on the provider site.' },
  { name: 'Google Skills', url: 'https://skills.google/', description: 'Browse Google learning paths and credentials; check each item’s terms.' },
  { name: 'Microsoft Learn', url: 'https://learn.microsoft.com/training/', description: 'Browse Microsoft Learn modules and learning paths.' },
  { name: 'IBM SkillsBuild', url: 'https://skillsbuild.org/learning-catalog', description: 'Browse IBM SkillsBuild learning and credentials.' },
  { name: 'Cisco Networking Academy', url: 'https://www.netacad.com/', description: 'Browse Cisco Networking Academy learning resources.' },
];
