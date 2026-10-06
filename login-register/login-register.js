const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const recoveryForm = document.getElementById('recoveryForm');
const selectedRole = document.querySelector('.roles');
const roleInputs = document.querySelectorAll('input[name="role"]');

function setMessage(element, message, success = false) {
  if (!element) return;
  element.textContent = message;
  element.hidden = !message;
  element.classList.toggle('form-message--success', success);
}

function formValues(form) {
  return Object.fromEntries(new FormData(form));
}

roleInputs.forEach((input) => input.addEventListener('change', () => {
  if (input.checked && selectedRole) selectedRole.dataset.selectedRole = input.value;
}));

if (loginForm) {
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!loginForm.reportValidity()) return;
    const values = formValues(loginForm);
    const data = db.get();
    const accounts = {
      admin: [data.admin],
      student: data.students,
      teacher: data.teachers
    }[values.role] || [];
    const account = accounts.find((item) => item.user === values.username && item.pass === values.password);

    if (!account) {
      const pending = data.requests.some((item) => item.user === values.username);
      setMessage(document.getElementById('login-message'), pending
        ? 'Tài khoản đang chờ quản trị viên duyệt.'
        : 'Tên đăng nhập, mật khẩu hoặc vai trò chưa chính xác.');
      return;
    }

    sessionStorage.setItem('ms_user', JSON.stringify({ role: values.role, name: account.name }));
    location.href = `../${values.role}/${values.role}.html`;
  });
}

if (registerForm) {
  registerForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!registerForm.reportValidity()) return;
    const values = formValues(registerForm);
    const data = db.get();
    const accounts = [data.admin, ...data.students, ...data.teachers, ...data.requests];
    if (accounts.some((account) => account.user.toLowerCase() === values.username.trim().toLowerCase())) {
      setMessage(document.getElementById('register-message'), 'Tên đăng nhập đã được sử dụng.');
      return;
    }
    data.requests.push({
      id: Date.now(),
      name: values.name.trim(),
      user: values.username.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      pass: values.password
    });
    db.save(data);
    sessionStorage.setItem('ms_notice', 'Yêu cầu đăng ký đã được gửi. Vui lòng chờ quản trị viên duyệt tài khoản.');
    location.href = 'login.html';
  });
}

const recoveryPanel = document.getElementById('recovery');
document.getElementById('show-recovery')?.addEventListener('click', (event) => {
  event.preventDefault();
  recoveryPanel.hidden = false;
  document.getElementById('recovery-username').focus();
});
document.getElementById('hide-recovery')?.addEventListener('click', () => {
  recoveryPanel.hidden = true;
  document.getElementById('show-recovery').focus();
});

if (recoveryForm) {
  recoveryForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!recoveryForm.reportValidity()) return;
    const values = formValues(recoveryForm);
    const data = db.get();
    const accounts = [data.admin, ...data.students, ...data.teachers];
    const account = accounts.find((item) => item.user.toLowerCase() === values.username.trim().toLowerCase()
      && item.email.toLowerCase() === values.email.trim().toLowerCase());
    const message = document.getElementById('recovery-message');

    if (!account) {
      setMessage(message, 'Không tìm thấy tài khoản khớp với tên đăng nhập và email này.');
      return;
    }
    account.pass = values.newPassword;
    db.save(data);
    recoveryForm.reset();
    setMessage(message, 'Mật khẩu đã được cập nhật. Bạn có thể đăng nhập bằng mật khẩu mới.', true);
  });
}

const notice = sessionStorage.getItem('ms_notice');
if (notice && loginForm) {
  setMessage(document.getElementById('login-message'), notice, true);
  sessionStorage.removeItem('ms_notice');
}
