import { describe, it, expect, beforeEach } from 'vitest';
import { mockService } from './mockData';

describe('mockService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should retrieve projects', () => {
    const projects = mockService.getProjects();
    expect(projects).toBeDefined();
    expect(Array.isArray(projects)).toBe(true);
    expect(projects.length).toBeGreaterThan(0);
  });

  it('should filter projects by clientId', () => {
    const projects = mockService.getProjects(1);
    expect(projects).toBeDefined();
    projects.forEach(p => {
      expect(p.clientId).toBe(1);
    });
  });

  it('should create a ticket', () => {
    const newTicket = {
      clientId: 1,
      subject: 'Test Ticket',
      priority: 'High',
      message: 'Test message',
      sender: 'Client'
    };
    
    const created = mockService.createTicket(newTicket);
    expect(created).toBeDefined();
    expect(created.subject).toBe('Test Ticket');
    expect(created.messages).toHaveLength(1);
    expect(created.messages[0].text).toBe('Test message');
    
    const tickets = mockService.getTickets(1);
    expect(tickets.find(t => t.id === created.id)).toBeDefined();
  });
});
