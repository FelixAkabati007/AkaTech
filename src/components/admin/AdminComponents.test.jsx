import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminClients } from "./AdminClients";
import { AdminProjects } from "./AdminProjects";
import { AdminBilling } from "./AdminBilling";
import { AdminSupport } from "./AdminSupport";
import { mockService } from "@lib/mockData";

// Mock the mockService methods
vi.mock("@lib/mockData", () => ({
  mockService: {
    getUsers: vi.fn(),
    saveUser: vi.fn(),
    deleteUser: vi.fn(),
    getProjects: vi.fn(),
    saveProject: vi.fn(),
    getInvoices: vi.fn(),
    saveInvoice: vi.fn(),
    getTickets: vi.fn(),
    updateTicketStatus: vi.fn(),
  },
}));

// Mock the Icons component
vi.mock("@components/ui/Icons", () => ({
  Icons: {
    Plus: () => <span>Plus Icon</span>,
    PenTool: () => <span>Edit Icon</span>,
    Trash: () => <span>Delete Icon</span>,
    User: () => <span>User Icon</span>,
    Download: () => <span>Download Icon</span>,
    MessageSquare: () => <span>Message Icon</span>,
    Check: () => <span>CheckIcon</span>,
    Clock: () => <span>ClockIcon</span>,
    MoreHorizontal: () => <span>MoreHorizontalIcon</span>,
    X: () => <span>XIcon</span>,
    Search: () => <span>SearchIcon</span>,
    Filter: () => <span>FilterIcon</span>,
    Calendar: () => <span>CalendarIcon</span>,
    ChevronRight: () => <span>ChevronRightIcon</span>,
  },
}));

describe("Admin Portal Components", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("AdminClients", () => {
    it("renders user list and allows adding a user", async () => {
      const mockUsers = [
        { id: 1, name: "John Doe", email: "john@example.com", role: "client" },
      ];
      mockService.getUsers.mockReturnValue(mockUsers);

      render(<AdminClients />);

      expect(screen.getByText("User Management")).toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument();

      // Open modal
      fireEvent.click(screen.getByText("Add User"));
      expect(screen.getByText("Add New User")).toBeInTheDocument();

      // Fill form
      fireEvent.change(screen.getByLabelText("Full Name"), {
        target: { value: "Jane Doe" },
      });
      fireEvent.change(screen.getByLabelText("Email"), {
        target: { value: "jane@example.com" },
      });

      // Submit
      fireEvent.submit(screen.getByRole("form", { name: "add-user-form" }));

      expect(mockService.saveUser).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Jane Doe",
          email: "jane@example.com",
          role: "client",
        })
      );
    });
  });

  describe("AdminProjects", () => {
    it("renders project list and allows creating a project", async () => {
      const mockProjects = [
        {
          id: 1,
          title: "Project Alpha",
          clientId: 1,
          status: "In Progress",
          description: "Test project",
        },
      ];
      const mockUsers = [{ id: 1, name: "Client One", role: "client" }];
      mockService.getProjects.mockReturnValue(mockProjects);
      mockService.getUsers.mockReturnValue(mockUsers);

      render(<AdminProjects />);

      expect(screen.getByText("Project Management")).toBeInTheDocument();
      expect(screen.getByText("Project Alpha")).toBeInTheDocument();

      // Open modal
      fireEvent.click(screen.getByText("New Project"));
      expect(screen.getByText("Create New Project")).toBeInTheDocument();

      // Fill form
      fireEvent.change(screen.getByLabelText("Project Title"), {
        target: { value: "Project Beta" },
      });
      fireEvent.change(screen.getByLabelText("Client (ID)"), {
        target: { value: "1" },
      });
      fireEvent.change(screen.getByLabelText("Description"), {
        target: { value: "New description" },
      });

      // Submit
      fireEvent.click(screen.getByText("Create Project"));

      expect(mockService.saveProject).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Project Beta",
          clientId: 1,
          description: "New description",
        })
      );
    });
  });

  describe("AdminBilling", () => {
    it("renders invoice list and allows creating an invoice", async () => {
      const mockInvoices = [
        {
          id: "INV-001",
          projectId: 1,
          amount: 1000,
          status: "Paid",
          date: "2023-01-01",
        },
      ];
      const mockProjects = [{ id: 1, title: "Project Alpha" }];
      mockService.getInvoices.mockReturnValue(mockInvoices);
      mockService.getProjects.mockReturnValue(mockProjects);

      render(<AdminBilling />);

      expect(screen.getByText("Financial Management")).toBeInTheDocument();
      expect(screen.getByText("INV-001")).toBeInTheDocument();

      // Open modal
      fireEvent.click(screen.getByText("Create Invoice"));
      expect(screen.getByText("Create New Invoice")).toBeInTheDocument();

      // Fill form
      fireEvent.change(screen.getByLabelText("Project"), {
        target: { value: "1" },
      });
      fireEvent.change(screen.getByLabelText("Amount (GH₵)"), {
        target: { value: "500" },
      });
      fireEvent.change(screen.getByLabelText("Due Date"), {
        target: { value: "2023-12-31" },
      });

      // Submit
      fireEvent.submit(
        screen.getByRole("form", { name: "create-invoice-form" })
      );

      await waitFor(() => {
        expect(mockService.saveInvoice).toHaveBeenCalledWith(
          expect.objectContaining({
            projectId: 1,
            amount: 500,
            status: "Sent",
          })
        );
      });
    });
  });

  describe("AdminSupport", () => {
    it("renders ticket list and allows updating status", async () => {
      const mockTickets = [
        {
          id: 1,
          subject: "Issue 1",
          clientId: 1,
          priority: "High",
          status: "Open",
        },
      ];
      const mockUsers = [{ id: 1, name: "Client One" }];
      mockService.getTickets.mockReturnValue(mockTickets);
      mockService.getUsers.mockReturnValue(mockUsers);

      render(<AdminSupport />);

      expect(screen.getByText("Support Tickets")).toBeInTheDocument();
      expect(screen.getByText("Issue 1")).toBeInTheDocument();

      // Change status
      const select = screen.getByRole("combobox");
      fireEvent.change(select, { target: { value: "In Progress" } });

      expect(mockService.updateTicketStatus).toHaveBeenCalledWith(
        1,
        "In Progress"
      );
    });
  });
});
