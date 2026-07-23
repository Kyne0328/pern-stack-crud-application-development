export const EMPLOYEE_STATUS = Object.freeze({
  INACTIVE: 0,
  ACTIVE: 1,
});

export const EMPLOYEE_STATUS_VALUES = new Set(Object.values(EMPLOYEE_STATUS));

export const EMPLOYEE_STATUS_OPTIONS = Object.freeze([
  {value: EMPLOYEE_STATUS.ACTIVE, label: 'Active', className: 'active'},
  {value: EMPLOYEE_STATUS.INACTIVE, label: 'Inactive', className: 'inactive'},
]);

export function getEmployeeStatus(status) {
  return EMPLOYEE_STATUS_OPTIONS.find((option) => option.value === status)
    || {value: status, label: 'Unknown', className: 'unknown'};
}
