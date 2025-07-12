# 📚 StackIt – A Minimal Q&A Forum Platform

StackIt is a clean, minimal, and responsive question-and-answer platform designed for collaborative learning and structured knowledge sharing. Focused on simplicity and user experience, it allows users to ask questions, post answers, vote, and stay notified in real-time within an interactive and minimal interface.

---

## 👥 Team Details

**Team Name:** Team 3438  
**Team Leader:** Daksh Choudhary – [ch.daksh01@gmail.com](mailto:ch.daksh01@gmail.com)

### Team Members
| Name                   | Email                                                |
|------------------------|------------------------------------------------------|
| Saksham Singh Jamwal   | [sakshamsinghjamwal008@gmail.com](mailto:sakshamsinghjamwal008@gmail.com) |
| Paramnoor Singh        | [Paramnoor231@gmail.com](mailto:Paramnoor231@gmail.com)                   |
| Sraban Mondal          | [srabanmondal1@gmail.com](mailto:srabanmondal1@gmail.com)                 |

---

## 🔗 Live Demo

> 🔴 **Currently Local Only**  
> 🟢 *Deployed link coming soon*

## 📽️ Demo Video

> 🎬 [Video Link – COMING SOON]

---

## 🚀 Features

### ✅ Core Functionality
- Ask questions with **title**, **rich description**, and **tags**
- Post answers using a **rich text editor**
- Upvote/downvote answers
- Accept the most helpful answer (by question owner)
- Multi-select **tags** for categorization
- **Real-time notifications** (new answers, mentions, comments)

### 🛠 Admin Tools
- Moderate/reject inappropriate content
- Ban users violating platform rules
- Send global notifications (feature updates, alerts)
- Download usage reports and activity logs

### 📦 Rich Text Editor Includes
- Bold, Italic, Strikethrough
- Lists (ordered/unordered)
- Emoji insertion
- Hyperlinks
- Image upload
- Text alignment options

---

## 🧩 Tech Stack

| Layer        | Technology                      |
|--------------|----------------------------------|
| Frontend     | React.js, Tailwind CSS, Axios   |
| Backend      | Node.js, Express.js             |
| Database     | PostgreSQL                      |
| Auth         | JWT + Bcrypt                    |
| Real-Time    | Socket.IO                       |
| Deployment   | Coming Soon (Vercel/Render)     |

---

## 🛠 Installation (Local Setup)

```bash
# Clone the repository
git clone https://github.com/medakshchoudhary/StackIt.git
cd StackIt

# Backend Setup
cd ../backend
cp .env.example .env     # Add your DB config and JWT secret
npm install
npm start

# Frontend Setup
cd ../frontend
npm install
npm run dev
