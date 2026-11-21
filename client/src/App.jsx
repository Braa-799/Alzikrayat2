import { useEffect, useState } from "react";
import { Routes, Route, Link, Navigate, useNavigate, useParams } from "react-router-dom";
import "./App.css";

const API = "http://localhost:5000/api";
const IMAGE_URL = "http://localhost:5000/uploads/";

function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("alzikrayatUser")) || null;
    } catch {
      return null;
    }
  });

  const logout = () => {
    localStorage.removeItem("alzikrayatUser");
    localStorage.removeItem("alzikrayatToken");
    setUser(null);
  };

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="brand">Alzikrayat</Link>
        <div className="nav-links">
          {user ? (
            <>
              <span>Hi, {user.firstName}</span>
              <Link to="/">Gallery</Link>
              <Link to="/upload">Upload</Link>
              <button className="logout-btn" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Please Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </nav>

      <main className="container">
        <Routes>
          <Route path="/login" element={<AuthPage mode="login" setUser={setUser} />} />
          <Route path="/register" element={<AuthPage mode="register" setUser={setUser} />} />
          <Route path="/" element={user ? <Gallery /> : <Navigate to="/login" />} />
          <Route path="/upload" element={user ? <UploadPage user={user} /> : <Navigate to="/login" />} />
          <Route path="/photos/:id" element={user ? <PhotoDetails user={user} /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </>
  );
}

function AuthPage({ mode, setUser }) {
  const navigate = useNavigate();
  const register = mode === "register";
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API}/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Request failed");

      const account = data.user || data;
      const loggedUser = {
        ...account,
        id: account.id || account._id
      };

      if (!loggedUser.id) throw new Error("User ID was not returned");
      if (!data.token) throw new Error("Authentication token was not returned");

      localStorage.setItem("alzikrayatToken", data.token);
      localStorage.setItem("alzikrayatUser", JSON.stringify(loggedUser));
      setUser(loggedUser);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-card">
      <h1>{register ? "Create Account" : "Welcome Back"}</h1>
      <p className="muted">{register ? "Join us and share your memories." : "Login to see your memories."}</p>
      <form onSubmit={submit}>
        {register && <>
          <label>First Name</label>
          <input name="firstName" value={form.firstName} onChange={update} required />
          <label>Last Name</label>
          <input name="lastName" value={form.lastName} onChange={update} required />
        </>}
        <label>Email</label>
        <input type="email" name="email" value={form.email} onChange={update} required />
        <label>Password</label>
        <input type="password" name="password" value={form.password} onChange={update} required minLength="6" />
        {error && <p className="error">{error}</p>}
        <button className="primary-btn" disabled={loading}>
          {loading ? "Please wait..." : register ? "Create Account" : "Login"}
        </button>
      </form>
      <p className="switch-auth">
        {register ? "Already have an account?" : "Don't have an account?"}
        {" "}
        <Link to={register ? "/login" : "/register"}>{register ? "Login" : "Register"}</Link>
      </p>
    </section>
  );
}

function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    fetch(`${API}/photos`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Could not load photos");
        return res.json();
      })
      .then(setPhotos)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section>
      <div className="section-heading">
        <div>
          <h1>Our Memories</h1>
          <p className="muted">Every picture tells a story.</p>
        </div>
        <div className="gallery-actions">
          <div className="view-toggle">
            <button className={viewMode === "grid" ? "view-btn active" : "view-btn"} onClick={() => setViewMode("grid")}>Grid</button>
            <button className={viewMode === "list" ? "view-btn active" : "view-btn"} onClick={() => setViewMode("list")}>List</button>
          </div>
          <Link to="/upload" className="primary-link">+ Upload Photo</Link>
        </div>
      </div>

      {loading && <p>Loading photos...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && photos.length === 0 && (
        <div className="empty-state">
          <h2>No memories yet</h2>
          <p>Be the first to share a photo.</p>
          <Link to="/upload" className="primary-link">Upload your first photo</Link>
        </div>
      )}

      <div className={viewMode === "grid" ? "photo-grid" : "photo-grid photo-list"}>
        {photos.map((photo) => (
          <Link to={`/photos/${photo._id}`} className="photo-card" key={photo._id}>
            <img src={`${IMAGE_URL}${photo.fileName}`} alt={photo.title} />
            <div className="photo-info">
              <h3>{photo.title}</h3>
              <p>{photo.userId?.firstName} {photo.userId?.lastName}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function UploadPage({ user }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!photo) {
      setError("Please choose an image.");
      return;
    }

    const formData = new FormData();
    formData.append("photo", photo);
    formData.append("title", title);
    formData.append("description", description);

    setLoading(true);
    try {
      const response = await fetch(`${API}/photos/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("alzikrayatToken")}` },
        body: formData
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Upload failed");
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="form-card">
      <h1>Share a Memory</h1>
      <form onSubmit={submit}>
        <label>Photo Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        <label>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="4" />
        <label>Choose Photo</label>
        <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files[0])} required />
        {error && <p className="error">{error}</p>}
        <button className="primary-btn" disabled={loading}>
          {loading ? "Uploading..." : "Upload Photo"}
        </button>
      </form>
    </section>
  );
}

function PhotoDetails({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [photo, setPhoto] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`${API}/photos`)
      .then((res) => res.json())
      .then((photos) => setPhoto(photos.find((item) => item._id === id) || null))
      .catch(() => setError("Could not load photo"));

    loadComments();
  }, [id]);

  const loadComments = async () => {
    try {
      const response = await fetch(`${API}/photos/${id}/comments`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not load comments");
      setComments(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!comment.trim() || !user) return;

    try {
      const response = await fetch(`${API}/photos/${id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("alzikrayatToken")}`
        },
        body: JSON.stringify({ comment })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not add comment");

      setComments((current) => [...current, data.comment]);
      setComment("");
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const deletePhoto = async () => {
    if (!window.confirm("Are you sure you want to delete this photo?")) return;

    setDeleting(true);
    try {
      const response = await fetch(`${API}/photos/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("alzikrayatToken")}`
        }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not delete photo");

      navigate("/");
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  };

  if (!photo) return <p>{error || "Loading photo..."}</p>;

  const isOwner = user && String(photo.userId?._id) === String(user.id);

  return (
    <section className="details-layout">
      <div>
        <img className="detail-image" src={`${IMAGE_URL}${photo.fileName}`} alt={photo.title} />
        <h1>{photo.title}</h1>
        <p>{photo.description}</p>
        <p className="muted">Shared by {photo.userId?.firstName} {photo.userId?.lastName}</p>
        {isOwner && (
          <button className="primary-btn" onClick={deletePhoto} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete Photo"}
          </button>
        )}
      </div>

      <aside className="comments-panel">
        <h2>Comments ({comments.length})</h2>
        {user && (
          <form onSubmit={submitComment}>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Write a comment..." rows="3" required />
            <button className="primary-btn">Add Comment</button>
          </form>
        )}
        {!user && <p className="muted">Please login to add a comment.</p>}
        {error && <p className="error">{error}</p>}
        <div className="comments-list">
          {comments.map((item) => (
            <div className="comment" key={item._id}>
              <strong>{item.userId?.firstName} {item.userId?.lastName}</strong>
              <p>{item.comment}</p>
              <small>{new Date(item.dateTime).toLocaleString()}</small>
            </div>
          ))}
          {comments.length === 0 && <p className="muted">No comments yet.</p>}
        </div>
      </aside>
    </section>
  );
}

export default App;



