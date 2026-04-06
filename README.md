# 📌 Comments System Project

## 📖 Description

This project is a full-stack comments system built with:

- **Frontend:** React
- **Backend:** ASP.NET Core Web API
- **Database:** PostgreSQL

It allows users to create comments, reply to other comments, add quotes in comments and view them in a structured tree format with pagination and sorting.

---

## 🚀 Features

### 📝 Comments
- Create new comments
- Each comment contains:
  - Username
  - Email
  - File (Optional)
  - Content (structured items):
    - Quote to some existing comment
    - Simple text (can be modify with some HTML tags)

---

### 📎 File Upload
- Optional file attachment per comment
- Files are saved on the server

---

### 💬 Replies (Nested Comments)
- Users can reply to existing comments
- Supports **multi-level nesting (tree structure)**

---

### 📄 Pagination
- Comments are loaded page by page (max comment on page 25)

---

### 🔃 Sorting
Comments can be sorted by:
- `Default` (same as Date)
- `Date` (newest first)
- `Name`
- `Email`

Also comments can be reverse (but only main comments)
