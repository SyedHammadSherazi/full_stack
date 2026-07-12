# full_stack

# Real-Time Collaboration Platform

A full-stack real-time collaboration platform built with **Django**, **Django REST Framework**, **Django Channels**, **Redis**, and **Next.js**.

This project allows multiple users to communicate and collaborate inside workspaces using real-time technologies. It includes authentication, chat, presence tracking, notifications, workspace file sharing, and secure file access.

---

# Features

## Authentication

- JWT Authentication
- Login
- Protected Routes
- Logout
- Token-based API Authentication

---

## Workspace Management

- Create Workspaces
- Workspace Members
- User Roles
- Workspace-based Communication

---

## Real-Time Chat

- WebSocket Chat using Django Channels
- Send Messages Instantly
- Broadcast Messages to Connected Users
- Last 20 Messages History
- Sender Information
- Timestamp Support

---

## Shared Notes

- Workspace Notes
- Live Note Editing
- Real-Time Synchronization
- Auto Save
- Shared Collaboration

---

## Presence System

- Live Online Users
- Offline Detection
- Presence Updates
- Workspace User Status
- Real-Time User Tracking

---

## Notifications

- Real-Time Notifications
- Chat Notifications
- File Upload Notifications
- Notification Popup
- Notification History

---

## File Sharing

- Upload Files
- Download Files
- Real-Time File Messages
- Workspace File Storage
- Secure File Access

---

## Security

- JWT Authentication
- Protected APIs
- Protected WebSockets
- Workspace Membership Validation
- Secure File Download
- Only Workspace Members Can Access Files

---

# Technologies Used

## Backend

- Python
- Django
- Django REST Framework
- Django Channels
- Redis
- SQLite

---

## Frontend

- Next.js
- React
- JavaScript
- Fetch API
- WebSocket API

---

# Project Structure

```
Project
│
├── Backend
│   │
│   ├── Accounts
│   ├── Workspace
│   ├── Chat
│   ├── Notes
│   ├── Notifications
│   ├── Files
│   ├── Presence
│   └── Django Project
│
└── Frontend
    │
    ├── app
    ├── components
    ├── styles
    └── services
```

---

# WebSocket Architecture

The application uses Django Channels with Redis as the Channel Layer.

```
Client

↓

WebSocket Connection

↓

ASGI

↓

Django Channels

↓

Redis Channel Layer

↓

Connected Clients
```

Whenever a user sends a message or uploads a file, Django Channels broadcasts the event to every connected user in the same workspace.

---

# Chat Workflow

```
User

↓

Type Message

↓

WebSocket

↓

ChatConsumer

↓

Save Message

↓

Database

↓

Broadcast

↓

All Connected Users
```

---

# File Upload Workflow

```
User

↓

Upload File

↓

REST API

↓

WorkspaceFile Model

↓

Save File

↓

Create Chat Message

↓

Create Notification

↓

Broadcast File

↓

All Workspace Members
```

---

# Notification Workflow

```
Message Uploaded

↓

Notification Service

↓

Notification Database

↓

Notification WebSocket

↓

NotificationBell Component

↓

Popup Notification
```

---

# Presence Workflow

```
User Connects

↓

Presence Consumer

↓

Status Online

↓

Broadcast

↓

Workspace Members

↓

Online Indicator
```

When a user disconnects, the status automatically changes to Offline.

---

# Authentication Flow

```
Login

↓

JWT Token

↓

Local Storage

↓

Authorization Header

↓

Protected API

↓

Response
```

---

# File Access Security

Uploaded files are protected.

Only members of the workspace are allowed to download files.

The backend checks workspace membership before returning the file.

Non-members receive a **403 Forbidden** response.

---

# API Endpoints

## Authentication

```
POST /api/user/
POST /api/refresh/
```

---

## Workspace

```
GET /api/workspaces/
POST /api/workspaces/
```

---

## Chat

```
WS /ws/chat/<workspace_id>/
```

---

## Presence

```
WS /ws/workspace/<workspace_id>/
```

---

## Notifications

```
WS /ws/notifications/
```

---

## Files

```
GET  /files/workspace/<workspace_id>/upload-file/
POST /files/workspace/<workspace_id>/upload-file/
GET  /files/download/<file_id>/
```

---

# Environment Variables

Frontend

```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
NEXT_PUBLIC_WS_URL=ws://127.0.0.1:8000
```

Backend

```
SECRET_KEY=your_secret_key

DEBUG=True

DATABASE_URL=sqlite

REDIS_URL=redis://127.0.0.1:6379
```

---

# Installation

## Backend

```
git clone repository

cd backend

python -m venv env

env\Scripts\activate

pip install -r requirements.txt

python manage.py migrate

python manage.py runserver
```

---

## Redis

```
redis-server
```

---

## Frontend

```
cd frontend

npm install

npm run dev
```

---

# Testing

The project has been tested using multiple browser windows logged in as different users.

The following functionality has been verified:

- Login
- JWT Authentication
- Workspace Creation
- Chat
- Notes
- Presence
- Notifications
- File Upload
- File Download
- Secure File Access
- WebSocket Communication

---

# Stage 3 Tasks Completed

## Next.js

- Create Next.js Project
- Components
- State
- Props
- Routing

Completed

---

## Backend Integration

- Fetch API
- JWT Authentication
- Loading State
- Error Handling

Completed

---

## Authentication

- Login
- Logout
- Protected Routes
- JWT Storage

Completed

---

## WebSockets

- Django Channels
- Redis
- Consumer
- Group Broadcast

Completed

---

## Chat

- Chat Rooms
- Broadcast Messages
- Message History

Completed

---

## Shared Notes

- Workspace Notes
- Live Collaboration

Completed

---

## Presence

- Online Users
- Offline Users

Completed

---

## Notifications

- Live Notifications
- Toast Popup

Completed

---

## File Sharing

- Upload Files
- Download Files
- Workspace Access Control

Completed

---

# Future Improvements

- Typing Indicator
- Read Receipts
- Drag & Drop Upload
- Multiple File Upload
- Image Preview
- User Profile
- Search Messages
- Voice Messages
- Video Calling
- Emoji Support

---

# Author

Developed as Stage 3 Full-Stack & Real-Time Systems Project using:

- Django
- Django REST Framework
- Django Channels
- Redis
- Next.js
- React