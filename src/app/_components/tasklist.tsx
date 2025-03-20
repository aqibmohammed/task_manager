"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { api } from "~/trpc/react";
import { Pencil, Trash2, PlusCircle, Search, Check, X } from "lucide-react";

interface TaskFormData {
  title: string;
  description?: string;
  status: "pending" | "in-progress" | "completed";
}

const TaskList = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "in-progress" | "completed">("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const { data: allTasks, refetch: refetchAll } = api.task.getTasks.useQuery();
  const { data: filteredTasks, refetch: refetchFiltered } = api.task.getTasksfilter.useQuery(
    { status: filter === "all" ? undefined : filter, page, pageSize },
    { enabled: filter !== "all" }
  );



  const createTask = api.task.createTask.useMutation({
    onSuccess: () => {
      refetchAll();
      refetchFiltered();
    },
  });

  const updateTask = api.task.updateTask.useMutation({
    onSuccess: () => {
      refetchAll();
      refetchFiltered();
      setEditingTaskId(null);
    },
  });

  const deleteTask = api.task.deleteTask.useMutation({
    onSuccess: () => {
      refetchAll();
      refetchFiltered();
    },
  });

  const tasksToDisplay =
    filter === "all"
      ? allTasks?.filter((task) => task.title.toLowerCase().includes(search.toLowerCase()))
      : filteredTasks?.filter((task) => task.title.toLowerCase().includes(search.toLowerCase()));

  // Separate forms for adding and editing tasks
  const { register, handleSubmit, reset } = useForm<TaskFormData>(); // Add Task Form
  const { register: editRegister, handleSubmit: handleEditSubmit, setValue: setEditValue } = useForm<TaskFormData>(); // Edit Task Form

  const onSubmit = (data: TaskFormData) => {
    createTask.mutate({ title: data.title, description: data.description, status: data.status });
    reset();
  };

  const startEditing = (task: {
    id: string;
    title: string;
    description: string | null;
    status: "pending" | "in-progress" | "completed";
  }) => {
    setEditingTaskId(task.id);
    setEditValue("title", task.title);
    setEditValue("description", task.description ?? "");
    setEditValue("status", task.status);
  };

  const onEditSubmit = (data: TaskFormData) => {
    if (editingTaskId) {
      updateTask.mutate({
        id: editingTaskId,
        title: data.title,
        description: data.description ?? "",
        status: data.status
      });
    }
  };

  return (
    <div className="p-6 w-3/4 justify-center items-center mx-auto flex flex-row gap-14">

      {/* Add Task Form */}
      <div className="w-1/2 bg-blue-200 p-4 rounded-lg shadow-md min-h-[320px]">
        <h2 className="text-lg font-semibold mb-3 text-blue-700">Add New Task</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <input {...register("title", { required: true })} type="text" placeholder="Task Title..." className="border p-2 rounded" />
          <input {...register("description")} type="text" placeholder="Task Description (optional)..." className="border p-2 rounded" />
          <select {...register("status")} className="border p-2 rounded">
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 justify-center hover:bg-blue-700">
            <PlusCircle /> Add Task
          </button>
        </form>
      </div>

      {/* Task List */}
      <div className="w-1/2 bg-blue-200 p-5 shadow-md rounded-xl">
        <div className="flex gap-2 mb-4 items-center">
          <input type="text" placeholder="Search tasks..." className="border p-2 flex-grow rounded" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Search className="text-gray-500" />
        </div>

        <div className="flex gap-2 mb-4">
          {["all", "pending", "in-progress", "completed"].map((status) => (
            <button key={status} className={`px-4 py-1 rounded ${filter === status ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"}`} onClick={() => setFilter(status as any)}>
              {status.replace("-", " ")}
            </button>
          ))}
        </div>

        {/* Scrollable Task List */}
        <div className="space-y-4 overflow-y-auto max-h-[400px] p-4 rounded-lg custom-scrollbar">
          {tasksToDisplay?.map((task) => (
            <div key={task.id} className="p-4 border rounded-lg flex justify-between items-center shadow-md bg-white">

              {editingTaskId === task.id ? (
                <form onSubmit={handleEditSubmit(onEditSubmit)} className="flex-grow flex flex-col gap-2">
                  <input {...editRegister("title", { required: true })} type="text" className="border p-1 rounded" />
                  <input {...editRegister("description")} type="text" className="border p-1 rounded" />
                  <select {...editRegister("status")} className="border p-1 rounded">
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  <button type="submit" className="text-green-500 hover:text-green-600">
                    <Check />
                  </button>
                </form>
              ) : (
                <div>
                  <h3 className="font-bold text-lg">{task.title}</h3>
                  <p className="text-sm text-gray-600">{task.description}</p>
                  <span className={`text-xs px-2 py-1 rounded ${task.status === "completed" ? "bg-green-200" : task.status === "in-progress" ? "bg-yellow-200" : "bg-gray-200"}`}>
                    {task.status}
                  </span>
                </div>
              )}

              <div className="flex gap-2">
                {editingTaskId !== task.id ? (
                  <button onClick={() => startEditing(task)} className="text-green-500 hover:text-green-600">
                    <Pencil />
                  </button>
                ) : (
                  <button onClick={() => setEditingTaskId(null)} className="text-gray-500 hover:text-gray-600">
                    <X />
                  </button>
                )}
                <button onClick={() => deleteTask.mutate({ id: task.id })} className="text-red-500 hover:text-red-600">
                  <Trash2 />
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskList;
