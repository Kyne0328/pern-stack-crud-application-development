import {useEffect, useMemo, useState} from 'react';
import {EMPLOYEE_STATUS, EMPLOYEE_STATUS_OPTIONS} from '../constants/employeeStatus.js';
import {validateEmployeeInput} from '../validation/employeeValidation.js';

function getLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function createEmptyEmployee() {
  return {
    firstName: '',
    lastName: '',
    departmentId: '',
    positionId: '',
    status: EMPLOYEE_STATUS.ACTIVE,
    joinDate: getLocalDate(),
  };
}

const textFields = [
  {name: 'firstName', label: 'First name', maxLength: 100, autoComplete: 'given-name'},
  {name: 'lastName', label: 'Last name', maxLength: 100, autoComplete: 'family-name'},
];

export default function EmployeeForm({
  employee,
  departments,
  referenceLoading,
  referenceError,
  saving,
  onCancel,
  onSubmit,
}) {
  const [values, setValues] = useState(createEmptyEmployee);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setValues(employee ? {
      firstName: employee.firstName,
      lastName: employee.lastName,
      departmentId: String(employee.departmentId),
      positionId: String(employee.positionId),
      status: employee.status,
      joinDate: String(employee.joinDate).slice(0, 10),
    } : createEmptyEmployee());
    setErrors({});
  }, [employee]);

  const selectedDepartment = useMemo(
    () => departments.find((department) => String(department.departmentId) === String(values.departmentId)),
    [departments, values.departmentId],
  );
  const availablePositions = selectedDepartment?.positions ?? [];

  function handleChange(event) {
    const {name, value} = event.target;

    if (name === 'departmentId') {
      setValues((current) => ({...current, departmentId: value, positionId: ''}));
      setErrors((current) => ({...current, departmentId: undefined, positionId: undefined}));
      return;
    }

    const normalizedValue = name === 'status' ? Number(value) : value;
    setValues((current) => ({...current, [name]: normalizedValue}));
    setErrors((current) => ({...current, [name]: undefined}));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validation = validateEmployeeInput(values, departments);

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
          <h2 id="employee-form-heading">{employee ? `Edit employee ID ${employee.employeeId}` : 'Add employee'}</h2>
        </div>
        <button className="icon-button" type="button" onClick={onCancel} disabled={saving} aria-label="Close employee form">×</button>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {referenceError && <div className="notice notice-error" role="alert"><span>{referenceError}</span></div>}

        <div className="form-grid">
          {textFields.map((field, index) => {
            const errorId = `${field.name}-error`;
            return (
              <label className="field" key={field.name}>
                <span>{field.label}</span>
                <input
                  name={field.name}
                  type="text"
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
            <span>Department</span>
            <select
              name="departmentId"
              value={values.departmentId}
              onChange={handleChange}
              disabled={referenceLoading || Boolean(referenceError)}
              aria-invalid={Boolean(errors.departmentId)}
              required
            >
              <option value="">{referenceLoading ? 'Loading departments…' : 'Select department'}</option>
              {departments.map((department) => (
                <option key={department.departmentId} value={department.departmentId}>{department.departmentName}</option>
              ))}
            </select>
            {errors.departmentId && <small className="field-error">{errors.departmentId}</small>}
          </label>

          <label className="field">
            <span>Position</span>
            <select
              name="positionId"
              value={values.positionId}
              onChange={handleChange}
              disabled={!values.departmentId || referenceLoading || Boolean(referenceError)}
              aria-invalid={Boolean(errors.positionId)}
              required
            >
              <option value="">{values.departmentId ? 'Select position' : 'Select a department first'}</option>
              {availablePositions.map((position) => (
                <option key={position.positionId} value={position.positionId}>{position.positionName}</option>
              ))}
            </select>
            {errors.positionId && <small className="field-error">{errors.positionId}</small>}
          </label>

          <label className="field">
            <span>Join date</span>
            <input
              name="joinDate"
              type="date"
              value={values.joinDate}
              onChange={handleChange}
              aria-invalid={Boolean(errors.joinDate)}
              required
            />
            {errors.joinDate && <small className="field-error">{errors.joinDate}</small>}
          </label>

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
          <button className="button button-primary" type="submit" disabled={saving || referenceLoading || Boolean(referenceError)}>
            {saving ? 'Saving…' : employee ? 'Save changes' : 'Create employee'}
          </button>
        </div>
      </form>
    </section>
  );
}
