import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Register from './pages/Register';
import Login from './pages/Login';
import Sidebar from './components/Sidebar'; // Assuming Sidebar is in components
import RightPanel from './components/RightPannel';
import ProfilePage from './pages/ProfilePage';
import NotificationPage from './pages/NotificationPage';

// Define routes
const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <div className='flex max-w-6xl mx-auto'>
        <Sidebar />
        <HomePage />
        <RightPanel />
      </div>
    ),
  },
  {
    path: '/register',
    element: <Register />

  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/notifications',
    element: (
      <div className='flex max-w-6xl mx-auto'>
        <Sidebar />
        <NotificationPage />
        <RightPanel />
      </div>
    )
  },
  {
    path: '/profile/:username',
    element: (
      <div className='flex max-w-6xl mx-auto'>
        <Sidebar />
        <ProfilePage />
        <RightPanel />
      </div>
    )
  },
]);

function App() {
  return (
    <RouterProvider router={router}></RouterProvider>
  );
}

export default App;
