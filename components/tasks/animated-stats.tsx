'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

type Task = {
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate: Date | null;
  tags: string[];
};

export function AnimatedTaskStats({ tasks }: { tasks: Task[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'COMPLETED').length;
  const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const pending = tasks.filter((t) => t.status === 'PENDING').length;
  const high = tasks.filter((t) => t.priority === 'HIGH' && t.status !== 'COMPLETED').length;
  const overdue = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'COMPLETED'
  ).length;

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const stats = [
    { label: 'Total', value: total, color: 'text-foreground', bg: 'bg-secondary' },
    {
      label: 'Pending',
      value: pending,
      color: 'text-gray-600 dark:text-gray-400',
      bg: 'bg-gray-100 dark:bg-gray-800',
    },
    {
      label: 'In Progress',
      value: inProgress,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-900/30',
    },
    {
      label: 'Completed',
      value: completed,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-900/30',
    },
    {
      label: 'High Priority',
      value: high,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-900/30',
    },
    {
      label: 'Overdue',
      value: overdue,
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-900/30',
    },
  ];

  if (!mounted) {
    return (
      <div className="space-y-4 mb-8">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className={`${stat.bg} rounded-lg p-3 text-center`}>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Completion rate</span>
            <span className="font-medium text-foreground">{completionRate}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 mb-8">
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className={`${stat.bg} rounded-lg p-3 text-center`}
          >
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {total > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Completion rate</span>
            <span className="font-medium text-foreground">{completionRate}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-green-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${completionRate}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
