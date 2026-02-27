const express = require('express');
const router = express.Router();
const { getShifts, createShift, clockIn, clockOut, checkTodayAttendance, getEmployees, updateEmployeeHr, getPayrollReport, savePayroll, submitLeave, getMyStats, getAllAttendanceHistory } = require('../controllers/hrController');

// Route untuk Shift
router.get('/shifts', getShifts);
router.post('/shifts', createShift);

// Route untuk Absensi
router.post('/attendance/clock-in', clockIn);
router.post('/attendance/clock-out', clockOut);
router.get('/attendance/today/:user_id', checkTodayAttendance);

// Route untuk Karyawan
router.get('/employees', getEmployees);
router.put('/employees/:id', updateEmployeeHr);
router.post('/attendance/leave', submitLeave);
router.get('/my-stats/:user_id', getMyStats);

// Route untuk Penggajian (Payroll)
router.get('/payrolls', getPayrollReport);
router.post('/payrolls', savePayroll);

router.get('/attendance-history', getAllAttendanceHistory);

module.exports = router;