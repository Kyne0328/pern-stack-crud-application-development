import { useCallback, useEffect, useState } from 'react';
import {
  createEmployee,
  deactivateEmployee,
  getEmployees,
  updateEmployee,
  updateEmployeeStatus,
} from './api/employeeApi.js';
import EmployeeForm from './components/EmployeeForm.jsx';
import EmployeeTable from './components/EmployeeTable.jsx';
import Pagination from './components/Pagination.jsx';
import { EMPLOYEE_STATUS, EMPLOYEE_STATUS_OPTIONS } from './constants/employeeStatus.js';

const PAGE_SIZE = 8;
const initialMeta = {page: 1, pageSize: PAGE_SIZE, total: 0, totalPages: 1};
const initialSummary = {totalEmployees: 0, activeEmployees: 0, inactiveEmployees: 0, departments: 0};

export default function App() {
  const [employees, setEmployees] = useState([]);
  const [filters, setFilters] = useState({search: '', status: ''});
  const [appliedFilters, setAppliedFilters] = useState({search: '', status: ''});
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(initialMeta);
  const [summary, setSummary] = useState(initialSummary);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [notice, setNotice] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    try {
      const response = await getEmployees({...appliedFilters, page, pageSize: PAGE_SIZE});

      if (page > response.meta.totalPages) {
        setPage(response.meta.totalPages);
        return;
      }

      setEmployees(response.data);
      setMeta(response.meta);
      setSummary(response.summary);
    } catch (error) {
      setLoadError(error.message);
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, page, reloadToken]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  function requestReload() {
    setReloadToken((current) => current + 1);
  }

  function revealForm() {
    window.requestAnimationFrame(() => {
      document.getElementById('employee-form')?.scrollIntoView({behavior: 'smooth', block: 'start'});
    });
  }

  function openCreateForm() {
    setEditingEmployee(null);
    setFormOpen(true);
    revealForm();
  }

  function openEditForm(employee) {
    setEditingEmployee(employee);
    setFormOpen(true);
    revealForm();
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
      setFormOpen(false);
      setEditingEmployee(null);
      if (creating) setPage(1);
      requestReload();
    } catch (error) {
      setNotice({type: 'error', message: error.message});
      throw error;
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(employee) {
    const isActive = employee.status === EMPLOYEE_STATUS.ACTIVE;
    const action = isActive ? 'deactivate' : 'reactivate';
    const confirmed = window.confirm(`${action[0].toUpperCase()}${action.slice(1)} ${employee.firstName} ${employee.lastName}?`);
    if (!confirmed) return;

    setUpdatingId(employee.employeeId);
    setNotice(null);

    try {
      const response = isActive
        ? await deactivateEmployee(employee.employeeId)
        : await updateEmployeeStatus(employee.employeeId, EMPLOYEE_STATUS.ACTIVE);
      setNotice({type: 'success', message: response.message});
      requestReload();
    } catch (error) {
      setNotice({type: 'error', message: error.message});
    } finally {
      setUpdatingId(null);
    }
  }

  function applyFilters(event) {
    event.preventDefault();
    setPage(1);
    setAppliedFilters({...filters});
    requestReload();
  }

  function clearFilters() {
    const cleared = {search: '', status: ''};
    setFilters(cleared);
    setAppliedFilters(cleared);
    setPage(1);
    requestReload();
  }

  function updateStatusFilter(event) {
    const value = event.target.value;
    setFilters((current) => ({...current, status: value === '' ? '' : Number(value)}));
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-mark" aria-hidden="true">H</div>
        <div>
          <strong>HRIS–DTR</strong>
          <span>Employee Management</span>
        </div>
      </header>

      <main className="page">
        <section className="page-header">
          <div>
            <p className="eyebrow">PERN stack CRUD application</p>
            <h1>Employee management</h1>
            <p>Create, review, update, deactivate, and restore employee records through a PostgreSQL-backed Express API.</p>
          </div>
          <button className="button button-primary" type="button" onClick={openCreateForm}>Add employee</button>
        </section>

        {notice && (
          <div className={`notice notice-${notice.type}`} role="status" aria-live="polite">
            <span>{notice.message}</span>
            <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss notification">×</button>
          </div>
        )}

        <section className="stats" aria-label="Employee summary">
          <article><span>Total employees</span><strong>{summary.totalEmployees}</strong></article>
          <article><span>Active</span><strong>{summary.activeEmployees}</strong></article>
          <article><span>Inactive</span><strong>{summary.inactiveEmployees}</strong></article>
          <article><span>Departments</span><strong>{summary.departments}</strong></article>
        </section>

        {formOpen && (
          <EmployeeForm
            employee={editingEmployee}
            saving={saving}
            onCancel={closeForm}
            onSubmit={saveEmployee}
          />
        )}

        <section className="panel">
          <div className="panel-heading list-heading">
            <div>
              <p className="eyebrow">Employee directory</p>
              <h2>{meta.total} matching record{meta.total === 1 ? '' : 's'}</h2>
            </div>
            <form className="filters" onSubmit={applyFilters}>
              <label className="sr-only" htmlFor="employee-search">Search employees</label>
              <input
                id="employee-search"
                type="search"
                placeholder="Search name, number, department…"
                value={filters.search}
                onChange={(event) => setFilters((current) => ({...current, search: event.target.value}))}
                maxLength={100}
              />
              <label className="sr-only" htmlFor="status-filter">Filter by status</label>
              <select id="status-filter" value={filters.status} onChange={updateStatusFilter}>
                <option value="">All statuses</option>
                {EMPLOYEE_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <button className="button button-secondary" type="submit" disabled={loading}>Apply</button>
              <button className="button button-ghost" type="button" onClick={clearFilters} disabled={loading}>Clear</button>
            </form>
          </div>

          {loadError ? (
            <div className="load-error" role="alert">
              <h3>Employee records could not be loaded</h3>
              <p>{loadError}</p>
              <button className="button button-secondary" type="button" onClick={requestReload}>Try again</button>
            </div>
          ) : (
            <>
              <EmployeeTable
                employees={employees}
                loading={loading}
                updatingId={updatingId}
                onEdit={openEditForm}
                onStatusChange={handleStatusChange}
              />
              <Pagination meta={meta} loading={loading} onPageChange={setPage} />
            </>
          )}
        </section>
      </main>
    </div>
  );
}
