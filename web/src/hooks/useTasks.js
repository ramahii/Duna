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

  const getNotes = async (taskId) => {
    try {
      const response = await client.get(`/tasks/${taskId}/notes/`);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch notes');
      throw err;
    }
  };

  const addNote = async (taskId, content) => {
    try {
      const response = await client.post(`/tasks/${taskId}/notes/`, { content });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add note');
      throw err;
    }
  };

  const deleteNote = async (taskId, noteId) => {
    try {
      await client.delete(`/tasks/${taskId}/notes/${noteId}/`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete note');
      throw err;
    }
  };

  const updateTaskOrder = async (orderArray) => {
    try {
      // Update local state immediately with new order
      const pendingTasks = tasks.filter(t => t.status === 'pending');
      const completedTasks = tasks.filter(t => t.status === 'completed');
      
      // Reorder tasks based on the orderArray
      const reorderedTasks = orderArray
        .map(id => pendingTasks.find(t => t.id === id))
        .filter(Boolean)
        .concat(completedTasks);
      
      setTasks(reorderedTasks);
      
      // Then save to backend
      await client.post('/tasks/update_order/', { order: orderArray });
      return true;
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update order');
      throw err;
    }
  };

  const createRecurringTask = async (taskId) => {
    try {
      const response = await client.post(`/tasks/${taskId}/create_recurring/`);
      setTasks([response.data, ...tasks]);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create recurring task');
      throw err;
    }
  };

  // New feature functions

  const addSubtask = async (taskId, title) => {
    try {
      const response = await client.post(`/tasks/${taskId}/subtasks/`, { title });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add subtask');
      throw err;
    }
  };

  const toggleSubtask = async (taskId, subtaskId, newStatus) => {
    try {
      const response = await client.put(`/tasks/${taskId}/subtasks/${subtaskId}/`, {
        status: newStatus === 'completed' ? 'pending' : 'completed',
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update subtask');
      throw err;
    }
  };

  const deleteSubtask = async (taskId, subtaskId) => {
    try {
      await client.delete(`/tasks/${taskId}/subtasks/${subtaskId}/`);
      return true;
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete subtask');
      throw err;
    }
  };

  const logTime = async (taskId, data) => {
    try {
      const response = await client.post(`/tasks/${taskId}/time-logs/`, data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to log time');
      throw err;
    }
  };

  const getTimeLogs = async (taskId) => {
    try {
      const response = await client.get(`/tasks/${taskId}/time-logs/`);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch time logs');
      throw err;
    }
  };

  const addComment = async (taskId, content) => {
    try {
      const response = await client.post(`/tasks/${taskId}/comments/`, { content });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add comment');
      throw err;
    }
  };

  const getComments = async (taskId) => {
    try {
      const response = await client.get(`/tasks/${taskId}/comments/`);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch comments');
      throw err;
    }
  };

  const deleteComment = async (taskId, commentId) => {
    try {
      await client.delete(`/tasks/${taskId}/comments/${commentId}/`);
      return true;
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete comment');
      throw err;
    }
  };

  const getProductivityStats = async () => {
    try {
      const response = await client.get('/productivity/me/');
      return response.data;
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch productivity stats');
      throw err;
    }
  };

  const getGoals = async () => {
    try {
      const response = await client.get('/goals/');
      return response.data;
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch goals');
      throw err;
    }
  };

  const createGoal = async (goalData) => {
    try {
      const response = await client.post('/goals/', goalData);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create goal');
      throw err;
    }
  };

  const getUserTheme = async () => {
    try {
      const response = await client.get('/theme/me/');
      return response.data;
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch theme');
      throw err;
    }
  };

  const updateUserTheme = async (themeData) => {
    try {
      const response = await client.put('/theme/me/', themeData);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update theme');
      throw err;
    }
  };

  const getFilterPresets = async () => {
    try {
      const response = await client.get('/filter-presets/');
      return response.data;
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch filter presets');
      throw err;
    }
  };

  const saveFilterPreset = async (presetData) => {
    try {
      const response = await client.post('/filter-presets/', presetData);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save filter preset');
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
    getNotes,
    addNote,
    deleteNote,
    updateTaskOrder,
    createRecurringTask,
    // New feature functions
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    logTime,
    getTimeLogs,
    addComment,
    getComments,
    deleteComment,
    getProductivityStats,
    getGoals,
    createGoal,
    getUserTheme,
    updateUserTheme,
    getFilterPresets,
    saveFilterPreset,
  };
};