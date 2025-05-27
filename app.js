document.addEventListener('DOMContentLoaded', () => {
    const chatArea = document.getElementById('chatArea');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    // const createAppendableButton = document.getElementById('createAppendableButton'); // Removed
    const userSwitcher = document.getElementById('userSwitcher');

    // New Attachment Elements
    const attachmentButton = document.getElementById('attachmentButton');
    const attachmentMenu = document.getElementById('attachmentMenu');
    const createAppendableListFromMenuButton = document.getElementById('createAppendableListFromMenu');

    // Modal Elements (Appendable, Edit Message - these are from the previous full version)
    const appendModal = document.getElementById('appendModal');
    const modalPromptTitle = document.getElementById('modalPromptTitle');
    const modalInfo = document.getElementById('modalInfo');
    const modalEntriesList = document.getElementById('modalEntriesList');
    const modalInputLabel = document.getElementById('modalInputLabel');
    const modalInput = document.getElementById('modalInput');
    const modalSaveButton = document.getElementById('modalSaveButton');
    const modalCancelButton = document.getElementById('modalCancelButton');
    const modalDeleteButton = document.getElementById('modalDeleteButton');

    const editMessageModal = document.getElementById('editMessageModal');
    const editMessageInput = document.getElementById('editMessageInput');
    const editMessageSaveButton = document.getElementById('editMessageSaveButton');
    const editMessageCancelButton = document.getElementById('editMessageCancelButton');


    let currentUser = 'user1';
    let messages = []; // Will be loaded from localStorage
    let nextMessageId = 1; 
    let currentInteractingMessageId = null; // For appendable modal
    let currentEditingNormalMessageId = null; // For edit normal message modal
    let mainInputTextCache = ''; // To retain text during modal interaction

    const userDisplayNames = {
        user1: "Sleempy",
        user2: "Radhika",
        user3: "May"
    };

    // --- Local Storage Functions (from previous full example) ---
    function loadMessages() {
        const storedMessages = localStorage.getItem('chatMessages_v2'); // Use a new key for v2
        if (storedMessages) {
            messages = JSON.parse(storedMessages);
            if (messages.length > 0) {
                nextMessageId = Math.max(...messages.map(m => m.id || 0)) + 1; // Handle if id is undefined
            } else {
                nextMessageId = 1;
            }
        } else {
            messages = [];
            nextMessageId = 1;
        }
        const storedUser = localStorage.getItem('chatCurrentUser_v2');
        if (storedUser && userDisplayNames[storedUser]) {
            currentUser = storedUser;
            userSwitcher.value = currentUser;
        }
         renderChat(); // Render after loading
    }

    function saveMessages() {
        localStorage.setItem('chatMessages_v2', JSON.stringify(messages));
    }
    
    function saveCurrentUser() {
        localStorage.setItem('chatCurrentUser_v2', currentUser);
    }

    // --- Utility Functions ---
    function formatTimestamp(timestamp) {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    }
    
    function formatDateTime(timestamp) {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
    }

    // --- Event Listeners ---
    userSwitcher.addEventListener('change', (e) => {
        currentUser = e.target.value;
        saveCurrentUser();
        renderChat();
        // Close modals if open, or refresh them
        if (!appendModal.classList.contains('hidden')) openAppendModal(currentInteractingMessageId);
        if (!editMessageModal.classList.contains('hidden')) { /* Potentially close or refresh if needed */ }
        attachmentMenu.classList.add('hidden'); // Close attachment menu on user switch
    });
    
    // --- Attachment Menu Logic ---
    attachmentButton.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent click from bubbling to document
        attachmentMenu.classList.toggle('hidden');
    });

    createAppendableListFromMenuButton.addEventListener('click', () => {
        const prompt = messageInput.value.trim();
        if (prompt) {
            addMessageToChat({ type: 'appendable', sender: currentUser, prompt: prompt, entries: [] });
            messageInput.value = ''; // Clear input after using for prompt
        } else {
            alert("Please type a prompt in the message bar to create a list.");
        }
        attachmentMenu.classList.add('hidden');
    });

    // Close attachment menu if clicked outside
    document.addEventListener('click', (event) => {
        if (!attachmentMenu.contains(event.target) && !attachmentButton.contains(event.target)) {
            attachmentMenu.classList.add('hidden');
        }
    });


    // --- Core Rendering & Message Handling (Mostly from previous full example) ---
    function addMessageToChat(messageData) {
        const fullMessage = { 
            ...messageData, 
            id: nextMessageId++, 
            timestamp: Date.now(),
            likedBy: [], 
            isEdited: false
        };
        messages.push(fullMessage);
        saveMessages();
        renderChat();
    }

    function renderChat() {
        chatArea.innerHTML = '';
        messages.forEach(msg => {
            const messageElement = document.createElement('div');
            messageElement.classList.add('mb-4', 'p-3', 'rounded-xl', 'shadow-md', 'break-words', 'max-w-[85%]', 'sm:max-w-[70%]', 'relative', 'group');

            const senderName = userDisplayNames[msg.sender] || msg.sender;
            const headerDiv = document.createElement('div');
            headerDiv.classList.add('flex', 'justify-between', 'items-baseline', 'mb-1.5');

            const senderP = document.createElement('p');
            senderP.classList.add('text-sm', 'font-semibold');
            senderP.textContent = senderName;

            const timeP = document.createElement('p');
            timeP.classList.add('text-xs');
            if (msg.sender === currentUser) timeP.classList.add('text-blue-200'); else timeP.classList.add('text-gray-500');
            timeP.textContent = formatTimestamp(msg.timestamp);
            
            if (msg.isEdited) {
                const editedIndicator = document.createElement('span');
                editedIndicator.textContent = ' (edited)';
                editedIndicator.classList.add('text-xs', 'italic');
                if (msg.sender === currentUser) editedIndicator.classList.add('text-blue-200'); else editedIndicator.classList.add('text-gray-500');
                timeP.appendChild(editedIndicator);
            }

            headerDiv.appendChild(senderP);
            headerDiv.appendChild(timeP);
            messageElement.appendChild(headerDiv);
            
            if (msg.sender === currentUser) {
                messageElement.classList.add('ml-auto');
                if (msg.type === 'text') {
                    messageElement.classList.add('bg-blue-500', 'text-white');
                    senderP.classList.add('text-blue-100');
                } else if (msg.type === 'appendable') {
                    messageElement.classList.add('bg-gray-800', 'border', 'border-gray-700', 'text-gray-100', 'shadow-lg');
                    senderP.classList.add('text-gray-100'); // Use default text color for current user's list
                    timeP.classList.remove('text-blue-200'); // Reset time color
                    timeP.classList.add('text-gray-400');
                    if (msg.isEdited && timeP.querySelector('span')) timeP.querySelector('span').classList.replace('text-blue-200', 'text-gray-400');

                }
            } else {
                messageElement.classList.add('mr-auto');
                senderP.classList.add('text-gray-300');
                if (msg.type === 'text') {
                    messageElement.classList.add('bg-gray-700', 'text-gray-100');
                } else if (msg.type === 'appendable') {
                     messageElement.classList.add('bg-gray-800', 'border', 'border-gray-700', 'text-gray-100', 'shadow-lg');
                }
            }
            
            if (msg.type === 'text') {
                const textP = document.createElement('p');
                textP.classList.add('text-sm', 'leading-relaxed', 'whitespace-pre-wrap');
                textP.textContent = msg.text;
                messageElement.appendChild(textP);

                const actionsContainer = document.createElement('div');
                actionsContainer.classList.add('message-actions', 'opacity-0', 'group-hover:opacity-100', 'transition-opacity', 'absolute', '-top-2.5', msg.sender === currentUser ? '-left-2' : 'right-1', 'p-0.5', 'bg-gray-600', 'rounded-md', 'shadow-lg', 'flex', 'space-x-0.5', 'z-10');
                if(msg.sender === currentUser) actionsContainer.style.transform = 'translateX(-100%)';


                const likeBtn = createActionButton(
                    `fa${(msg.likedBy && msg.likedBy.includes(currentUser)) ? 's text-blue-400' : 'r'} fa-heart`, 
                    "Like", 
                    () => handleLikeNormalMessage(msg.id)
                );
                actionsContainer.appendChild(likeBtn);

                const copyBtn = createActionButton('fas fa-copy', "Copy", () => {
                    navigator.clipboard.writeText(msg.text);
                     // Subtle feedback
                    const originalHTML = copyBtn.innerHTML;
                    copyBtn.innerHTML = '<i class="fas fa-check text-green-400"></i>';
                    setTimeout(() => { copyBtn.innerHTML = originalHTML; }, 1000);
                });
                actionsContainer.appendChild(copyBtn);
                
                if (msg.sender === currentUser) {
                    const editBtn = createActionButton('fas fa-edit', "Edit", () => openEditNormalMessageModal(msg.id, msg.text));
                    actionsContainer.appendChild(editBtn);
                    const deleteBtn = createActionButton('fas fa-trash', "Delete", () => handleDeleteNormalMessage(msg.id));
                    deleteBtn.classList.add('hover:text-red-400');
                    actionsContainer.appendChild(deleteBtn);
                }
                messageElement.appendChild(actionsContainer);

            } else if (msg.type === 'appendable') {
                messageElement.classList.add('w-full'); // Make appendable lists take full width available in their column
                
                const promptP = document.createElement('p');
                promptP.classList.add('font-semibold', 'text-md', 'mb-1');
                promptP.textContent = msg.prompt;
                messageElement.appendChild(promptP);

                const actionsDiv = document.createElement('div');
                actionsDiv.classList.add('mt-4', 'grid', 'grid-cols-1', 'sm:grid-cols-2', 'gap-2');
                
                const viewButton = document.createElement('button');
                viewButton.classList.add('w-full', 'py-2', 'px-3', 'text-xs', 'sm:text-sm', 'rounded-md', 'font-medium', 'focus:outline-none', 'focus:ring-2', 'focus:ring-offset-2', 'focus:ring-offset-gray-800', 'focus:ring-blue-500', 'bg-gray-700', 'hover:bg-gray-600', 'text-gray-200', 'transition-colors', 'duration-150');
                viewButton.innerHTML = `<i class="fas fa-list-ul mr-1.5"></i> View (${(msg.entries && msg.entries.length) || 0}) Responses`;
                viewButton.onclick = () => { mainInputTextCache = messageInput.value; openAppendModal(msg.id); };
                actionsDiv.appendChild(viewButton);

                const appendEditButton = document.createElement('button');
                appendEditButton.classList.add('w-full', 'py-2', 'px-3', 'text-xs', 'sm:text-sm', 'rounded-md', 'font-medium', 'focus:outline-none', 'focus:ring-2', 'focus:ring-offset-2', 'focus:ring-offset-gray-800', 'focus:ring-blue-500', 'transition-colors', 'duration-150');
                const currentUserEntry = msg.entries && msg.entries.find(e => e.userId === currentUser);
                if (currentUserEntry) {
                    appendEditButton.innerHTML = `<i class="fas fa-edit mr-1.5"></i> Edit My Entry`;
                    appendEditButton.classList.add('bg-gray-600', 'hover:bg-gray-500', 'text-white');
                } else {
                    appendEditButton.innerHTML = `<i class="fas fa-plus mr-1.5"></i> Append to List`;
                    appendEditButton.classList.add('bg-blue-500', 'hover:bg-blue-600', 'text-white');
                }
                appendEditButton.onclick = () => { mainInputTextCache = messageInput.value; openAppendModal(msg.id); };
                actionsDiv.appendChild(appendEditButton);
                messageElement.appendChild(actionsDiv);
            }
            chatArea.appendChild(messageElement);
        });
        chatArea.scrollTop = chatArea.scrollHeight;
    }

    function createActionButton(iconClass, title, onClick) {
        // ... (same as previous full version)
        const button = document.createElement('button');
        button.innerHTML = `<i class="${iconClass}"></i>`;
        button.classList.add('text-xs', 'p-1.5', 'text-gray-300', 'hover:text-white', 'focus:outline-none');
        button.title = title;
        button.onclick = (event) => {
            event.stopPropagation(); // Prevent click from bubbling to message element if actions are inside
            onClick();
        };
        return button;
    }
    
    sendButton.addEventListener('click', () => {
        const text = messageInput.value.trim();
        if (text) {
            addMessageToChat({ type: 'text', sender: currentUser, text: text });
            messageInput.value = '';
        }
    });
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendButton.click();
        }
    });

    // --- Appendable Message Modal Logic (openAppendModal, handleLikeEntry for list entries, modalSaveButton, etc.) ---
    // (This logic needs to be the complete version from the previous "full" example, ensuring saveMessages() is called on changes)
    function openAppendModal(messageId) {
        // mainInputTextCache = messageInput.value; // Already set by the button click handlers
        currentInteractingMessageId = messageId;
        const appendableMessage = messages.find(m => m.id === messageId);
        if (!appendableMessage) return;

        modalPromptTitle.textContent = appendableMessage.prompt;
        modalInfo.textContent = `Created by ${userDisplayNames[appendableMessage.sender]} · ${formatDateTime(appendableMessage.timestamp)} · ${(appendableMessage.entries && appendableMessage.entries.length) || 0} entries`;

        modalEntriesList.innerHTML = '';
        if (!appendableMessage.entries || appendableMessage.entries.length === 0) {
            modalEntriesList.innerHTML = `<p class="text-center text-sm text-gray-400 py-8">No entries yet. Be the first to contribute!</p>`;
        } else {
            appendableMessage.entries.forEach((entry, entryIndex) => {
                const entryDiv = document.createElement('div');
                entryDiv.classList.add('p-3.5', 'bg-gray-700', 'rounded-lg', 'border', 'border-gray-600');

                const entryHeaderDiv = document.createElement('div');
                entryHeaderDiv.classList.add('flex', 'justify-between', 'items-center', 'mb-1.5');
                const entryUserP = document.createElement('p');
                entryUserP.classList.add('text-sm', 'font-semibold', 'text-gray-100');
                entryUserP.textContent = userDisplayNames[entry.userId] || entry.userId;
                const entryTimeP = document.createElement('p');
                entryTimeP.classList.add('text-xs', 'text-gray-400');
                entryTimeP.textContent = formatDateTime(entry.timestamp);
                entryHeaderDiv.appendChild(entryUserP);
                entryHeaderDiv.appendChild(entryTimeP);

                const entryTextP = document.createElement('p');
                entryTextP.classList.add('text-sm', 'text-gray-200', 'whitespace-pre-wrap', 'mb-2.5', 'leading-relaxed');
                entryTextP.textContent = entry.text;

                const entryActionsDiv = document.createElement('div');
                entryActionsDiv.classList.add('flex', 'items-center', 'space-x-3', 'mt-2', 'pt-2.5' ,'border-t', 'border-gray-600');

                const likeButton = createActionButton(
                    `fa${(entry.likedBy && entry.likedBy.includes(currentUser)) ? 's text-blue-400' : 'r'} fa-heart`,
                    "Like Entry",
                    () => handleLikeEntry(appendableMessage.id, entryIndex)
                );
                likeButton.innerHTML += ` <span class="ml-1">${(entry.likedBy && entry.likedBy.length) || 0}</span>`; // Show count
                entryActionsDiv.appendChild(likeButton);


                const copyBtnInModal = createActionButton('fas fa-copy', "Copy Entry", () => {
                     navigator.clipboard.writeText(entry.text);
                     const originalHTML = copyBtnInModal.innerHTML;
                     copyBtnInModal.innerHTML = '<i class="fas fa-check text-green-400"></i> Copied';
                     setTimeout(() => { copyBtnInModal.innerHTML = originalHTML; }, 1000);
                });
                entryActionsDiv.appendChild(copyBtnInModal);


                entryDiv.appendChild(entryHeaderDiv);
                entryDiv.appendChild(entryTextP);
                entryDiv.appendChild(entryActionsDiv);
                modalEntriesList.appendChild(entryDiv);
            });
        }

        const userEntry = appendableMessage.entries && appendableMessage.entries.find(e => e.userId === currentUser);
        if (userEntry) {
            modalInputLabel.textContent = "Edit Your Contribution:";
            modalInput.value = userEntry.text;
            modalDeleteButton.classList.remove('hidden');
        } else {
            modalInputLabel.textContent = "Add Your Contribution:";
            modalInput.value = '';
            modalDeleteButton.classList.add('hidden');
        }
        
        appendModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        modalInput.focus();
    }
    
    function handleLikeEntry(messageId, entryIndex) {
        const msg = messages.find(m => m.id === messageId);
        if (msg && msg.entries && msg.entries[entryIndex]) {
            const entry = msg.entries[entryIndex];
            if (!entry.likedBy) entry.likedBy = [];
            const userLikeIndex = entry.likedBy.indexOf(currentUser);
            if (userLikeIndex > -1) entry.likedBy.splice(userLikeIndex, 1);
            else entry.likedBy.push(currentUser);
            saveMessages();
            openAppendModal(messageId); // Refresh the modal to show updated like count/state
        }
    }
    
    modalSaveButton.addEventListener('click', () => {
        const newText = modalInput.value;
        if (currentInteractingMessageId !== null) {
            const messageIndex = messages.findIndex(m => m.id === currentInteractingMessageId);
            if (messageIndex > -1) {
                if (!messages[messageIndex].entries) messages[messageIndex].entries = [];
                const userEntryIndex = messages[messageIndex].entries.findIndex(e => e.userId === currentUser);
                if (newText.trim()) {
                    if (userEntryIndex > -1) {
                        messages[messageIndex].entries[userEntryIndex].text = newText;
                        messages[messageIndex].entries[userEntryIndex].timestamp = Date.now();
                    } else {
                        messages[messageIndex].entries.push({ 
                            userId: currentUser, text: newText, timestamp: Date.now(), likedBy: [] 
                        });
                    }
                } else if (userEntryIndex > -1 && !newText.trim()) {
                     messages[messageIndex].entries.splice(userEntryIndex, 1);
                }
                saveMessages();
                renderChat();
            }
        }
        closeModal(appendModal);
    });

    modalDeleteButton.addEventListener('click', () => {
        if (currentInteractingMessageId !== null) {
            const messageIndex = messages.findIndex(m => m.id === currentInteractingMessageId);
            if (messageIndex > -1 && messages[messageIndex].entries) {
                const userEntryIndex = messages[messageIndex].entries.findIndex(e => e.userId === currentUser);
                if (userEntryIndex > -1) {
                    messages[messageIndex].entries.splice(userEntryIndex, 1);
                    saveMessages();
                    renderChat();
                }
            }
        }
        closeModal(appendModal);
    });
    
    modalCancelButton.addEventListener('click', () => closeModal(appendModal));


    // --- Normal Message Actions Logic (from previous full example) ---
    function handleLikeNormalMessage(messageId) {
        // ... (implementation from previous full example, including saveMessages() and renderChat())
        const msg = messages.find(m => m.id === messageId);
        if (msg) {
            if (!msg.likedBy) msg.likedBy = [];
            const userLikeIndex = msg.likedBy.indexOf(currentUser);
            if (userLikeIndex > -1) msg.likedBy.splice(userLikeIndex, 1);
            else msg.likedBy.push(currentUser);
            saveMessages();
            renderChat();
        }
    }

    function handleDeleteNormalMessage(messageId) {
        // ... (implementation from previous full example, including confirm, saveMessages(), renderChat())
        if (confirm("Are you sure you want to delete this message?")) {
            messages = messages.filter(m => m.id !== messageId);
            saveMessages();
            renderChat();
        }
    }

    function openEditNormalMessageModal(messageId, currentText) {
        // mainInputTextCache = messageInput.value; // Already set by action button click
        currentEditingNormalMessageId = messageId;
        editMessageInput.value = currentText;
        editMessageModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        editMessageInput.focus();
    }

    editMessageSaveButton.addEventListener('click', () => {
        const newText = editMessageInput.value.trim();
        const msg = messages.find(m => m.id === currentEditingNormalMessageId);
        if (msg && newText) {
            msg.text = newText;
            msg.isEdited = true;
            // msg.timestamp = Date.now(); // Optionally update timestamp on edit
            saveMessages();
            renderChat();
        }
        closeModal(editMessageModal);
    });
    
    editMessageCancelButton.addEventListener('click', () => closeModal(editMessageModal));

    // --- Generic Close Modal & Restore Input ---
    function closeModal(modalElement) {
        if (modalElement) modalElement.classList.add('hidden');
        document.body.style.overflow = 'auto'; // Restore background scroll
        if (messageInput.value === '' && mainInputTextCache) { // Only restore if input was cleared for prompt
             messageInput.value = mainInputTextCache;
        }
        // mainInputTextCache should ideally be cleared only if it was used for a prompt
        // For general modal closing, we might not want to always clear it or restore.
        // If a modal was opened NOT for a prompt, mainInputTextCache might not be relevant to restore.

        currentInteractingMessageId = null;
        currentEditingNormalMessageId = null;
    }
    
    // --- Initialization ---
    loadMessages(); // Load messages first
    // renderChat(); // renderChat is called inside loadMessages now.

});