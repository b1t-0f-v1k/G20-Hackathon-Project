// utils/StatusManager.js
export class StatusManager {
  constructor(projectId) {
    this.projectId = projectId;
  }

  async getStatus() {
    const res = await fetch(`/api/sme-projects/${this.projectId}/status`);
    if (!res.ok) throw new Error('Failed to fetch status');
    return await res.json();
  }

  async updateStatus(newStatus) {
    const res = await fetch(`/api/sme-projects/${this.projectId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    if (!res.ok) throw new Error('Failed to update status');
    return await res.json();
  }

  static getStatusColor(status) {
    const colors = {
      active: '#28a745',
      completed: '#17a2b8',
      cancelled: '#dc3545'
    };
    return colors[status] || '#6c757d';
  }

  static getStatusOptions() {
    return [
      { value: 'active', label: 'Active' },
      { value: 'completed', label: 'Completed' },
      { value: 'cancelled', label: 'Cancelled' }
    ];
  }
}