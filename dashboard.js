const rolePage = document.body.dataset.role;
const rolePaths = {
  admin: 'admin/admin.html',
  teacher: 'teacher/teacher.html',
  student: 'student/student.html'
};

function getSignedInUser() {
  try { return JSON.parse(sessionStorage.getItem('ms_user') || 'null'); }
  catch { return null; }
}

const signedInUser = getSignedInUser();
if (rolePage === 'router') {
  location.replace(signedInUser && rolePaths[signedInUser.role] ? rolePaths[signedInUser.role] : 'login-register/login.html');
} else if (!signedInUser || signedInUser.role !== rolePage) {
  location.replace(signedInUser && rolePaths[signedInUser.role] ? `../${rolePaths[signedInUser.role]}` : '../login-register/login.html');
} else {
  initializeDashboard(signedInUser, rolePage);
}

function initializeDashboard(user, role) {
  const $ = (id) => document.getElementById(id);
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => `&#${character.charCodeAt(0)};`);
  const titleCase = (value) => value.charAt(0).toUpperCase() + value.slice(1);
  const isAdmin = role === 'admin';
  let currentPage = 'home';
  const menus = {
    admin: [['home', 'Tổng quan'], ['students', 'Danh sách học sinh'], ['teachers', 'Danh sách giáo viên'], ['requests', 'Yêu cầu đăng ký']],
    teacher: [['home', 'Tổng quan'], ['lessons', 'Lịch giảng dạy'], ['students', 'Danh sách học sinh']],
    student: [['home', 'Tổng quan'], ['timetable', 'Thời khóa biểu']]
  };
  const weekDays = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
  const lessons = [
    { day: 1, name: 'Ngữ pháp A2', time: '18:00 – 19:30', room: 'Phòng 101' },
    { day: 3, name: 'Luyện nói B1', time: '19:00 – 20:30', room: 'Phòng 202' },
    { day: 5, name: 'IELTS Coach', time: '09:00 – 11:00', room: 'Phòng 303' }
  ];

  function pageHeading(eyebrow, heading, description) {
    return `<header class="page-heading"><p class="page-heading__eyebrow">${eyebrow}</p><h2>${heading}</h2><p>${description}</p></header>`;
  }

  function schedule() {
    return `<section class="schedule-grid" aria-label="Lịch học trong tuần">${weekDays.map((day, index) => {
      const dayLessons = lessons.filter((lesson) => lesson.day === index);
      return `<article class="schedule-day"><h3 class="schedule-day__name">${day}</h3>${dayLessons.length
        ? dayLessons.map((lesson) => `<div class="lesson-card">${lesson.name}<small>${lesson.time}<br>${lesson.room}</small></div>`).join('')
        : '<p class="schedule-empty">Chưa có lớp học</p>'}</article>`;
    }).join('')}</section>`;
  }

  function summaryCard(label, value, note) {
    return `<article class="summary-card"><span>${label}</span><strong>${value}<small>${note}</small></strong></article>`;
  }

  function homePage() {
    const data = db.get();
    const subheading = role === 'admin'
      ? 'Quản lý thành viên và yêu cầu đăng ký của Minischool.'
      : role === 'teacher'
        ? 'Theo dõi lớp học và danh sách học sinh của bạn.'
        : 'Xem nhanh lịch học và thông tin lớp học của bạn.';
    const counts = role === 'admin'
      ? `<section class="summary-grid" aria-label="Thống kê trường học">${summaryCard('Tổng số học sinh', data.students.length, 'học sinh')}${summaryCard('Đội ngũ giáo viên', data.teachers.length, 'giáo viên')}${summaryCard('Yêu cầu chờ duyệt', data.requests.length, 'yêu cầu')}</section>`
      : role === 'teacher'
        ? `<section class="summary-grid" aria-label="Thống kê giảng dạy">${summaryCard('Học sinh', data.students.length, 'đang học')}${summaryCard('Buổi học', lessons.filter((lesson) => lesson.day >= 0).length, 'buổi / tuần')}${summaryCard('Lịch tiếp theo', '18:00', 'Thứ 3')}</section>`
        : `<section class="summary-grid" aria-label="Thông tin học tập">${summaryCard('Lớp đang tham gia', '01', 'lớp học')}${summaryCard('Buổi học tuần này', lessons.length, 'buổi')}${summaryCard('Buổi tiếp theo', '18:00', 'Thứ 3')}</section>`;
    return `${pageHeading(`Xin chào, ${escapeHtml(user.name)}`, 'Chào mừng đến Minischool', subheading)}
      <section class="welcome-panel"><div><h3>${role === 'student' ? 'Sẵn sàng cho buổi học tiếp theo?' : role === 'teacher' ? 'Lớp học của bạn luôn trong tầm tay.' : 'Tổng quan lớp học của bạn.'}</h3><p>${role === 'admin' ? 'Xem nhanh số lượng thành viên và xử lý các yêu cầu đăng ký mới.' : 'Lịch học và thông tin lớp đã được sắp xếp tại một nơi để bạn dễ theo dõi.'}</p></div><span class="welcome-panel__mark" aria-hidden="true">M</span></section>
      ${counts}
      <section class="dashboard-card"><div class="dashboard-card__heading"><div><h3>${role === 'student' ? 'Thời khóa biểu tuần này' : 'Lịch học trong tuần'}</h3><p>Lịch mẫu Minischool · 12–18 tháng 10</p></div></div>${schedule()}</section>`;
  }

  function peoplePage(key, heading) {
    const people = db.get()[key] || [];
    const addForm = isAdmin ? `<form class="inline-form" data-key="${key}">
      <div class="inline-form__field"><label for="new-${key}-name">Họ và tên</label><input id="new-${key}-name" name="name" autocomplete="name" placeholder="Nhập họ tên" required></div>
      <div class="inline-form__field"><label for="new-${key}-username">Tên đăng nhập</label><input id="new-${key}-username" name="user" autocomplete="username" placeholder="Tạo tên đăng nhập" required></div>
      <div class="inline-form__field"><label for="new-${key}-email">Email</label><input id="new-${key}-email" name="email" type="email" autocomplete="email" placeholder="name@email.com" required></div>
      <button class="button" type="submit">Thêm thành viên</button>
    </form>` : '';
    const rows = people.map((person) => `<tr><td class="data-table__primary">${escapeHtml(person.name)}</td><td>${escapeHtml(person.user)}</td><td>${escapeHtml(person.email)}</td>${isAdmin ? `<td><button class="button button--danger" type="button" data-act="delete" data-key="${key}" data-id="${person.id}" aria-label="Xóa ${escapeHtml(person.name)}">Xóa</button></td>` : ''}</tr>`).join('');
    const blank = `<tr><td class="table-empty" colspan="${isAdmin ? 4 : 3}">Chưa có thành viên trong danh sách.</td></tr>`;
    const headingText = isAdmin ? 'Tạo và cập nhật danh sách thành viên trong trường.' : 'Thông tin thành viên đang học trong Minischool.';
    return `${pageHeading('Thành viên', heading, headingText)}<section class="dashboard-card"><div class="dashboard-card__heading"><div><h3>${heading}</h3><p>${people.length} thành viên</p></div></div>${addForm}<div class="table-wrap"><table class="data-table"><thead><tr><th scope="col">Họ và tên</th><th scope="col">Tên đăng nhập</th><th scope="col">Email</th>${isAdmin ? '<th scope="col">Thao tác</th>' : ''}</tr></thead><tbody>${rows || blank}</tbody></table></div></section>`;
  }

  function requestsPage() {
    const requests = db.get().requests;
    const rows = requests.map((request) => `<tr><td class="data-table__primary">${escapeHtml(request.name || request.user)}</td><td>${escapeHtml(request.user)}</td><td>${escapeHtml(request.email)}</td><td>${escapeHtml(request.phone)}</td><td><span class="status-pill">Chờ duyệt</span></td><td><button class="button" type="button" data-act="approve" data-id="${request.id}">Duyệt</button> <button class="button button--danger" type="button" data-act="deny" data-id="${request.id}">Từ chối</button></td></tr>`).join('');
    return `${pageHeading('Quản lý thành viên', 'Yêu cầu đăng ký', 'Duyệt tài khoản học sinh mới tham gia Minischool.')}<section class="dashboard-card"><div class="dashboard-card__heading"><div><h3>Yêu cầu đang chờ</h3><p>${requests.length} yêu cầu</p></div></div><div class="table-wrap"><table class="data-table"><thead><tr><th scope="col">Họ và tên</th><th scope="col">Tên đăng nhập</th><th scope="col">Email</th><th scope="col">Điện thoại</th><th scope="col">Trạng thái</th><th scope="col">Thao tác</th></tr></thead><tbody>${rows || `<tr><td class="table-empty" colspan="6">Hiện chưa có yêu cầu đăng ký nào.</td></tr>`}</tbody></table></div></section>`;
  }

  const pageRenderers = {
    home: homePage,
    students: () => peoplePage('students', 'Danh sách học sinh'),
    teachers: () => peoplePage('teachers', 'Danh sách giáo viên'),
    requests: requestsPage,
    lessons: () => `${pageHeading('Giảng dạy', 'Lịch giảng dạy', 'Các buổi học trong thời khóa biểu mẫu của tuần này.')}${schedule()}`,
    timetable: () => `${pageHeading('Học tập', 'Thời khóa biểu', 'Theo dõi lịch học trong tuần của bạn.')}${schedule()}`
  };

  function render(page) {
    const safePage = pageRenderers[page] ? page : 'home';
    currentPage = safePage;
    $('menu').innerHTML = menus[role].map(([key, label]) => `<li><a href="#${key}" data-page="${key}" class="${key === safePage ? 'is-active' : ''}" ${key === safePage ? 'aria-current="page"' : ''}>${label}</a></li>`).join('');
    $('view').innerHTML = pageRenderers[safePage]();
    $('view').focus({ preventScroll: true });
  }

  $('uname').textContent = user.name;
  $('urole').textContent = { admin: 'Quản trị viên', teacher: 'Giáo viên', student: 'Học sinh' }[role];
  $('logout').addEventListener('click', () => {
    sessionStorage.removeItem('ms_user');
    location.href = '../login-register/login.html';
  });
  $('menu').addEventListener('click', (event) => {
    const link = event.target.closest('[data-page]');
    if (!link) return;
    event.preventDefault();
    render(link.dataset.page);
  });
  $('view').addEventListener('click', (event) => {
    const button = event.target.closest('[data-act]');
    if (!button || !isAdmin) return;
    const data = db.get();
    const id = Number(button.dataset.id);
    if (button.dataset.act === 'delete') data[button.dataset.key] = data[button.dataset.key].filter((person) => person.id !== id);
    if (button.dataset.act === 'approve') {
      const request = data.requests.find((item) => item.id === id);
      if (request) data.students.push({ ...request, name: request.name || request.user });
    }
    if (button.dataset.act === 'approve' || button.dataset.act === 'deny') data.requests = data.requests.filter((item) => item.id !== id);
    db.save(data);
    render(currentPage);
  });
  $('view').addEventListener('submit', (event) => {
    const form = event.target.closest('.inline-form');
    if (!form || !isAdmin) return;
    event.preventDefault();
    if (!form.reportValidity()) return;
    const fields = Object.fromEntries(new FormData(form));
    const data = db.get();
    const usernameExists = [data.admin, ...data.students, ...data.teachers, ...data.requests]
      .some((person) => person.user.toLowerCase() === fields.user.trim().toLowerCase());
    if (usernameExists) {
      window.alert('Tên đăng nhập đã được sử dụng.');
      return;
    }
    data[form.dataset.key].push({ id: Date.now(), ...fields, name: fields.name.trim(), user: fields.user.trim(), pass: '12345' });
    db.save(data);
    render(currentPage);
  });

  render('home');
}
