import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icons } from "@components/ui/Icons";
import { mockService } from "@lib/mockData";

export const ClientProjects = ({ user }) => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    setProjects(mockService.getProjects(user.id));
  }, [user.id]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif text-gray-900 dark:text-white">
          My Projects
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project List */}
        <div className="lg:col-span-1 space-y-4">
          {projects.map((project) => (
            <motion.div
              key={project.id}
              layoutId={`project-${project.id}`}
              onClick={() => setSelectedProject(project)}
              className={`p-6 rounded-lg border cursor-pointer transition-all ${
                selectedProject?.id === project.id
                  ? "bg-white dark:bg-akatech-card border-akatech-gold shadow-md"
                  : "bg-white dark:bg-akatech-card border-gray-200 dark:border-white/10 hover:border-akatech-gold/50"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-gray-900 dark:text-white">
                  {project.title}
                </h3>
                <span
                  className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${
                    project.status === "In Progress"
                      ? "bg-akatech-gold/20 text-akatech-gold"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                  }`}
                >
                  {project.status}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                {project.description}
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                <Icons.Activity className="w-3 h-3" />
                <span>Phase: {project.currentPhase}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Project Details */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedProject ? (
              <motion.div
                key={selectedProject.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white dark:bg-akatech-card rounded-lg border border-gray-200 dark:border-white/10 p-8"
              >
                <div className="border-b border-gray-200 dark:border-white/10 pb-6 mb-6">
                  <h2 className="text-2xl font-serif text-gray-900 dark:text-white mb-2">
                    {selectedProject.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    {selectedProject.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Timeline */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Icons.Clock className="w-4 h-4 text-akatech-gold" />{" "}
                      Timeline
                    </h3>
                    <div className="space-y-6 pl-2 border-l border-gray-200 dark:border-gray-700 ml-2">
                      {selectedProject.phases.map((phase, i) => (
                        <div key={i} className="relative pl-6">
                          <div
                            className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full ${
                              phase.status === "Completed"
                                ? "bg-green-500"
                                : phase.status === "In Progress"
                                ? "bg-akatech-gold"
                                : "bg-gray-300 dark:bg-gray-700"
                            }`}
                          ></div>
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                            {phase.name}
                          </h4>
                          <div className="flex justify-between items-center text-xs mt-1">
                            <span className="text-gray-500">
                              {phase.status}
                            </span>
                            <span className="text-gray-400 font-mono">
                              {phase.date}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Deliverables */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Icons.FileText className="w-4 h-4 text-akatech-gold" />{" "}
                      Deliverables
                    </h3>
                    {selectedProject.files &&
                    selectedProject.files.length > 0 ? (
                      <ul className="space-y-3">
                        {selectedProject.files.map((file, i) => (
                          <li
                            key={i}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded border border-gray-200 dark:border-white/5 group"
                          >
                            <div className="flex items-center gap-3">
                              <Icons.FileText className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {file.name}
                                </p>
                                <p className="text-[10px] text-gray-500">
                                  {file.date} • {file.size}
                                </p>
                              </div>
                            </div>
                            <button className="text-gray-400 hover:text-akatech-gold transition-colors">
                              <Icons.CheckCircle className="w-4 h-4" />{" "}
                              {/* Using CheckCircle as Download proxy */}
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-center py-8 text-gray-500 bg-gray-50 dark:bg-white/5 rounded border border-dashed border-gray-300 dark:border-gray-700">
                        <Icons.FileText className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">No deliverables uploaded yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 p-12 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-lg">
                <Icons.Code className="w-12 h-12 mb-4 opacity-20" />
                <p>Select a project to view details</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
