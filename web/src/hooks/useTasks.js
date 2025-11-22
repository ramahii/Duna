import { useState, useEffect } from 'react';
import client from '../api/client';

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.get('/tasks/');
      setTasks(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData) => {
    try {
      const response = await client.post('/tasks/', taskData);
      setTasks([response.data, ...tasks]);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create task');
      throw err;
    }
  };

  const updateTask = async (id, taskData) => {
    try {
      const response = await client.put(`/tasks/${id}/`, taskData);
      setTasks(tasks.map(t => (t.id === id ? response.data : t)));
      return response.data;
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update task');
      throw err;
    }
  };

  const deleteTask = async (id) => {
    try {
      await client.delete(`/tasks/${id}/`);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete task');
      throw err;
    }
  };

  const markComplete = async (id) => {
    try {
      const response = await client.post(`/tasks/${id}/mark_complete/`);
      setTasks(tasks.map(t => (t.id === id ? response.data : t)));
      return response.data;
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to mark complete');
      throw err;
    }
  };

  const markPending = async (id) => {
    try {
      const response = await client.post(`/tasks/${id}/mark_pending/`);
      setTasks(tasks.map(t => (t.id === id ? response.data : t)));
      return response.data;
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to mark pending');
      throw err;
    }
  };

  useEffect(() => {
    if (localStorage.getItem('access_token')) {
      fetchTasks();
    }
  }, []);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    markComplete,
    markPending,
  };
};