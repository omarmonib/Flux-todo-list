'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { TaskCard } from './task-card';

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate: Date | null;
  createdAt: Date;
};

export function AnimatedTaskList({
  tasks,
  onUpdated,
  onDeleted,
}: {
  tasks: Task[];
  onUpdated: (task: Task) => void;
  onDeleted: (id: string) => void;
}) {
  return (
    <div className="grid gap-3">
      <AnimatePresence mode="popLayout">
        {tasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            transition={{
              duration: 0.2,
              delay: index * 0.03,
              ease: 'easeOut',
            }}
            layout
          >
            <TaskCard task={task} onUpdated={onUpdated} onDeleted={onDeleted} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
