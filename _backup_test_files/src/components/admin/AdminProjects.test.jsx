import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AdminProjects } from "./AdminProjects";
import { mockService } from "@lib/mockData";

// Mock the dependencies
vi.mock("@lib/mockData", () => ({
  mockService: {
    getProjects: vi.fn(),
    getUsers: vi.fn(),
    saveProject: vi.fn(),
    deleteProject: vi.fn(),
  },
}));

vi.mock("@components/ui/Icons", () => ({
  Icons: {
    Plus: () => <span>Plus Icon</span>,
    PenTool: () => <span>Edit Icon</span>,
    Trash: () => <span>Delete Icon</span>,
    X: () => <span>Close Icon</span>,
  },
}));

describe("AdminProjects", () => {
  const mockProjects = [
    {
      id: 1,
      title: "Test Project",
      clientId: 1,
      description: "Test Description",
      status: "In Progress",
      currentPhase: "Design",
    },
  ];

  const mockClients = [
    {
      id: 1,
      name: "Test Client",
      role: "Client",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockService.getProjects.mockReturnValue(mockProjects);
    mockService.getUsers.mockReturnValue(mockClients);
    window.confirm = vi.fn(() => true);
  });

  it("renders project list", async () => {
    render(<AdminProjects />);
    await waitFor(() => {
        expect(screen.getByText("Test Project")).toBeInTheDocument();
    });
    expect(screen.getByText("Project Management")).toBeInTheDocument();
    expect(screen.getByText("Test Client")).toBeInTheDocument();
  });

  it("opens modal for new project", async () => {
    render(<AdminProjects />);
    await waitFor(() => {
        expect(screen.getByText("New Project")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("New Project"));
    expect(screen.getByText("Create New Project")).toBeInTheDocument();
  });

  it("opens modal for editing project", async () => {
    render(<AdminProjects />);
    await waitFor(() => {
        expect(screen.getByTitle("Edit")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTitle("Edit"));
    expect(screen.getByText("Edit Project")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test Project")).toBeInTheDocument();
  });

  it("deletes a project", async () => {
    render(<AdminProjects />);
    await waitFor(() => {
        expect(screen.getByTitle("Delete")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTitle("Delete"));
    expect(window.confirm).toHaveBeenCalled();
    expect(mockService.deleteProject).toHaveBeenCalledWith(1);
    await waitFor(() => {
        expect(mockService.getProjects).toHaveBeenCalledTimes(2); // Initial + after delete
    });
  });

  it("submits new project form", async () => {
    render(<AdminProjects />);
    await waitFor(() => {
        expect(screen.getByText("New Project")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("New Project"));
    
    fireEvent.change(screen.getByPlaceholderText("e.g. Website Redesign"), {
      target: { value: "New Project Title" },
    });
    fireEvent.change(screen.getByPlaceholderText("Project details..."), {
        target: { value: "New Description" },
      });
    
    fireEvent.change(screen.getByRole("combobox", { name: /client/i }), {
        target: { value: "1" },
    });

    fireEvent.click(screen.getByText("Create Project"));
    
    expect(mockService.saveProject).toHaveBeenCalled();
    await waitFor(() => {
        expect(screen.queryByText("Create New Project")).not.toBeInTheDocument();
    });
  });
});
