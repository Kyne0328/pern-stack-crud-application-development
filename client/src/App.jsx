import {useCallback, useEffect, useState} from 'react';
import {
  createEmployee,
  deleteEmployee,
  getDepartments,
  getEmployees,
  updateEmployee,
} from './api/employeeApi.js';
import EmployeeForm from './components/EmployeeForm.jsx';
import EmployeeTable from './components/EmployeeTable.jsx';
import Pagination from './components/Pagination.jsx';
import {EMPLOYEE_STATUS_OPTIONS} from './constants/employeeStatus.js';

const PAGE_SIZE = 10;
const initialMeta = {page: 1, pageSize: PAGE_SIZE, total: 0, totalPages: 1};
const initialSummary = {totalEmployees: 0, activeEmployees: 0, inactiveEmployees: 0, departments: 0};

export default function App() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filters, setFilters] = useState({search: '', status: ''});
  const [appliedFilters, setAppliedFilters] = useState({search: '', status: ''});
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(initialMeta);
  const [summary, setSummary] = useState(initialSummary);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [referenceLoading, setReferenceLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [notice, setNotice] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [referenceError, setReferenceError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  const loadDepartments = useCallback(async () => {
    setReferenceLoading(true);
    setReferenceError(null);

    try {
      const response = await getDepartments();
      setDepartments(response.data);
    } catch (error) {
      setReferenceError(error.message);
    } finally {
      setReferenceLoading(false);
    }
  }, []);

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
    loadDepartments();
  }, [loadDepartments]);

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

  async function handleDelete(employee) {
    const confirmed = window.confirm(
      `Permanently delete ${employee.firstName} ${employee.lastName}? This cannot be undone.`,
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

      requestReload();
    } catch (error) {
      setNotice({type: 'error', message: error.message});
    } finally {
      setDeletingId(null);
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
            <p>Create, review, update, and permanently delete employee records through a PostgreSQL-backed Express API.</p>
          </div>
          <button
            className="button button-primary"
            type="button"
            onClick={openCreateForm}
            disabled={referenceLoading || departments.length === 0}
          >
            Add employee
          </button>
        </section>

        {notice && (
          <div className={`notice notice-${notice.type}`} role="status" aria-live="polite">
            <span>{notice.message}</span>
            <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss notification">×</button>
          </div>
        )}

        {referenceError && (
          <div className="notice notice-error" role="alert">
            <span>Department and position options could not be loaded: {referenceError}</span>
            <button type="button" onClick={loadDepartments} aria-label="Retry loading departments">↻</button>
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
            departments={departments}
            referenceLoading={referenceLoading}
            referenceError={referenceError}
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
                deletingId={deletingId}
                onEdit={openEditForm}
                onDelete={handleDelete}
              />
              <Pagination meta={meta} loading={loading} onPageChange={setPage} />
            </>
          )}
        </section>
      </main>
    </div>
  );
}
