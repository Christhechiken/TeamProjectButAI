// Cơ sở dữ liệu mẫu trên trình duyệt. Phiên bản này dùng localStorage, chưa kết nối máy chủ.
const DB_KEY = 'minischool_db';
const initialData = {
  admin: { id: 1, name: 'Khang Long', user: 'admin', pass: '12345', email: 'admin@minischool.vn' },
  students: [
    { id: 1, name: 'Student Demo', user: 'student1', pass: '12345', email: 'student1@mail.com' },
    { id: 2, name: 'Nguyen Van A', user: 'vana', pass: '12345', email: 'vana@mail.com' }
  ],
  teachers: [{ id: 1, name: 'Teacher Demo', user: 'teacher1', pass: '12345', email: 'teacher1@mail.com' }],
  requests: []
};

const copyInitialData = () => JSON.parse(JSON.stringify(initialData));
const db = {
  get() {
    try {
      const saved = JSON.parse(localStorage.getItem(DB_KEY));
      if (!saved || typeof saved !== 'object') return copyInitialData();
      return {
        admin: saved.admin || { ...initialData.admin },
        students: Array.isArray(saved.students) ? saved.students : JSON.parse(JSON.stringify(initialData.students)),
        teachers: Array.isArray(saved.teachers) ? saved.teachers : JSON.parse(JSON.stringify(initialData.teachers)),
        requests: Array.isArray(saved.requests) ? saved.requests : []
      };
    } catch {
      return copyInitialData();
    }
  },
  save(data) {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
  }
};
