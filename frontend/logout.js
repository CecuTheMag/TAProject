// Force logout to refresh user data
localStorage.removeItem('token');
localStorage.removeItem('user');
window.location.reload();