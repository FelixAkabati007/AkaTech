import React, { memo } from "react";
import { motion } from "framer-motion";
import { Icons } from "@components/ui/Icons";
import PropTypes from "prop-types";

/**
 * ProjectEmptyState Component
 *
 * Displays a placeholder state when no project is selected.
 * Designed with accessibility and modern UI standards in mind.
 *
 * @component
 * @example
 * return (
 *   <ProjectEmptyState />
 * )
 */
const ProjectEmptyState = memo(({ className }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={`h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-lg bg-gray-50/50 dark:bg-white/5 transition-colors hover:border-akatech-gold/30 focus:outline-none focus:ring-2 focus:ring-akatech-gold focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${className}`}
      role="status"
      aria-live="polite"
      tabIndex={0}
      aria-label="No project selected. Please select a project from the list to view details."
    >
      <div className="relative mb-6 group">
        <div className="absolute inset-0 bg-akatech-gold/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <Icons.Folder className="relative w-16 h-16 text-gray-300 dark:text-gray-600 group-hover:text-akatech-gold transition-colors duration-300" />
        <Icons.Search className="absolute -bottom-2 -right-2 w-6 h-6 text-akatech-gold bg-white dark:bg-gray-800 rounded-full p-1 shadow-sm" />
      </div>

      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
        No Project Selected
      </h3>
      
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto mb-6 leading-relaxed">
        Select a project from the list on the left to view its timeline, deliverables, and status updates.
      </p>

      <div className="flex gap-3 text-xs text-gray-400 dark:text-gray-500">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-black/20 rounded-full border border-gray-100 dark:border-white/5">
          <Icons.Activity className="w-3 h-3" />
          <span>Track Progress</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-black/20 rounded-full border border-gray-100 dark:border-white/5">
          <Icons.Download className="w-3 h-3" />
          <span>Access Files</span>
        </div>
      </div>
    </motion.div>
  );
});

ProjectEmptyState.displayName = "ProjectEmptyState";

ProjectEmptyState.propTypes = {
  /** Optional additional class names */
  className: PropTypes.string,
};

export default ProjectEmptyState;
