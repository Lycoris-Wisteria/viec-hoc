import { Icon } from "./Icon";
import { TaskItem } from "./TaskItem";
import type { Task, TaskFilter } from "./task";

type TaskListProps = {
  tasks: Task[];
  filter: TaskFilter;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string) => void;
};

export function TaskList({
  tasks,
  filter,
  onToggle,
  onDelete,
  onEdit,
}: TaskListProps) {
  const pendingTasks = tasks.filter((task) => !task.is_done);
  const completedTasks = tasks.filter((task) => task.is_done);
  const groups =
    filter === "all"
      ? [
          { title: "Việc cần làm hôm nay", tasks: pendingTasks, done: false },
          { title: "Công việc đã hoàn thành", tasks: completedTasks, done: true },
        ]
      : [
          {
            title: filter === "pending" ? "Việc cần làm hôm nay" : "Công việc đã hoàn thành",
            tasks: filter === "pending" ? pendingTasks : completedTasks,
            done: filter === "completed",
          },
        ];

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      {groups.map((group) => (
        <section
          className={`flex flex-col gap-2 ${
            filter === "all" && group.done ? "hidden sm:flex" : ""
          }`}
          key={group.title}
        >
          <div className="flex items-center justify-between gap-3 px-1">
            <h2 className="font-display flex items-center gap-2 text-base font-semibold sm:text-lg">
              <span className={`h-2 w-2 rounded-full ${group.done ? "bg-[#22c55e]" : "bg-[#f59e0b]"}`} />
              {group.title}
            </h2>
            <span className="text-xs text-muted">
              {group.tasks.length} {group.done ? "việc đã xong" : "việc còn lại"}
            </span>
          </div>

          {group.tasks.length ? (
            <div className="flex flex-col gap-2">
              {group.tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  onToggle={onToggle}
                  task={task}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-white/70 px-4 py-8 text-center text-sm text-muted">
              <Icon name="check" className="h-6 w-6 text-primary" />
              {group.done ? "Chưa có công việc hoàn thành." : "Bạn đã hoàn thành tất cả công việc!"}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
