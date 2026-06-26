'use client';

import { useState, KeyboardEvent } from 'react';
import { Input } from '@/components/ui/input';

const TAG_COLORS = [
  'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300',
  'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300',
];

export function getTagColor(tag: string) {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
}

export function TagBadge({ tag }: { tag: string }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getTagColor(tag)}`}>
      #{tag}
    </span>
  );
}

export function TagInput({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
}) {
  const [input, setInput] = useState('');

  function addTag() {
    const tag = input.trim().toLowerCase().replace(/\s+/g, '-');
    if (tag && !tags.includes(tag) && tags.length < 5) {
      onChange([...tags, tag]);
      setInput('');
    }
  }

  function removeTag(tag: string) {
    onChange(tags.filter((t) => t !== tag));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
    if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1 min-h-7">
        {tags.map((tag) => (
          <span
            key={tag}
            className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${getTagColor(tag)}`}
          >
            #{tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:opacity-70 ml-0.5"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        placeholder="Add tags (press Enter)..."
        className="h-8 text-sm"
        disabled={tags.length >= 5}
      />
      {tags.length >= 5 && <p className="text-xs text-muted-foreground">Maximum 5 tags</p>}
    </div>
  );
}
