
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckSquare, Timer, BookOpen, Target, CheckSquare2 } from "lucide-react";
import { TaskManagerEnhanced } from "./productivity/components/TaskManagerEnhanced";
import { PomodoroTimer } from "./productivity/components/PomodoroTimer";
import { NoteManager } from "./productivity/components/NoteManager";
import { GoalManagerEnhanced } from "./productivity/components/GoalManagerEnhanced";
import { TodoListEnhanced } from "./TodoListEnhanced";

export const ProductivitySuiteModular = () => {
  return (
    <div className="py-2">
      {/* Navigation par onglets responsive */}
      <Tabs defaultValue="todo" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 mb-4 lg:mb-8 h-auto">
          <TabsTrigger value="todo" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 lg:p-3">
            <CheckSquare2 className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm">To-Do List</span>
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 lg:p-3">
            <CheckSquare className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm">Tâches Pro</span>
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 lg:p-3">
            <Target className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm">Objectifs</span>
          </TabsTrigger>
          <TabsTrigger value="pomodoro" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 lg:p-3">
            <Timer className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm">Pomodoro</span>
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 lg:p-3">
            <BookOpen className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm">Notes</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="todo">
          <TodoListEnhanced />
        </TabsContent>

        <TabsContent value="tasks">
          <TaskManagerEnhanced />
        </TabsContent>

        <TabsContent value="goals">
          <GoalManagerEnhanced />
        </TabsContent>

        <TabsContent value="pomodoro">
          <PomodoroTimer />
        </TabsContent>

        <TabsContent value="notes">
          <NoteManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Add default export for React lazy loading compatibility
export default ProductivitySuiteModular;
