import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, Check, Clock, AlertCircle } from 'lucide-react';

export default function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [notificationPermission, setNotificationPermission] = useState('default');

  useEffect(() => {
    loadTodos();
    checkNotificationPermission();
    const interval = setInterval(checkReminders, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkNotificationPermission = async () => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  const loadTodos = async () => {
    try {
      const result = await window.storage.get('todos');
      if (result) {
        setTodos(JSON.parse(result.value));
      }
    } catch (error) {
      console.log('Aucune tâche enregistrée');
    }
  };

  const saveTodos = async (updatedTodos) => {
    try {
      await window.storage.set('todos', JSON.stringify(updatedTodos));
    } catch (error) {
      console.error('Erreur de sauvegarde:', error);
    }
  };

  const addTodo = () => {
    if (!newTodo.trim()) return;

    let reminderDate = null;
    if (newDate && newTime) {
      reminderDate = new Date(`${newDate}T${newTime}`).toISOString();
    }

    const todo = {
      id: Date.now(),
      text: newTodo,
      completed: false,
      reminderDate,
      notified: false,
      createdAt: new Date().toISOString()
    };

    const updatedTodos = [...todos, todo];
    setTodos(updatedTodos);
    saveTodos(updatedTodos);
    
    setNewTodo('');
    setNewDate('');
    setNewTime('');
  };

  const toggleTodo = (id) => {
    const updatedTodos = todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    setTodos(updatedTodos);
    saveTodos(updatedTodos);
  };

  const deleteTodo = (id) => {
    const updatedTodos = todos.filter(todo => todo.id !== id);
    setTodos(updatedTodos);
    saveTodos(updatedTodos);
  };

  const checkReminders = () => {
    const now = new Date();
    const updatedTodos = [...todos];
    let hasChanges = false;

    updatedTodos.forEach(todo => {
      if (todo.reminderDate && !todo.notified && !todo.completed) {
        const reminderTime = new Date(todo.reminderDate);
        if (now >= reminderTime) {
          sendNotification(todo);
          todo.notified = true;
          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
      setTodos(updatedTodos);
      saveTodos(updatedTodos);
    }
  };

  const sendNotification = (todo) => {
    if (notificationPermission === 'granted') {
      new Notification('Rappel de tâche', {
        body: todo.text,
        icon: '🔔',
        tag: `todo-${todo.id}`
      });
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return null;
    const date = new Date(isoString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isPastDue = (reminderDate) => {
    if (!reminderDate) return false;
    return new Date(reminderDate) < new Date();
  };

  const pendingTodos = todos.filter(t => !t.completed);
  const completedTodos = todos.filter(t => t.completed);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <Bell className="text-indigo-600" />
              Mes Tâches
            </h1>
            {notificationPermission !== 'granted' && (
              <button
                onClick={requestNotificationPermission}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition text-sm"
              >
                <Bell size={16} />
                Activer les notifications
              </button>
            )}
          </div>

          {notificationPermission === 'denied' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 flex items-start gap-2">
              <AlertCircle className="text-yellow-600 mt-1 flex-shrink-0" size={20} />
              <p className="text-sm text-yellow-800">
                Les notifications sont bloquées. Activez-les dans les paramètres de votre navigateur pour recevoir des rappels.
              </p>
            </div>
          )}

          <div className="space-y-3">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTodo()}
              placeholder="Nouvelle tâche..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            
            <div className="flex gap-3">
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              onClick={addTodo}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2 font-medium"
            >
              <Plus size={20} />
              Ajouter la tâche
            </button>
          </div>
        </div>

        {pendingTodos.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">À faire ({pendingTodos.length})</h2>
            <div className="space-y-3">
              {pendingTodos.map(todo => (
                <div
                  key={todo.id}
                  className={`p-4 rounded-lg border-2 transition ${
                    isPastDue(todo.reminderDate) && todo.reminderDate
                      ? 'bg-red-50 border-red-300'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleTodo(todo.id)}
                      className="mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 border-gray-400 hover:border-indigo-600 transition"
                    />
                    <div className="flex-1">
                      <p className="text-gray-800 font-medium">{todo.text}</p>
                      {todo.reminderDate && (
                        <div className={`flex items-center gap-1 mt-2 text-sm ${
                          isPastDue(todo.reminderDate) ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          <Clock size={14} />
                          <span>{formatDate(todo.reminderDate)}</span>
                          {todo.notified && <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded">Notifié</span>}
                          {isPastDue(todo.reminderDate) && !todo.notified && (
                            <span className="ml-2 text-xs bg-red-200 px-2 py-1 rounded">En retard</span>
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="text-red-500 hover:text-red-700 transition flex-shrink-0"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {completedTodos.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Terminées ({completedTodos.length})</h2>
            <div className="space-y-3">
              {completedTodos.map(todo => (
                <div
                  key={todo.id}
                  className="p-4 bg-green-50 rounded-lg border-2 border-green-200"
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleTodo(todo.id)}
                      className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white"
                    >
                      <Check size={16} />
                    </button>
                    <div className="flex-1">
                      <p className="text-gray-500 line-through">{todo.text}</p>
                      {todo.reminderDate && (
                        <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                          <Clock size={14} />
                          <span>{formatDate(todo.reminderDate)}</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="text-red-500 hover:text-red-700 transition flex-shrink-0"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {todos.length === 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <Bell size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">Aucune tâche pour le moment</p>
            <p className="text-gray-400 text-sm mt-2">Ajoutez votre première tâche ci-dessus</p>
          </div>
        )}
      </div>
    </div>
  );
}
