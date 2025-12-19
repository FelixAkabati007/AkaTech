import React, { useState, useEffect } from "react";
import { Icons } from "@components/ui/Icons";
import { mockService } from "@lib/mockData";
import { AnimatePresence, motion } from "framer-motion";

export const AdminProjects = () => {
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    title: "",
    clientId: "",
    status: "Initiation",
    description: "",
    startDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    const data = mockService.getProjects();
    setProjects(data);
  }, []);

  const handleCreateProject = (e) => {
    e.preventDefault();
    const project = {
      ...newProject,
      clientId: parseInt(newProject.clientId),
    };

    mockService.saveProject(project);
    setProjects(mockService.getProjects());

    setIsModalOpen(false);
    setNewProject({
      title: "",
      clientId: "",
      status: "Initiation",
      description: "",
      startDate: new Date().toISOString().split("T")[0],
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif text-gray-900 dark:text-white">
          Project Management
        </h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-akatech-gold text-black px-4 py-2 text-sm font-bold uppercase tracking-widest hover:bg-white hover:text-akatech-gold border border-akatech-gold transition-colors"
        >
          New Project
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-white/10 text-xs uppercase tracking-widest text-gray-500">
              <th className="py-4 font-medium">Project</th>
              <th className="py-4 font-medium">Client ID</th>
              <th className="py-4 font-medium">Status</th>
              <th className="py-4 font-medium">Progress</th>
              <th className="py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/5">
            {projects.map((project) => (
              <tr
                key={project.id}
                className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                <td className="py-4 font-medium text-gray-900 dark:text-white">
                  {project.title}
                </td>
                <td className="py-4 text-gray-500">{project.clientId}</td>
                <td className="py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      project.status === "Completed"
                        ? "bg-green-100 text-green-800"
                        : project.status === "In Progress"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {project.status}
                  </span>
                </td>
                <td className="py-4 w-48">
                  <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-1.5">
                    <div
                      className="bg-akatech-gold h-1.5 rounded-full"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </td>
                <td className="py-4 text-right">
                  <button className="text-gray-400 hover:text-akatech-gold transition-colors">
                    <Icons.MoreHorizontal className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-akatech-card w-full max-w-lg rounded-lg shadow-2xl border border-akatech-gold p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-serif text-gray-900 dark:text-white">
                  Create New Project
                </h3>
                <button onClick={() => setIsModalOpen(false)}>
                  <Icons.X className="w-6 h-6 text-gray-500 hover:text-red-500" />
                </button>
              </div>

              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label
                    htmlFor="projectTitle"
                    className="block text-xs uppercase tracking-widest text-gray-500 mb-1"
                  >
                    Project Title
                  </label>
                  <input
                    id="projectTitle"
                    type="text"
                    required
                    value={newProject.title}
                    onChange={(e) =>
                      setNewProject({ ...newProject, title: e.target.value })
                    }
                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 p-2 focus:outline-none focus:border-akatech-gold"
                  />
                </div>
                <div>
                  <label
                    htmlFor="projectClient"
                    className="block text-xs uppercase tracking-widest text-gray-500 mb-1"
                  >
                    Client (ID)
                  </label>
                  <select
                    id="projectClient"
                    required
                    value={newProject.clientId}
                    onChange={(e) =>
                      setNewProject({ ...newProject, clientId: e.target.value })
                    }
                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 p-2 focus:outline-none focus:border-akatech-gold"
                  >
                    <option value="">Select Client</option>
                    <option value="1">Client One</option>
                    <option value="2">Client Two</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="projectDescription"
                    className="block text-xs uppercase tracking-widest text-gray-500 mb-1"
                  >
                    Description
                  </label>
                  <textarea
                    id="projectDescription"
                    required
                    value={newProject.description}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        description: e.target.value,
                      })
                    }
                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 p-2 focus:outline-none focus:border-akatech-gold h-24"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-akatech-gold text-black px-6 py-2 text-sm font-bold uppercase tracking-widest hover:bg-white hover:text-akatech-gold border border-akatech-gold transition-colors"
                  >
                    Create Project
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
