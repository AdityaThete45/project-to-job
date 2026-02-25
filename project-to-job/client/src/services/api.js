const API_URL = "http://localhost:5000/api";

// ===== REGISTER =====
export const registerUser = async (data) => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  return res.json();
};

// ===== LOGIN =====
export const loginUser = async (data) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  return res.json();
};

// ===== STUDENT PROJECTS =====
export const getMyProjects = async (token) => {
  const res = await fetch(`${API_URL}/projects/my-projects`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return res.json();
};

// ===== INTERVIEWS =====
export const getMyInterviews = async (token) => {
  const res = await fetch(`${API_URL}/interviews/my-requests`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return res.json();
};

// ===== CREATE PROJECT =====
export const createProject = async (token, data) => {
  const res = await fetch(`${API_URL}/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  return res.json();
};