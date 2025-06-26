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
    const scheduleMessageFromMenuButton = document.getElementById('scheduleMessageFromMenu'); // New
    const viewScheduledMessagesFromMenuButton = document.getElementById('viewScheduledMessagesFromMenu'); // New

    // Modal Elements (Appendable)
    const appendModal = document.getElementById('appendModal');
    const modalPromptTitle = document.getElementById('modalPromptTitle');
    const modalInfo = document.getElementById('modalInfo');
    const modalExistingEntries = document.getElementById('modalExistingEntries'); // Corrected ID reference
    const modalInputLabel = document.getElementById('modalInputLabel');
    const modalInput = document.getElementById('modalInput');
    const modalSaveButton = document.getElementById('modalSaveButton');
    const modalCancelButton = document.getElementById('modalCancelButton');
    const modalDeleteButton = document.getElementById('modalDeleteButton');
    const toggleViewListBtn = document.getElementById('toggleViewListBtn');
    const toggleAppendEditBtn = document.getElementById('toggleAppendEditBtn');
    const appendEditArea = document.getElementById('appendEditArea'); // New container for input/save/delete

    // Modal Elements (Edit Message)
    const editMessageModal = document.getElementById('editMessageModal');
    const editMessageInput = document.getElementById('editMessageInput');
    const editMessageSaveButton = document.getElementById('editMessageSaveButton');
    const editMessageCancelButton = document.getElementById('editMessageCancelButton');

    // New Modal Elements (Schedule Message)
    const scheduleMessageModal = document.getElementById('scheduleMessageModal');
    const scheduleMessageInput = document.getElementById('scheduleMessageInput');
    const scheduleTypeSelect = document.getElementById('scheduleType');
    const scheduleDetailsDiv = document.getElementById('scheduleDetails');
    const scheduleOnceDiv = document.getElementById('scheduleOnce');
    const scheduleDailyDiv = document.getElementById('scheduleDaily');
    const scheduleWeeklyDiv = document.getElementById('scheduleWeekly');
    const scheduleMonthlyDiv = document.getElementById('scheduleMonthly');
    const scheduleSaveButton = document.getElementById('scheduleSaveButton');
    const scheduleCancelButton = document.getElementById('scheduleCancelButton');

    // New Modal Elements (View Scheduled Messages)
    const viewScheduledMessagesModal = document.getElementById('viewScheduledMessagesModal'); // New
    const scheduledMessagesList = document.getElementById('scheduledMessagesList'); // New
    const viewScheduledMessagesCloseButton = document.getElementById('viewScheduledMessagesCloseButton'); // New


    let currentUser = 'user1';
    let messages = []; // Will be loaded from localStorage
    let scheduledMessages = []; // New: Will be loaded from localStorage
    let nextMessageId = 1;
    let currentInteractingMessageId = null; // For appendable modal
    let currentEditingNormalMessageId = null; // For edit normal message modal
    let mainInputTextCache = ''; // To retain text during modal interaction

    const userDisplayNames = {
        user1: "Sleempy",
        user2: "Radhika",
        user3: "May"
    };

    // --- Local Storage Functions ---
    function loadMessages() {
        const storedMessages = localStorage.getItem('chatMessages_v2');
        if (storedMessages) {
            messages = JSON.parse(storedMessages);
            if (messages.length > 0) {
                nextMessageId = Math.max(...messages.map(m => m.id || 0)) + 1;
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
        loadScheduledMessages(); // Load scheduled messages here too
        checkAndSendScheduledMessages(); // Check and send due messages on load
        renderChat(); // Render after loading
    }

    function saveMessages() {
        localStorage.setItem('chatMessages_v2', JSON.stringify(messages));
    }

    function loadScheduledMessages() {
         const storedScheduledMessages = localStorage.getItem('scheduledMessages_v1'); // New key
         if (storedScheduledMessages) {
             scheduledMessages = JSON.parse(storedScheduledMessages);
             // Ensure nextSendTime is treated as a number (timestamp)
             scheduledMessages.forEach(msg => {
                 if (typeof msg.nextSendTime === 'string') {
                     msg.nextSendTime = parseInt(msg.nextSendTime, 10);
                 }
             });
         } else {
             scheduledMessages = [];
         }
    }

    function saveScheduledMessages() {
         localStorage.setItem('scheduledMessages_v1', JSON.stringify(scheduledMessages));
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

    // Helper to format schedule details for display
    function formatScheduleDetails(schedule) {
        const type = schedule.type;
        const details = schedule.details;
        if (type === 'once') {
            return `Once on ${formatDateTime(details.dateTime)}`;
        } else if (type === 'daily') {
            return `Daily at ${details.time}`;
        } else if (type === 'weekly') {
            const days = details.days.map(day => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day]).join(', ');
            return `Weekly on ${days} at ${details.time}`;
        } else if (type === 'monthly') {
            const days = details.days.join(', ');
            return `Monthly on day(s) ${days} at ${details.time}`;
        }
        return 'Unknown Schedule';
    }


    // --- Event Listeners ---
    userSwitcher.addEventListener('change', (e) => {
        currentUser = e.target.value;
        saveCurrentUser();
        renderChat();
        // Close modals if open, or refresh them
        if (!appendModal.classList.contains('hidden')) openAppendModal(currentInteractingMessageId, appendModalMode); // Pass current mode
        if (!editMessageModal.classList.contains('hidden')) { /* Potentially close or refresh if needed */ }
        if (!scheduleMessageModal.classList.contains('hidden')) { /* Potentially close or refresh if needed */ } // New
        if (!viewScheduledMessagesModal.classList.contains('hidden')) { /* Potentially close or refresh if needed */ } // New
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

    // New: Open Schedule Message Modal
    scheduleMessageFromMenuButton.addEventListener('click', () => {
        mainInputTextCache = messageInput.value; // Cache current input text
        messageInput.value = ''; // Clear main input
        openScheduleMessageModal();
        attachmentMenu.classList.add('hidden'); // Close attachment menu
    });

    // New: Open View Scheduled Messages Modal
    viewScheduledMessagesFromMenuButton.addEventListener('click', () => {
         openViewScheduledMessagesModal();
         attachmentMenu.classList.add('hidden'); // Close attachment menu
    });


    // Close attachment menu if clicked outside
    document.addEventListener('click', (event) => {
        if (!attachmentMenu.contains(event.target) && !attachmentButton.contains(event.target)) {
            attachmentMenu.classList.add('hidden');
        }
    });


    // --- Core Rendering & Message Handling ---
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
                // Pass 'view' mode when clicking this button
                viewButton.onclick = () => { mainInputTextCache = messageInput.value; openAppendModal(msg.id, 'view'); };
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
                // Pass 'edit' mode when clicking this button
                appendEditButton.onclick = () => { mainInputTextCache = messageInput.value; openAppendModal(msg.id, 'edit'); };
                actionsDiv.appendChild(appendEditButton);
                messageElement.appendChild(actionsDiv);
            }
            chatArea.appendChild(messageElement);
        });
        chatArea.scrollTop = chatArea.scrollHeight;
    }

    function createActionButton(iconClass, title, onClick) {
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

    // --- Appendable Message Modal Logic ---
    // State for modal mode
    let appendModalMode = 'view'; // 'view' or 'edit' // Renamed variable

    // Helper to switch append modal mode
    function setAppendModalMode(mode) { // Renamed function
        appendModalMode = mode;
        if (mode === 'view') {
            modalExistingEntries.style.display = ''; // Use correct variable name
            appendEditArea.style.display = 'none'; // Hide the input/save/delete area
            toggleViewListBtn.classList.add('bg-blue-500');
            toggleViewListBtn.classList.remove('bg-gray-700');
            toggleAppendEditBtn.classList.remove('bg-blue-500');
            toggleAppendEditBtn.classList.add('bg-gray-700');
        } else { // mode === 'edit'
            modalExistingEntries.style.display = 'none'; // Use correct variable name
            appendEditArea.style.display = ''; // Show the input/save/delete area

            // --- FIX: Ensure input is enabled and visible ---
            modalInput.disabled = false;
            modalInput.classList.remove('hidden');
            appendEditArea.classList.remove('hidden');
            modalInput.classList.remove('pointer-events-none');
            appendEditArea.classList.remove('pointer-events-none');
            // ------------------------------------------------

            toggleViewListBtn.classList.remove('bg-blue-500');
            toggleViewListBtn.classList.add('bg-gray-700');
            toggleAppendEditBtn.classList.add('bg-blue-500');
            toggleAppendEditBtn.classList.remove('bg-gray-700');

             // Set input value and delete button visibility based on existing entry
             const appendableMessage = messages.find(m => m.id === currentInteractingMessageId);
             const userEntry = appendableMessage && appendableMessage.entries && appendableMessage.entries.find(e => e.userId === currentUser);
             if (userEntry) {
                 modalInputLabel.textContent = "Edit Your Contribution:";
                 modalInput.value = userEntry.text;
                 modalDeleteButton.classList.remove('hidden');
             } else {
                 modalInputLabel.textContent = "Add Your Contribution:";
                 modalInput.value = '';
                 modalDeleteButton.classList.add('hidden');
             }
             modalInput.focus(); // Focus input when in edit mode
        }
    }

    // Event listeners for append modal toggle buttons
    toggleViewListBtn.addEventListener('click', () => setAppendModalMode('view'));
    toggleAppendEditBtn.addEventListener('click', () => setAppendModalMode('edit'));


    // Modified: Accept a mode parameter
    function openAppendModal(messageId, mode = 'view') { // Default to view mode
        // mainInputTextCache = messageInput.value; // Already set by the button click handlers
        currentInteractingMessageId = messageId;
        const appendableMessage = messages.find(m => m.id === messageId);
        if (!appendableMessage) return;

        modalPromptTitle.textContent = appendableMessage.prompt;
        modalInfo.textContent = `Created by ${userDisplayNames[appendableMessage.sender]} · ${formatDateTime(appendableMessage.timestamp)} · ${(appendableMessage.entries && appendableMessage.entries.length) || 0} entries`;

        modalExistingEntries.innerHTML = ''; // Use correct variable name
        if (!appendableMessage.entries || appendableMessage.entries.length === 0) {
            modalExistingEntries.innerHTML = `<p class="text-center text-sm text-gray-400 py-8">No entries yet. Be the first to contribute!</p>`; // Use correct variable name
        } else {
            appendableMessage.entries.forEach((entry, entryIndex) => {
                const entryDiv = document.createElement('div');
                entryDiv.classList.add('p-3.5', 'bg-gray-700', 'rounded-lg', 'border', 'border-gray-600', 'mb-2'); // Added mb-2 for spacing

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
                modalExistingEntries.appendChild(entryDiv); // Use correct variable name
            });
        }

        // Set the mode based on the parameter
        setAppendModalMode(mode);

        appendModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        // modalInput.focus(); // Focus is handled by setAppendModalMode
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
            openAppendModal(messageId, appendModalMode); // Refresh the modal in the current mode
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


    // --- Normal Message Actions Logic ---
    function handleLikeNormalMessage(messageId) {
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

    // --- Schedule Message Modal Logic ---

    function openScheduleMessageModal() {
        scheduleMessageInput.value = ''; // Clear previous message
        scheduleTypeSelect.value = 'once'; // Default to 'Once'
        toggleScheduleDetails(); // Show 'Once' details
        // Clear date/time inputs (optional, but good practice)
        document.getElementById('scheduleDateTime').value = '';
        document.getElementById('scheduleTimeDaily').value = '';
        document.getElementById('scheduleTimeWeekly').value = '';
        document.getElementById('scheduleTimeMonthly').value = '';
        document.querySelectorAll('#scheduleWeekly input[type="checkbox"]').forEach(cb => cb.checked = false);
        document.getElementById('scheduleDaysMonthly').value = '';


        scheduleMessageModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        scheduleMessageInput.focus();
    }

    function toggleScheduleDetails() {
        const selectedType = scheduleTypeSelect.value;
        // Hide all detail divs first
        scheduleOnceDiv.classList.add('hidden');
        scheduleDailyDiv.classList.add('hidden');
        scheduleWeeklyDiv.classList.add('hidden');
        scheduleMonthlyDiv.classList.add('hidden');

        // Show the div corresponding to the selected type
        if (selectedType === 'once') {
            scheduleOnceDiv.classList.remove('hidden');
        } else if (selectedType === 'daily') {
            scheduleDailyDiv.classList.remove('hidden');
        } else if (selectedType === 'weekly') {
            scheduleWeeklyDiv.classList.remove('hidden');
        } else if (selectedType === 'monthly') {
            scheduleMonthlyDiv.classList.remove('hidden');
        }
    }

    // Listen for changes on the schedule type select
    scheduleTypeSelect.addEventListener('change', toggleScheduleDetails);

    // Cancel button for schedule modal
    scheduleCancelButton.addEventListener('click', () => closeModal(scheduleMessageModal));

    // Helper to calculate the next send time based on schedule details
    function calculateNextSendTime(scheduleType, details, fromTime = Date.now()) {
        let nextTime = new Date(fromTime);
        const now = new Date();

        if (scheduleType === 'once') {
            // For 'once', the nextSendTime is just the scheduled time
            return details.dateTime;
        }

        // For recurring schedules, parse the time part (HH:MM)
        const [hours, minutes] = details.time.split(':').map(Number);
        nextTime.setHours(hours, minutes, 0, 0); // Set time part

        // If the calculated time today is in the past, move to tomorrow/next week/next month
        if (nextTime <= now) {
             if (scheduleType === 'daily') {
                 nextTime.setDate(nextTime.getDate() + 1);
             } else if (scheduleType === 'weekly') {
                 // Find the next scheduled day of the week *after* today
                 const currentDay = nextTime.getDay(); // 0 for Sunday, 6 for Saturday
                 let daysToAdd = 7; // Default to next week
                 let foundNextDay = false;
                 // Sort days to find the soonest one
                 const sortedDays = details.days.sort((a,b) => a-b);

                 for (const scheduledDay of sortedDays) {
                     let diff = scheduledDay - currentDay;
                     if (diff > 0) { // If scheduled day is in the future this week
                         daysToAdd = diff;
                         foundNextDay = true;
                         break; // Found the soonest day this week
                     }
                 }

                 if (!foundNextDay) {
                     // No scheduled day found in the future this week, take the first day from next week
                     daysToAdd = 7 + sortedDays[0] - currentDay;
                     if (sortedDays[0] <= currentDay) {
                         daysToAdd = 7 + sortedDays[0] - currentDay;
                     } else {
                          // This case should ideally not be reached if sortedDays[0] > currentDay
                          // but as a fallback, ensure we move to next week
                          daysToAdd = 7 - currentDay + sortedDays[0];
                     }
                 }
                 nextTime.setDate(nextTime.getDate() + daysToAdd);

             } else if (scheduleType === 'monthly') {
                 // Find the next scheduled day of the month *after* today
                 const currentDayOfMonth = nextTime.getDate();
                 let foundNextDayInCurrentMonth = false;
                 const sortedDays = details.days.sort((a,b) => a-b);

                 for (const scheduledDay of sortedDays) {
                     if (scheduledDay > currentDayOfMonth) {
                         // Check if this day exists in the current month
                         const tempDate = new Date(nextTime.getFullYear(), nextTime.getMonth(), scheduledDay, hours, minutes, 0, 0);
                         if (tempDate.getMonth() === nextTime.getMonth() && tempDate.getDate() === scheduledDay) {
                             nextTime.setDate(scheduledDay);
                             foundNextDayInCurrentMonth = true;
                             break; // Found the next day in the current month
                         }
                     }
                 }

                 if (!foundNextDayInCurrentMonth) {
                     // No scheduled day found in the current month that is in the future. Move to next month.
                     nextTime.setMonth(nextTime.getMonth() + 1);
                     // Find the earliest scheduled day in the next month
                     const earliestScheduledDay = sortedDays[0];
                     // Ensure the day exists in the new month
                     const lastDayOfNextMonth = new Date(nextTime.getFullYear(), nextTime.getMonth() + 1, 0).getDate();
                     nextTime.setDate(Math.min(earliestScheduledDay, lastDayOfNextMonth));
                 }
             }
        }

        // Ensure the time part is correct after date adjustments
        nextTime.setHours(hours, minutes, 0, 0);

        return nextTime.getTime(); // Return timestamp
    }


    // Save button for schedule modal
    scheduleSaveButton.addEventListener('click', () => {
        const messageText = scheduleMessageInput.value.trim();
        const scheduleType = scheduleTypeSelect.value;
        let scheduleDetails = {};

        if (!messageText) {
            alert("Please enter a message to schedule.");
            return;
        }

        // Collect details based on type and perform basic validation
        if (scheduleType === 'once') {
            const dateTime = document.getElementById('scheduleDateTime').value;
            if (!dateTime) { alert("Please select a date and time."); return; }
            const scheduledTimestamp = new Date(dateTime).getTime();
             if (scheduledTimestamp <= Date.now()) {
                 alert("Scheduled time must be in the future.");
                 return;
             }
            scheduleDetails = { dateTime: scheduledTimestamp };
        } else if (scheduleType === 'daily') {
            const time = document.getElementById('scheduleTimeDaily').value;
             if (!time) { alert("Please select a time."); return; }
            scheduleDetails = { time: time }; // e.g., "14:30"
        } else if (scheduleType === 'weekly') {
            const days = Array.from(document.querySelectorAll('#scheduleWeekly input[type="checkbox"]:checked')).map(cb => parseInt(cb.value));
            const time = document.getElementById('scheduleTimeWeekly').value;
             if (days.length === 0) { alert("Please select at least one day of the week."); return; }
             if (!time) { alert("Please select a time."); return; }
            scheduleDetails = { days: days, time: time }; // days are 0-6 (Sun-Sat)
        } else if (scheduleType === 'monthly') {
            const daysInput = document.getElementById('scheduleDaysMonthly').value.trim();
            const time = document.getElementById('scheduleTimeMonthly').value;
            const days = daysInput.split(',').map(day => parseInt(day.trim())).filter(day => !isNaN(day) && day >= 1 && day <= 31);
             if (days.length === 0) { alert("Please enter valid day(s) of the month (1-31)."); return; }
             if (!time) { alert("Please select a time."); return; }
            scheduleDetails = { days: days, time: time };
        }

        // Calculate the initial next send time
        const initialNextSendTime = calculateNextSendTime(scheduleType, scheduleDetails);

        // Create scheduled message object
        const newScheduledMessage = {
            id: Date.now(), // Simple ID (could use a counter for robustness)
            sender: currentUser,
            text: messageText,
            schedule: {
                type: scheduleType,
                details: scheduleDetails
            },
            nextSendTime: initialNextSendTime,
            createdAt: Date.now()
        };

        scheduledMessages.push(newScheduledMessage);
        saveScheduledMessages();
        console.log("Message scheduled:", newScheduledMessage);
        alert("Message scheduled!"); // Confirmation
        closeModal(scheduleMessageModal);
    });

    // Helper to calculate the *next* send time *after* a message has been sent
    function calculateNextRecurringSendTime(scheduledMsg) {
        // For recurring messages, calculate the next time based on the *current* time,
        // ensuring it's in the future. This handles cases where the app was closed
        // and multiple send times were missed.
        return calculateNextSendTime(scheduledMsg.schedule.type, scheduledMsg.schedule.details, Date.now());
    }


    // --- Scheduled Message Sending Logic ---
    function checkAndSendScheduledMessages() {
        const now = Date.now();
        const messagesToSend = scheduledMessages.filter(msg => msg.nextSendTime <= now);

        messagesToSend.forEach(scheduledMsg => {
            console.log("Sending scheduled message:", scheduledMsg);
            // Add the message to the chat
            addMessageToChat({
                type: 'text', // Scheduled messages are sent as text
                sender: scheduledMsg.sender,
                text: scheduledMsg.text
            });

            // Update or remove the scheduled message
            if (scheduledMsg.schedule.type === 'once') {
                // Mark for removal
                scheduledMsg.remove = true;
            } else {
                // Calculate the next send time for recurring messages
                scheduledMsg.nextSendTime = calculateNextRecurringSendTime(scheduledMsg);
                console.log("Next send time for recurring message:", new Date(scheduledMsg.nextSendTime).toLocaleString());
            }
        });

        // Remove 'once' messages that were sent
        scheduledMessages = scheduledMessages.filter(msg => !msg.remove);

        if (messagesToSend.length > 0) {
            saveScheduledMessages(); // Save changes to scheduled messages
            // renderChat() is called by addMessageToChat
        }
    }

    // --- View Scheduled Messages Modal Logic ---
    function openViewScheduledMessagesModal() {
        renderScheduledMessagesList(); // Populate the list
        viewScheduledMessagesModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function renderScheduledMessagesList() {
        scheduledMessagesList.innerHTML = ''; // Clear current list

        const userScheduledMessages = scheduledMessages.filter(msg => msg.sender === currentUser);

        if (userScheduledMessages.length === 0) {
            scheduledMessagesList.innerHTML = `<p class="text-center text-sm text-gray-400 py-8">You have no scheduled messages.</p>`;
        } else {
            // Sort by next send time
            userScheduledMessages.sort((a, b) => a.nextSendTime - b.nextSendTime);

            userScheduledMessages.forEach(scheduledMsg => {
                const msgDiv = document.createElement('div');
                msgDiv.classList.add('p-3.5', 'bg-gray-700', 'rounded-lg', 'border', 'border-gray-600', 'mb-3');

                const headerDiv = document.createElement('div');
                headerDiv.classList.add('flex', 'justify-between', 'items-center', 'mb-1.5');

                const senderP = document.createElement('p');
                senderP.classList.add('text-sm', 'font-semibold', 'text-gray-100');
                senderP.textContent = userDisplayNames[scheduledMsg.sender] || scheduledMsg.sender; // Should always be currentUser

                const scheduleInfoP = document.createElement('p');
                scheduleInfoP.classList.add('text-xs', 'text-gray-400');
                scheduleInfoP.textContent = formatScheduleDetails(scheduledMsg.schedule);

                headerDiv.appendChild(senderP);
                headerDiv.appendChild(scheduleInfoP);
                msgDiv.appendChild(headerDiv);

                const textP = document.createElement('p');
                textP.classList.add('text-sm', 'text-gray-200', 'whitespace-pre-wrap', 'mb-2.5', 'leading-relaxed');
                textP.textContent = scheduledMsg.text;
                msgDiv.appendChild(textP);

                const nextSendP = document.createElement('p');
                nextSendP.classList.add('text-xs', 'text-gray-500', 'border-t', 'border-gray-600', 'pt-2');
                nextSendP.textContent = `Next Send: ${formatDateTime(scheduledMsg.nextSendTime)}`;
                msgDiv.appendChild(nextSendP);

                 // Add Edit/Delete buttons (placeholder for now)
                 const actionsDiv = document.createElement('div');
                 actionsDiv.classList.add('flex', 'space-x-2', 'mt-2');
                 // Edit button - currently just an alert
                 const editBtn = createActionButton('fas fa-edit', 'Edit Scheduled Message', () => {
                     alert('Edit scheduled message not implemented yet.');
                     // TODO: Implement edit logic
                 });
                 // Delete button
                 const deleteBtn = createActionButton('fas fa-trash', 'Delete Scheduled Message', () => {
                     if (confirm('Are you sure you want to delete this scheduled message?')) {
                         deleteScheduledMessage(scheduledMsg.id);
                     }
                 });
                 deleteBtn.classList.add('hover:text-red-400');
                 actionsDiv.appendChild(editBtn);
                 actionsDiv.appendChild(deleteBtn);
                 msgDiv.appendChild(actionsDiv);


                scheduledMessagesList.appendChild(msgDiv);
            });
        }
    }

    function deleteScheduledMessage(messageId) {
        scheduledMessages = scheduledMessages.filter(msg => msg.id !== messageId);
        saveScheduledMessages();
        renderScheduledMessagesList(); // Refresh the list in the modal
        // If the modal is closed, this call does nothing visible, which is fine.
    }


    // Close button for view scheduled messages modal
    viewScheduledMessagesCloseButton.addEventListener('click', () => closeModal(viewScheduledMessagesModal));


    // --- Generic Close Modal & Restore Input ---
    function closeModal(modalElement) {
        if (modalElement) modalElement.classList.add('hidden');
        document.body.style.overflow = 'auto'; // Restore background scroll
        // Restore main input text only if it was cleared for a modal
        if (mainInputTextCache !== '') {
             messageInput.value = mainInputTextCache;
             mainInputTextCache = ''; // Clear cache after restoring
        }


        currentInteractingMessageId = null;
        currentEditingNormalMessageId = null;
        // No need to clear schedule modal state here, it's done when opening
    }

    // --- Initialization ---
    loadMessages(); // Load messages and scheduled messages, then check and send, then render chat.

    // Add a periodic check for scheduled messages (e.g., every 10 seconds for testing)
    // In a real application, this would ideally be handled server-side or with more robust client-side APIs.
    setInterval(checkAndSendScheduledMessages, 10 * 1000); // Check every 10 seconds

});