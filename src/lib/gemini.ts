import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import type { Task, StandupSummary, StandupItem } from '../types';
import { GEMINI_RATE_LIMIT } from './constants';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

// Rate limiting: track call timestamps
const callTimestamps: number[] = [];

function checkRateLimit(): boolean {
  const now = Date.now();
  const oneMinuteAgo = now - 60_000;
  // Remove old timestamps
  while (callTimestamps.length > 0 && callTimestamps[0] < oneMinuteAgo) {
    callTimestamps.shift();
  }
  if (callTimestamps.length >= GEMINI_RATE_LIMIT) return false;
  callTimestamps.push(now);
  return true;
}

function buildPrompt(tasks: Task[]): string {
  const byStatus = {
    done: tasks.filter((t) => t.status === 'done'),
    inprogress: tasks.filter((t) => t.status === 'inprogress'),
    review: tasks.filter((t) => t.status === 'review'),
    todo: tasks.filter((t) => t.status === 'todo'),
  };

  const fmt = (arr: Task[]) =>
    arr.map((t) => `  - [${t.priority.toUpperCase()}] ${t.title}${t.assignee ? ` (${t.assignee})` : ''}`).join('\n') || '  (none)';

  return `You are a concise Scrum Master AI. Analyze this Kanban board snapshot and generate a standup summary.

BOARD STATE:
✅ Done (${byStatus.done.length}):
${fmt(byStatus.done)}

🔄 In Progress (${byStatus.inprogress.length}):
${fmt(byStatus.inprogress)}

👀 In Review (${byStatus.review.length}):
${fmt(byStatus.review)}

📋 To Do (${byStatus.todo.length}):
${fmt(byStatus.todo)}

Generate EXACTLY 3 bullet points in this JSON format:
{
  "items": [
    { "category": "progress", "text": "What was accomplished..." },
    { "category": "blockers", "text": "Any blockers or risks..." },
    { "category": "upcoming", "text": "What's planned next..." }
  ]
}

Be specific, actionable, and under 30 words per bullet. Return ONLY valid JSON.`;
}

/** Fallback summary when API is unavailable */
function fallbackSummary(tasks: Task[]): StandupSummary {
  const done = tasks.filter((t) => t.status === 'done').length;
  const inprogress = tasks.filter((t) => t.status === 'inprogress').length;
  const todo = tasks.filter((t) => t.status === 'todo').length;
  const urgent = tasks.filter((t) => t.priority === 'urgent' || t.priority === 'high');

  const items: StandupItem[] = [
    {
      category: 'progress',
      text: `Team completed ${done} task${done !== 1 ? 's' : ''} and has ${inprogress} in progress.`,
    },
    {
      category: 'blockers',
      text:
        urgent.length > 0
          ? `${urgent.length} high-priority item${urgent.length !== 1 ? 's' : ''} need attention: ${urgent.slice(0, 2).map((t) => t.title).join(', ')}.`
          : 'No critical blockers identified at this time.',
    },
    {
      category: 'upcoming',
      text: `${todo} task${todo !== 1 ? 's' : ''} queued for upcoming sprints.`,
    },
  ];
  return { items, generatedAt: Date.now(), taskCount: tasks.length };
}

export async function generateStandupSummary(tasks: Task[]): Promise<StandupSummary> {
  if (!API_KEY || tasks.length === 0) {
    return fallbackSummary(tasks);
  }

  if (!checkRateLimit()) {
    throw new Error('Rate limit reached. Please wait a moment before generating another summary.');
  }

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    safetySettings: [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      maxOutputTokens: 512,
    },
  });

  const result = await model.generateContent(buildPrompt(tasks));
  const text = result.response.text().trim();

  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Invalid response format from Gemini');

  const parsed = JSON.parse(jsonMatch[0]) as { items: StandupItem[] };
  if (!Array.isArray(parsed.items) || parsed.items.length === 0) {
    throw new Error('Invalid summary structure from Gemini');
  }

  return {
    items: parsed.items.slice(0, 3),
    generatedAt: Date.now(),
    taskCount: tasks.length,
  };
}
