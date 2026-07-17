/**
 * Database Abstraction Layer (DAO) for the Annual Report Management System.
 * Sequentially structured to support CORS-free file:// execution.
 */

// Access default structures from the global window namespace
const getMockDepartments = () => window.defaultDepartmentsData;
const getMockUsers = () => window.defaultUsers;
const getMockCalendar = () => window.defaultCalendarEvents;
const getMockNotifs = () => window.defaultSystemNotifications;
const getMockLogs = () => window.defaultActivityLogs;
const getMockSettings = () => window.defaultSystemSettings;

const DEPS_KEY = "arm_portal_departments";
const USERS_KEY = "arm_portal_users";
const CALENDAR_KEY = "arm_portal_calendar";
const NOTIFS_KEY = "arm_portal_notifications";
const LOGS_KEY = "arm_portal_logs";
const SETTINGS_KEY = "arm_portal_settings";
const VERSIONS_KEY = "arm_portal_versions";

function initDb() {
  const currentSettings = localStorage.getItem(SETTINGS_KEY);
  const currentUsers = localStorage.getItem(USERS_KEY);
  const needsBala = currentUsers && !currentUsers.includes("emp/8788");
  const needsResetBrand = currentSettings && currentSettings.includes("Apex");
  
  if ((currentSettings && currentSettings.includes("V.S.B.")) || needsBala || needsResetBrand) {
    localStorage.removeItem(DEPS_KEY);
    localStorage.removeItem(USERS_KEY);
    localStorage.removeItem(CALENDAR_KEY);
    localStorage.removeItem(NOTIFS_KEY);
    localStorage.removeItem(LOGS_KEY);
    localStorage.removeItem(SETTINGS_KEY);
    localStorage.removeItem(VERSIONS_KEY);
    localStorage.removeItem("arm_dms_files_v3");
    localStorage.removeItem("arm_dms_recycle_bin");
  }

  if (!localStorage.getItem(DEPS_KEY)) localStorage.setItem(DEPS_KEY, JSON.stringify(getMockDepartments()));
  if (!localStorage.getItem(USERS_KEY)) localStorage.setItem(USERS_KEY, JSON.stringify(getMockUsers()));
  if (!localStorage.getItem(CALENDAR_KEY)) localStorage.setItem(CALENDAR_KEY, JSON.stringify(getMockCalendar()));
  if (!localStorage.getItem(NOTIFS_KEY)) localStorage.setItem(NOTIFS_KEY, JSON.stringify(getMockNotifs()));
  if (!localStorage.getItem(LOGS_KEY)) localStorage.setItem(LOGS_KEY, JSON.stringify(getMockLogs()));
  if (!localStorage.getItem(SETTINGS_KEY)) localStorage.setItem(SETTINGS_KEY, JSON.stringify(getMockSettings()));
  if (!localStorage.getItem(VERSIONS_KEY)) localStorage.setItem(VERSIONS_KEY, JSON.stringify({}));
}
initDb();

const delay = (ms = 50) => new Promise(resolve => setTimeout(resolve, ms));

async function getDepartments() {
  await delay();
  return JSON.parse(localStorage.getItem(DEPS_KEY));
}

async function getDepartment(id) {
  await delay();
  const deps = await getDepartments();
  return deps.find(d => d.id === id) || null;
}

async function saveDepartment(dep) {
  await delay();
  const deps = await getDepartments();
  const index = deps.findIndex(d => d.id === dep.id);
  if (index !== -1) {
    deps[index] = dep;
  } else {
    deps.push(dep);
  }
  localStorage.setItem(DEPS_KEY, JSON.stringify(deps));
  return dep;
}

async function resetDatabase() {
  await delay();
  localStorage.setItem(DEPS_KEY, JSON.stringify(getMockDepartments()));
  localStorage.setItem(CALENDAR_KEY, JSON.stringify(getMockCalendar()));
  localStorage.setItem(NOTIFS_KEY, JSON.stringify(getMockNotifs()));
  localStorage.setItem(LOGS_KEY, JSON.stringify(getMockLogs()));
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(getMockSettings()));
  localStorage.setItem(VERSIONS_KEY, JSON.stringify({}));
  return getMockDepartments();
}

async function getUsers() {
  await delay();
  return JSON.parse(localStorage.getItem(USERS_KEY));
}

async function getUser(username) {
  await delay();
  if (!username) return null;
  const users = await getUsers();
  const query = username.toLowerCase();
  return users.find(u => 
    u.username.toLowerCase() === query || 
    (u.email && u.email.toLowerCase() === query)
  ) || null;
}

async function saveUser(user) {
  await delay();
  const users = await getUsers();
  const index = users.findIndex(u => u.username === user.username);
  if (index !== -1) {
    users[index] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return user;
}

async function getCalendarEvents() {
  await delay();
  return JSON.parse(localStorage.getItem(CALENDAR_KEY));
}

async function saveCalendarEvent(event) {
  await delay();
  const events = await getCalendarEvents();
  const index = events.findIndex(e => e.id === event.id);
  if (index !== -1) {
    events[index] = event;
  } else {
    events.push(event);
  }
  localStorage.setItem(CALENDAR_KEY, JSON.stringify(events));
  return event;
}

async function deleteCalendarEvent(id) {
  await delay();
  const events = await getCalendarEvents();
  const filtered = events.filter(e => e.id !== id);
  localStorage.setItem(CALENDAR_KEY, JSON.stringify(filtered));
  return true;
}

async function getNotifications() {
  await delay();
  return JSON.parse(localStorage.getItem(NOTIFS_KEY));
}

async function addNotification(message, type = "info") {
  await delay();
  const notifs = await getNotifications();
  const newNotif = {
    id: "not_" + Date.now(),
    message,
    type,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    read: false
  };
  notifs.unshift(newNotif);
  localStorage.setItem(NOTIFS_KEY, JSON.stringify(notifs));
  return newNotif;
}

async function markNotificationRead(id) {
  await delay();
  const notifs = await getNotifications();
  const index = notifs.findIndex(n => n.id === id);
  if (index !== -1) {
    notifs[index].read = true;
    localStorage.setItem(NOTIFS_KEY, JSON.stringify(notifs));
  }
  return notifs;
}

async function markAllNotificationsRead() {
  await delay();
  const notifs = await getNotifications();
  notifs.forEach(n => n.read = true);
  localStorage.setItem(NOTIFS_KEY, JSON.stringify(notifs));
  return notifs;
}

async function getActivityLogs() {
  await delay();
  return JSON.parse(localStorage.getItem(LOGS_KEY));
}

async function logActivity(username, action) {
  await delay();
  const logs = await getActivityLogs();
  const newLog = {
    id: "log_" + Date.now(),
    username,
    action,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };
  logs.unshift(newLog);
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  return newLog;
}

async function getSettings() {
  await delay();
  return JSON.parse(localStorage.getItem(SETTINGS_KEY));
}

async function saveSettings(settings) {
  await delay();
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  return settings;
}

async function getVersions(depId) {
  await delay();
  const allVersions = JSON.parse(localStorage.getItem(VERSIONS_KEY)) || {};
  return allVersions[depId] || [];
}

async function saveVersion(depId, data, username) {
  await delay();
  const allVersions = JSON.parse(localStorage.getItem(VERSIONS_KEY)) || {};
  if (!allVersions[depId]) allVersions[depId] = [];
  
  const newVersion = {
    versionId: "ver_" + Date.now(),
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    username,
    data: JSON.parse(JSON.stringify(data))
  };
  
  allVersions[depId].push(newVersion);
  localStorage.setItem(VERSIONS_KEY, JSON.stringify(allVersions));
  return newVersion;
}

// Bind to window to share globally
window.getDepartments = getDepartments;
window.getDepartment = getDepartment;
window.saveDepartment = saveDepartment;
window.resetDatabase = resetDatabase;
window.getUsers = getUsers;
window.getUser = getUser;
window.saveUser = saveUser;
window.getCalendarEvents = getCalendarEvents;
window.saveCalendarEvent = saveCalendarEvent;
window.deleteCalendarEvent = deleteCalendarEvent;
window.getNotifications = getNotifications;
window.addNotification = addNotification;
window.markNotificationRead = markNotificationRead;
window.markAllNotificationsRead = markAllNotificationsRead;
window.getActivityLogs = getActivityLogs;
window.logActivity = logActivity;
window.getSettings = getSettings;
window.saveSettings = saveSettings;
window.getVersions = getVersions;
window.saveVersion = saveVersion;
