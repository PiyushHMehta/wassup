# WassUp - Appendable Lists Prototype for WhatsApp

This project is a functional prototype demonstrating a proposed "Appendable Lists" feature for WhatsApp. It aims to solve the common problem of cumbersome collaborative list-making in group chats by providing a dedicated, interactive message type.

**Live Demo:** [https://wasssup.vercel.app/](https://wasssup.vercel.app/)

**Video Demonstration (90 seconds):** [https://drive.google.com/file/d/1ecLfqZw9Gl92zTiFg2fzXzVM5mHNhFGY/view?usp=sharing]
(https://www.youtube.com/watch?v=8vwcTvXrqIQ)

---

## The Problem

Currently, WhatsApp users often resort to manually copying, editing, and resending entire messages to build collaborative lists (e.g., favorite movies, potluck items, availability). This process is:
*   **Error-prone:** Easy to accidentally delete or overwrite others' entries.
*   **Cluttering:** Fills the chat with repetitive, lengthy messages.
*   **Inefficient:** Time-consuming and tedious.

## The Solution: Appendable Lists

This prototype introduces "Appendable Lists," a new message type that allows users to:
*   **Create a list with a prompt** (e.g., "Favorite Sci-Fi Movies?").
*   **View all responses** in a consolidated, interactive modal.
*   **Append their own entry** to the list.
*   **Edit their own previously submitted entry.**
*   **React (like) and copy** individual entries from others.
*   (For normal messages too) React, copy, edit (own), and delete (own).

This approach aims to provide a cleaner, more organized, and efficient way for groups to collaborate on lists.

---

## Features Demonstrated in Prototype

*   **User Simulation:** Switch between different users (Sleempy, Radhika, May) to experience interactions from multiple perspectives.
*   **Appendable List Creation:** Initiate a new list from an attachment-style menu.
*   **Adding Entries:** Users can add their contributions to the list.
*   **Editing Own Entries:** Users can modify their own submissions.
*   **Deleting Own Entries:** Users can remove their contributions from a list.
*   **Viewing All Entries:** A clear modal view shows all contributions with author and timestamp.
*   **Liking Entries:** Users can "like" individual entries within a list.
*   **Copying Entries:** Easily copy the text of any entry.
*   **Actions on Normal Messages:** Like, copy, edit (own), delete (own).
*   **Message Input Retention:** Text typed in the main input bar is retained if a modal is opened for interaction and then closed.
*   **Local Storage:** Chat messages and the current simulated user are persisted across browser refreshes.
*   **Responsive Design:** UI adapts to different screen sizes (basic responsiveness).
*   **Modern UI:** Sleek, dark-themed interface.

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

This prototype was developed as a personal project to explore potential UX improvements for messaging applications.
