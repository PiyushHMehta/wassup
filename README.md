# WassUp - A Feature-Rich Chat Prototype

This project is a functional prototype demonstrating two proposed features for modern messaging apps like WhatsApp: **Appendable Lists** and **Scheduled & Recurring Messages**. Each feature is designed to solve a common user frustration by providing a technically efficient and user-friendly alternative to current workarounds.

**Live Demo:** [https://wasssup.vercel.app/](https://wasssup.vercel.app/)

**Video Demonstration:** [https://www.youtube.com/watch?v=8vwcTvXrqIQ](https://www.youtube.com/watch?v=8vwcTvXrqIQ)

---

## 1. Feature: Appendable Lists

### The Problem: Manual List-Making
Currently, collaborative list-making in group chats relies on users manually copying, editing, and resending entire messages. This is a common but flawed workaround.

### The Solution: An Interactive, Centralized List Object
This prototype introduces "Appendable Lists," a dedicated message type that functions as a single, interactive object.

#### Why It's Better:
*   **User Experience:** Eliminates tedious copy-pasting, reduces human error, and keeps the chat clean by consolidating all contributions into one place.
*   **Data Integrity:** Users can only modify their own entries, preventing accidental deletion of others' contributions.
*   **Efficiency:** Provides a single, always-up-to-date source of truth for the list.

#### Technical Benefits & Optimizations:
*   **Reduced Message Volume:** Instead of N growing messages for N contributions, there is only 1 initial message and N smaller update operations.
*   **Optimized Network Payload:** When a user appends or edits their entry, the client only needs to send a small delta (e.g., `list_id`, `user_id`, `new_text`) to the server. This is significantly more efficient than resending the entire, ever-expanding list content with each message.
*   **Efficient State Synchronization:** Clients can receive targeted updates for a specific list object, rather than having to process and render a brand new, large message bubble for each minor change.

---

## 2. Feature: Scheduled & Recurring Messages

### The Problem: Manual Repetitive Messaging
Users who need to send regular reminders (e.g., monthly bill payments, weekly meeting announcements) must do so manually. This requires mental effort and can be easily forgotten.

### The Solution: A Client/Server-Side Scheduler
This prototype demonstrates a "Schedule Message" feature, allowing users to write a message once and schedule it to be sent at a specific time, with options for recurrence.

#### Why It's Better:
*   **Automation & Reliability:** "Set it and forget it" functionality ensures timely communication without manual intervention.
*   **Convenience:** Users can plan communications in advance (e.g., schedule birthday wishes, meeting reminders).
*   **Centralized Management:** Provides a dedicated view for users to review, edit, and delete their pending scheduled messages.

#### Technical Benefits & Optimizations:
*   **Reduced Client-Side Workload:** The task is offloaded from the user's memory to the application's infrastructure.
*   **Efficient Task Handling:** On the backend, these scheduled messages can be managed in a priority queue or a cron-like system, a well-understood and optimized task-scheduling pattern.
*   **Resource Utilization:** Messages are only processed and pushed into the main chat pipeline at the scheduled time, preventing unnecessary client-side background activity that might otherwise be required for a purely local reminder system. This approach is more robust and battery-efficient for mobile devices.

---

## Core Features Demonstrated

*   **User Simulation:** Switch between different users to experience interactions from multiple perspectives.
*   **Feature-Rich Interaction:**
    *   **Appendable Lists:** Create, view, append to, and edit entries in a shared list.
    *   **Scheduled Messages:** Schedule a message for a future time with recurrence options and manage them.
*   **Message-Level Actions:** Like, copy, edit (own), and delete (own) functionality.
*   **Modern UI/UX:** Intuitive menus, interactive modals, input retention, and a sleek, responsive design.
*   **Local Storage Persistence:** The entire chat state (messages, scheduled items, user) is saved across browser refreshes.

---

## Technologies Used

*   **HTML5**
*   **Tailwind CSS v2**
*   **Vanilla JavaScript (ES6+)**
*   **Font Awesome (for icons)**
*   **Google Fonts (Inter)**

---

## How to Run Locally

1.  Clone the repository:
    ```bash
    git clone https://github.com/PiyushHMehta/wassup.git
    ```
2.  Navigate to the project directory:
    ```bash
    cd wassup
    ```
3.  Open the `index.html` file in your web browser.

---

## About the Developer

Piyush Mehta
*   **LinkedIn:** [https://www.linkedin.com/in/piyush-mehta-52a815285/](https://www.linkedin.com/in/piyush-mehta-52a815285/)
*   **GitHub:** [https://github.com/PiyushHMehta](https://github.com/PiyushHMehta)

This prototype was developed as a personal project to explore potential UX improvements and automation features for messaging applications, focusing on both user-facing benefits and backend efficiency.


![Inspiration for Appendable lists](https://github.com/user-attachments/assets/9f1f05bb-b16f-4c21-ac25-29c3454533f2)
![Inspiration for scheduling messages](https://github.com/user-attachments/assets/3fd9a58c-6b6b-4965-b6f1-d70a9285a236)
