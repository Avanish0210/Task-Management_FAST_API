import { useCallback, useEffect, useMemo, useState } from "react";

const API_URL = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

const iconPaths = {
  grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></>,
  list: <><path d="M9 6h11M9 12h11M9 18h11" /><path d="M4 6h.01M4 12h.01M4 18h.01" /></>,
  today: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18" /><path d="m9 16 2 2 4-4" /></>,
  check: <><path d="m5 12 4 4L19 6" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
  chevron: <><path d="m9 18 6-6-6-6" /></>,
  more: <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>,
  close: <><path d="m18 6-12 12M6 6l12 12" /></>,
  trash: <><path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6" /></>,
  edit: <><path d="m15 5 4 4M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16l-1 4Z" /></>,
  logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7" /></>,
  spark: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z" /><path d="m19 14 1.1 2.9L23 18l-2.9 1.1L19 22l-1.1-2.9L15 18l2.9-1.1L19 14Z" /></>,
  arrow: <><path d="M7 17 17 7M7 7h10v10" /></>,
};

function Icon({ name, size = 20, ...props }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {iconPaths[name]}
    </svg>
  );
}

async function request(path, { token, ...options } = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      if (typeof body.detail === "string") message = body.detail;
      else if (Array.isArray(body.detail)) message = body.detail.map((item) => item.msg).join(", ");
    } catch {
      // Keep the HTTP status message when the server does not return JSON.
    }
    throw new Error(message);
  }

  return response.status === 204 ? null : response.json();
}

function initials(name = "") {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "T";
}

function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function update(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (mode === "register") {
        await request("/user/register", {
          method: "POST",
          body: JSON.stringify({ name: form.name, username: form.username, email: form.email, password: form.password }),
        });
      }
      const result = await request("/user/login", {
        method: "POST",
        body: JSON.stringify({ username: form.username, password: form.password }),
      });
      onLogin(result.token, form.name || form.username);
    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-aside">
        <a className="brand brand-light" href="#" aria-label="Taskflow home"><span className="brand-mark"><Icon name="check" size={19} /></span><span>taskflow</span></a>
        <div className="auth-promo">
          <div className="promo-orbit orbit-one" /><div className="promo-orbit orbit-two" />
          <div className="promo-card">
            <div className="promo-card-top"><span className="mini-dot" /> YOUR WEEK, IN FLOW <Icon name="more" size={17} /></div>
            <div className="promo-progress"><span /></div>
            <div className="promo-task"><span className="promo-check"><Icon name="check" size={13} /></span><span>Plan the week ahead</span><b>Done</b></div>
            <div className="promo-task"><span className="promo-check"><Icon name="check" size={13} /></span><span>Build something great</span><b className="in-progress">In progress</b></div>
            <div className="promo-task muted-task"><span className="promo-empty" /><span>Take a well-earned break</span><b>Later</b></div>
          </div>
          <div className="promo-note"><span className="note-avatar">A</span><span><strong>Small steps add up.</strong><br />Keep your momentum going.</span><Icon name="spark" size={18} /></div>
        </div>
        <div className="auth-aside-footer"><span>MAKE SPACE FOR WHAT MATTERS</span><span>01 — 03</span></div>
      </section>
      <section className="auth-main">
        <div className="auth-main-brand"><a className="brand" href="#" aria-label="Taskflow home"><span className="brand-mark"><Icon name="check" size={19} /></span><span>taskflow</span></a></div>
        <div className="auth-content">
          <div className="eyebrow"><span /> YOUR PERSONAL WORKSPACE</div>
          <h1>{mode === "login" ? <>Good to<br />have you back.</> : <>Make room for<br />great things.</>}</h1>
          <p className="auth-subtitle">{mode === "login" ? "Sign in and pick up right where you left off." : "Create your account and bring a little more focus to every day."}</p>
          <form className="auth-form" onSubmit={submit}>
            {mode === "register" && <label>Your name<input name="name" autoComplete="name" placeholder="e.g. Alex Morgan" value={form.name} onChange={update} required /></label>}
            <label>Username<input name="username" autoComplete="username" placeholder="Your username" value={form.username} onChange={update} required /></label>
            {mode === "register" && <label>Email address<input name="email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={update} required /></label>}
            <label>Password<input name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder="Enter your password" value={form.password} onChange={update} required /></label>
            {error && <div className="form-error" role="alert">{error}</div>}
            <button className="button button-primary auth-submit" disabled={busy}>{busy ? "One moment..." : mode === "login" ? "Sign in to your workspace" : "Create your account"}{!busy && <Icon name="arrow" size={18} />}</button>
          </form>
          <p className="auth-switch">{mode === "login" ? "New to Taskflow?" : "Already have an account?"}{" "}<button type="button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>{mode === "login" ? "Create an account" : "Sign in"}</button></p>
        </div>
        <p className="auth-legal">A quieter way to get things done.</p>
      </section>
    </main>
  );
}

function TaskModal({ task, onClose, onSave, busy }) {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");

  function submit(event) {
    event.preventDefault();
    onSave({ title: title.trim(), description: description.trim(), is_completed: task?.is_completed || false });
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="task-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-heading"><div><span className="modal-kicker">{task ? "MAKE AN UPDATE" : "A FRESH START"}</span><h2 id="modal-title">{task ? "Edit task" : "Create a task"}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close dialog"><Icon name="close" /></button></div>
        <form onSubmit={submit}>
          <label>Task name<input autoFocus maxLength="200" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="What needs to get done?" required /></label>
          <label>A few details <span className="optional">(optional)</span><textarea rows="4" maxLength="2000" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Add a little context..." /></label>
          <div className="modal-actions"><button type="button" className="button button-quiet" onClick={onClose}>Cancel</button><button className="button button-primary" disabled={busy}>{busy ? "Saving..." : task ? "Save changes" : "Add task"}<Icon name="arrow" size={17} /></button></div>
        </form>
      </section>
    </div>
  );
}

function TaskCard({ task, onToggle, onEdit, onDelete }) {
  return (
    <article className={`task-card ${task.is_completed ? "task-completed" : ""}`}>
      <button className={`task-check ${task.is_completed ? "checked" : ""}`} onClick={() => onToggle(task)} aria-label={task.is_completed ? `Mark ${task.title} as not done` : `Mark ${task.title} as done`}>{task.is_completed && <Icon name="check" size={15} />}</button>
      <div className="task-copy"><h3>{task.title}</h3>{task.description && <p>{task.description}</p>}</div>
      <span className={`task-status ${task.is_completed ? "status-done" : "status-active"}`}><i />{task.is_completed ? "Completed" : "In progress"}</span>
      <div className="task-actions"><button className="icon-button" onClick={() => onEdit(task)} aria-label={`Edit ${task.title}`}><Icon name="edit" size={17} /></button><button className="icon-button delete-action" onClick={() => onDelete(task)} aria-label={`Delete ${task.title}`}><Icon name="trash" size={17} /></button></div>
    </article>
  );
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("taskflow_token"));
  const [username, setUsername] = useState(() => localStorage.getItem("taskflow_username") || "there");
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [modalTask, setModalTask] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const signOut = useCallback(() => {
    localStorage.removeItem("taskflow_token");
    localStorage.removeItem("taskflow_username");
    setToken(null);
    setTasks([]);
  }, []);

  const loadTasks = useCallback(async (currentToken) => {
    setLoading(true);
    setError("");
    try {
      const data = await request("/tasks/all_tasks", { token: currentToken });
      setTasks(data);
    } catch (err) {
      if (err.message.includes("(401)")) signOut();
      else setError(`${err.message}. Check that your backend is running at ${API_URL}.`);
    } finally {
      setLoading(false);
    }
  }, [signOut]);

  useEffect(() => {
    if (token) loadTasks(token);
  }, [token, loadTasks]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(""), 3000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  function signIn(nextToken, nextUsername) {
    localStorage.setItem("taskflow_token", nextToken);
    localStorage.setItem("taskflow_username", nextUsername);
    setUsername(nextUsername);
    setToken(nextToken);
  }

  async function saveTask(values) {
    setSaving(true);
    setError("");
    try {
      if (modalTask) {
        const updated = await request(`/tasks/update_tasks/${modalTask.id}`, { method: "PUT", token, body: JSON.stringify(values) });
        setTasks((current) => current.map((task) => task.id === updated.id ? updated : task));
        setNotice("Your task has been updated.");
      } else {
        const created = await request("/tasks/create", { method: "POST", token, body: JSON.stringify(values) });
        setTasks((current) => [created, ...current]);
        setNotice("A new task, ready when you are.");
      }
      setModalOpen(false);
      setModalTask(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleTask(task) {
    try {
      const updated = await request(`/tasks/update_tasks/${task.id}`, {
        method: "PUT",
        token,
        body: JSON.stringify({ title: task.title, description: task.description, is_completed: !task.is_completed }),
      });
      setTasks((current) => current.map((item) => item.id === updated.id ? updated : item));
      setNotice(updated.is_completed ? "Task completed. Nicely done!" : "Task moved back to your list.");
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteTask(task) {
    if (!window.confirm(`Delete "${task.title}"? This can't be undone.`)) return;
    try {
      await request(`/tasks/delete_tasks/${task.id}`, { method: "DELETE", token });
      setTasks((current) => current.filter((item) => item.id !== task.id));
      setNotice("Task deleted.");
    } catch (err) {
      setError(err.message);
    }
  }

  const visibleTasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tasks.filter((task) => {
      const matchesFilter = filter === "all" || (filter === "active" ? !task.is_completed : task.is_completed);
      const matchesSearch = !query || `${task.title} ${task.description}`.toLowerCase().includes(query);
      return matchesFilter && matchesSearch;
    });
  }, [tasks, filter, search]);

  const activeCount = tasks.filter((task) => !task.is_completed).length;
  const completedCount = tasks.length - activeCount;
  const completion = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;
  const greetingName = username.split(/[.\s_-]/)[0] || username;

  if (!token) return <AuthScreen onLogin={signIn} />;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand sidebar-brand" href="#" aria-label="Taskflow"><span className="brand-mark"><Icon name="check" size={19} /></span><span>taskflow</span></a>
        <div className="workspace-label">WORKSPACE</div>
        <button className="workspace-picker"><span className="workspace-icon">P</span><span><strong>Personal space</strong><small>Free plan</small></span><Icon name="chevron" size={16} /></button>
        <div className="side-section-label">MENU</div>
        <nav className="side-nav" aria-label="Task views">
          <button className={filter === "all" ? "nav-item selected" : "nav-item"} onClick={() => setFilter("all")}><Icon name="grid" /><span>All tasks</span><span className="nav-count">{tasks.length}</span></button>
          <button className={filter === "active" ? "nav-item selected" : "nav-item"} onClick={() => setFilter("active")}><Icon name="list" /><span>In progress</span><span className="nav-count">{activeCount}</span></button>
          <button className={filter === "completed" ? "nav-item selected" : "nav-item"} onClick={() => setFilter("completed")}><Icon name="today" /><span>Completed</span><span className="nav-count">{completedCount}</span></button>
        </nav>
        <div className="sidebar-bottom">
          <div className="focus-card"><span className="focus-icon"><Icon name="spark" size={18} /></span><strong>Make it a good day.</strong><p>A little progress is still progress.</p><div className="focus-meter"><span style={{ width: `${completion}%` }} /></div><small>{completion}% of your tasks complete</small></div>
          <div className="profile-button"><span className="profile-avatar">{initials(username)}</span><span className="profile-copy"><strong>{username}</strong><small>Personal account</small></span><button className="logout-button" onClick={signOut} aria-label="Sign out"><Icon name="logout" size={17} /></button></div>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><Icon name="chevron" size={14} /><strong>My tasks</strong></div>
          <div className="topbar-actions"><label className="search-box"><Icon name="search" size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tasks..." aria-label="Search tasks" /><kbd>⌘ K</kbd></label><span className="topbar-divider" /><button className="icon-button notification-button" aria-label="Notifications"><Icon name="bell" size={19} /><i /></button><span className="top-avatar">{initials(username)}</span></div>
        </header>

        <div className="dashboard-content">
          <section className="welcome-row">
            <div><div className="date-label"><span className="date-dot" /> YOUR SPACE, YOUR PACE</div><h1>Good morning, {greetingName} <span className="wave">✳</span></h1><p>One thing at a time. You've got this.</p></div>
            <button className="button button-primary create-button" onClick={() => { setModalTask(null); setModalOpen(true); }}><Icon name="plus" size={19} /> New task</button>
          </section>

          <section className="overview-grid" aria-label="Task overview">
            <article className="overview-card overview-total"><div className="overview-top"><span>ALL TASKS</span><span className="overview-icon icon-lilac"><Icon name="grid" size={17} /></span></div><strong>{tasks.length.toString().padStart(2, "0")}</strong><p>Things on your plate</p><div className="overview-bottom"><span className="overview-bullet" />Keep the momentum</div></article>
            <article className="overview-card"><div className="overview-top"><span>IN PROGRESS</span><span className="overview-icon icon-peach"><Icon name="list" size={17} /></span></div><strong>{activeCount.toString().padStart(2, "0")}</strong><p>Ready for your focus</p><div className="overview-bottom"><span className="overview-bullet bullet-peach" />One step at a time</div></article>
            <article className="overview-card"><div className="overview-top"><span>COMPLETED</span><span className="overview-icon icon-green"><Icon name="check" size={18} /></span></div><strong>{completedCount.toString().padStart(2, "0")}</strong><p>Look at you go</p><div className="overview-bottom"><span className="overview-bullet bullet-green" />{completion}% of your task list</div></article>
            <article className="quote-card"><span className="quote-mark">“</span><p>Progress is a series of small wins.</p><span className="quote-caption">A GENTLE REMINDER</span><span className="quote-spark"><Icon name="spark" size={22} /></span></article>
          </section>

          <section className="tasks-section">
            <div className="tasks-heading"><div><div className="section-eyebrow">YOUR DAY, AT A GLANCE</div><h2>{filter === "all" ? "Your tasks" : filter === "active" ? "In progress" : "Completed"} <span className="task-total">{visibleTasks.length}</span></h2></div><div className="filter-tabs" role="tablist" aria-label="Filter tasks"><button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>All</button><button className={filter === "active" ? "active" : ""} onClick={() => setFilter("active")}>Active</button><button className={filter === "completed" ? "active" : ""} onClick={() => setFilter("completed")}>Done</button></div></div>
            {error && <div className="inline-error" role="alert"><span>{error}</span><button onClick={() => setError("")} aria-label="Dismiss error"><Icon name="close" size={17} /></button></div>}
            <div className="task-list">
              {loading ? <div className="empty-state"><span className="loader" /><h3>Getting things ready</h3><p>Bringing your tasks into focus...</p></div>
                : visibleTasks.length ? visibleTasks.map((task) => <TaskCard key={task.id} task={task} onToggle={toggleTask} onEdit={(item) => { setModalTask(item); setModalOpen(true); }} onDelete={deleteTask} />)
                  : <div className="empty-state"><span className="empty-icon"><Icon name={search ? "search" : "spark"} size={22} /></span><h3>{search ? "Nothing matches that search" : filter === "completed" ? "No finished tasks just yet" : "A little breathing room"}</h3><p>{search ? "Try another keyword or clear your search." : filter === "completed" ? "Your completed tasks will find a home here." : "No tasks on your list. Enjoy the calm, or add your next one."}</p>{!search && filter !== "completed" && <button className="button button-soft" onClick={() => { setModalTask(null); setModalOpen(true); }}><Icon name="plus" size={17} /> Add your first task</button>}</div>}
            </div>
            <footer className="list-footer"><span>Made for focus, built for you.</span><span><span className="footer-status" /> All changes saved</span></footer>
          </section>
        </div>
      </main>

      {modalOpen && <TaskModal task={modalTask} onClose={() => { setModalOpen(false); setModalTask(null); }} onSave={saveTask} busy={saving} />}
      {notice && <div className="toast" role="status"><span className="toast-check"><Icon name="check" size={15} /></span>{notice}</div>}
    </div>
  );
}

export default App;
