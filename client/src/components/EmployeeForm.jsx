import { useEffect, useState } from 'react';
import { EMPLOYEE_STATUS, EMPLOYEE_STATUS_OPTIONS } from '../constants/employeeStatus.js';
import { validateEmployeeInput } from '../validation/employeeValidation.js';

function getLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function createEmptyEmployee() {
  return {
    employeeNumber: '',
    firstName: '',
    lastName: '',
    department: '',
    position: '',
    status: EMPLOYEE_STATUS.ACTIVE,
    joinDate: getLocalDate(),
  };
}

const fields = [
  {name: 'employeeNumber', label: 'Employee number', type: 'text', maxLength: 30, autoComplete: 'off'},
  {name: 'firstName', label: 'First name', type: 'text', maxLength: 100, autoComplete: 'given-name'},
  {name: 'lastName', label: 'Last name', type: 'text', maxLength: 100, autoComplete: 'family-name'},
  {name: 'department', label: 'Department', type: 'text', maxLength: 100, autoComplete: 'organization'},
  {name: 'position', label: 'Position', type: 'text', maxLength: 100, autoComplete: 'organization-title'},
  {name: 'joinDate', label: 'Join date', type: 'date', autoComplete: 'off'},
];

export default function EmployeeForm({employee, saving, onCancel, onSubmit}) {
  const [values, setValues] = useState(createEmptyEmployee);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setValues(employee ? {
      employeeNumber: employee.employeeNumber,
      firstName: employee.firstName,
      lastName: employee.lastName,
      department: employee.department,
      position: employee.position,
      status: employee.status,
      joinDate: String(employee.joinDate).slice(0, 10),
    } : createEmptyEmployee());
    setErrors({});
  }, [employee]);

  function handleChange(event) {
    const {name, value} = event.target;
    let normalizedValue = name === 'status' ? Number(value) : value;
    if (name === 'employeeNumber') normalizedValue = value.toUpperCase();

    setValues((current) => ({...current, [name]: normalizedValue}));
    setErrors((current) => ({...current, [name]: undefined}));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validation = validateEmployeeInput(values);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      await onSubmit(validation.data);
    } catch (error) {
      setErrors(error.details || {});
    }
  }

  return (
    <section className="panel form-panel" id="employee-form" aria-labelledby="employee-form-heading">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Employee record</p>
          <h2 id="employee-form-heading">{employee ? 'Edit employee' : 'Add employee'}</h2>
        </div>
        <button className="icon-button" type="button" onClick={onCancel} disabled={saving} aria-label="Close employee form">×</button>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          {fields.map((field, index) => {
            const errorId = `${field.name}-error`;
            return (
              <label className="field" key={field.name}>
                <span>{field.label}</span>
                <input
                  name={field.name}
                  type={field.type}
                  value={values[field.name]}
                  onChange={handleChange}
                  maxLength={field.maxLength}
                  autoComplete={field.autoComplete}
                  aria-invalid={Boolean(errors[field.name])}
                  aria-describedby={errors[field.name] ? errorId : undefined}
                  autoFocus={index === 0}
                  required
                />
                {errors[field.name] && <small id={errorId} className="field-error">{errors[field.name]}</small>}
              </label>
            );
          })}

          <label className="field">
            <span>Status</span>
            <select name="status" value={values.status} onChange={handleChange} aria-invalid={Boolean(errors.status)}>
              {EMPLOYEE_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            {errors.status && <small className="field-error">{errors.status}</small>}
          </label>
        </div>

        <div className="form-actions">
          <button className="button button-secondary" type="button" onClick={onCancel} disabled={saving}>Cancel</button>
          <button className="button button-primary" type="submit" disabled={saving}>
            {saving ? 'Saving…' : employee ? 'Save changes' : 'Create employee'}
          </button>
        </div>
      </form>
    </section>
  );
}
