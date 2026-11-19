import { Comment } from '../types/taskflow';

export const mockComments: Comment[] = [
  {
    id: 'c1',
    taskId: 't1',
    authorId: 'm2',
    text: 'Can we name the audience in the first line?',
    createdAt: '2026-11-17T03:10:00Z',
  },
  {
    id: 'c2',
    taskId: 't1',
    authorId: 'm1',
    text: 'Yes. I will revise the introduction.',
    createdAt: '2026-11-17T04:05:00Z',
  },
  {
    id: 'c3',
    taskId: 't2',
    authorId: 'm3',
    text: 'The shorter labels fit on my phone.',
    createdAt: '2026-11-18T08:30:00Z',
  },
];
