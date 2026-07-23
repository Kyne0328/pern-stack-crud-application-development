import {getEmployeeStatus} from '../constants/employeeStatus.js';

function formatDate(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${String(value).slice(0, 10)}T00:00:00`));
}

export default function EmployeeTable({employees, loading, deletingId, onEdit, onDelete}) {
  if (loading) {
    return <div className="table-message" role="status">Loading employee records…</div>;
  }

  if (employees.length === 0) {
    return (
      <div className="empty-state">
        <h3>No employees found</h3>
        <p>Create an employee record to get started.</p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table>
        <caption className="sr-only">Employee records and available actions</caption>
        <thead>
          <tr>
            <th>ID</th>
            <th>Employee</th>
            <th>Department</th>
            <th>Position</th>
            <th>Join date</th>
            <th>Status</th>
            <th><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => {
            const status = getEmployeeStatus(employee.status);
            const isDeleting = deletingId === employee.employeeId;

            return (
              <tr key={employee.employeeId}>
                <td>{employee.employeeId}</td>
                <td><strong>{employee.firstName} {employee.lastName}</strong></td>
                <td>{employee.department}</td>
                <td>{employee.position}</td>
                <td>{formatDate(employee.joinDate)}</td>
                <td><span className={`status status-${status.className}`}>{status.label}</span></td>
                <td>
                  <div className="row-actions">
                    <button className="text-button" type="button" onClick={() => onEdit(employee)} disabled={isDeleting}>
                      Edit
                    </button>
                    <button
                      className="text-button danger"
                      type="button"
                      onClick={() => onDelete(employee)}
                      disabled={isDeleting}
                      aria-label={`Delete employee ID ${employee.employeeId}`}
                    >
                      {isDeleting ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
