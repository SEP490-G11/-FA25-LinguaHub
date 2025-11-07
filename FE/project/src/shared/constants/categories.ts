export const CATEGORIES = [
  { id: '1', name: 'Business English' },
  { id: '2', name: 'IELTS Preparation' },
  { id: '3', name: 'Conversational English' },
  { id: '4', name: 'Grammar & Writing' },
  { id: '5', name: 'Pronunciation & Speaking' },
] as const;

export const LANGUAGES = [
  { id: '1', name: 'English', code: 'en' },
  { id: '2', name: 'Vietnamese', code: 'vi' },
  { id: '3', name: 'Chinese', code: 'zh' },
  { id: '4', name: 'Japanese', code: 'ja' },
  { id: '5', name: 'Korean', code: 'ko' },
] as const;

export type Category = typeof CATEGORIES[number];
export type Language = typeof LANGUAGES[number];
