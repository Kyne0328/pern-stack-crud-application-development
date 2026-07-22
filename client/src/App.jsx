import {useEffect, useState} from 'react';
import {
  createEmployee,
  deleteEmployee,
  getDepartments,
  getEmployees,
  updateEmployee,
} from './api/employeeApi.js';
import EmployeeForm from './components/EmployeeForm.jsx';
import EmployeeTable from './components/EmployeeTable.jsx';

export default function App() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [notice, setNotice] = useState(null);
  const [error, setError] = useState('');

  async function loadData() {
    setLoading(true);
    setError('');

    try {
      const [employeeResponse, departmentResponse] = await Promise.all([
        getEmployees(),
        getDepartments(),
      ]);

      setEmployees(employeeResponse.data);
      setDepartments(departmentResponse.data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function openCreateForm() {
    setEditingEmployee(null);
    setFormOpen(true);
  }

  function openEditForm(employee) {
    setEditingEmployee(employee);
    setFormOpen(true);
  }

  function closeForm() {
    if (saving) return;
    setEditingEmployee(null);
    setFormOpen(false);
  }

  async function saveEmployee(values) {
    const creating = editingEmployee === null;
    setSaving(true);
    setNotice(null);

    try {
      const response = creating
        ? await createEmployee(values)
        : await updateEmployee(editingEmployee.employeeId, values);

      setNotice({type: 'success', message: response.message});
      setEditingEmployee(null);
      setFormOpen(false);
      await loadData();
    } catch (requestError) {
      setNotice({type: 'error', message: requestError.message});
      throw requestError;
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(employee) {
    const confirmed = window.confirm(
      `Delete ${employee.firstName} ${employee.lastName}? This cannot be undone.`,
    );
    if (!confirmed) return;

    setDeletingId(employee.employeeId);
    setNotice(null);

    try {
      const response = await deleteEmployee(employee.employeeId);
      setNotice({type: 'success', message: response.message});

      if (editingEmployee?.employeeId === employee.employeeId) {
        setEditingEmployee(null);
        setFormOpen(false);
      }

      await loadData();
    } catch (requestError) {
      setNotice({type: 'error', message: requestError.message});
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="page">
      <section className="page-header">
        <div>
          <h1>Employee management</h1>
          <p>{employees.length} employee{employees.length === 1 ? '' : 's'}</p>
        </div>
        <button
          className="button button-primary"
          type="button"
          onClick={openCreateForm}
          disabled={loading || departments.length === 0}
        >
          Add employee
        </button>
      </section>

      {notice && (
        <div className={`notice notice-${notice.type}`} role="status">
          <span>{notice.message}</span>
          <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss notification">×</button>
        </div>
      )}

      {error && (
        <div className="notice notice-error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={loadData}>Try again</button>
        </div>
      )}

      {formOpen && (
        <EmployeeForm
          employee={editingEmployee}
          departments={departments}
          referenceLoading={loading}
          referenceError={error}
          saving={saving}
          onCancel={closeForm}
          onSubmit={saveEmployee}
        />
      )}

      <section className="panel">
        <div className="panel-heading">
          <h2>Employees</h2>
        </div>
        <EmployeeTable
          employees={employees}
          loading={loading}
          deletingId={deletingId}
          onEdit={openEditForm}
          onDelete={handleDelete}
        />
      </section>
    </main>
  );
}
