const EMPLOYEE_STATUS = Object.freeze({
  INACTIVE: 0,
  ACTIVE: 1,
});

const EMPLOYEE_STATUS_VALUES = new Set(Object.values(EMPLOYEE_STATUS));

module.exports = {EMPLOYEE_STATUS, EMPLOYEE_STATUS_VALUES};
