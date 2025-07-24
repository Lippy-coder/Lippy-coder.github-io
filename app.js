// Import Firebase services
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
    getFirestore,
    collection,
    addDoc,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    onSnapshot,
    arrayUnion,
    arrayRemove,
    writeBatch,
    Timestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";


// --- Firebase Configuration ---
// IMPORTANT: Replace with your actual Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// --- Global State ---
let currentUser = null;
let currentTripId = null;
let tripsUnsubscribe = null;
let tripDetailUnsubscribe = null;
let currentItemization = {}; // Holds temporary itemization data

// --- DOM Elements ---
const mainContent = document.getElementById('main-content');
const appHeader = document.getElementById('app-header');
const loadingSpinner = document.getElementById('loading-spinner');
const messageBox = document.getElementById('message-box');
const messageText = document.getElementById('message-text');

// Views
const authView = document.getElementById('auth-view');
const dashboardView = document.getElementById('dashboard-view');
const tripDetailView = document.getElementById('trip-detail-view');

// Auth elements
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginEmailInput = document.getElementById('login-email');
const loginPasswordInput = document.getElementById('login-password');
const registerUsernameInput = document.getElementById('register-username');
const registerEmailInput = document.getElementById('register-email');
const registerPasswordInput = document.getElementById('register-password');
const authMessage = document.getElementById('auth-message');
const loginTabBtn = document.getElementById('login-tab-btn');
const registerTabBtn = document.getElementById('register-tab-btn');
const profileBtn = document.getElementById('profile-btn');
const logoutBtn = document.getElementById('logout-btn');

// Dashboard elements
const createTripBtn = document.getElementById('create-trip-btn');
const tripsListDiv = document.getElementById('trips-list');

// Modals
const modalBackdrop = document.getElementById('modal-backdrop');
const createTripModal = document.getElementById('create-trip-modal');
const addExpenseModal = document.getElementById('add-expense-modal');
const itemizeExpenseModal = document.getElementById('itemize-expense-modal');
const addMemberModal = document.getElementById('add-member-modal');
const profileModal = document.getElementById('profile-modal');

// Create Trip Modal elements
const createTripForm = document.getElementById('create-trip-form');
const tripNameInput = document.getElementById('trip-name');
const tripCurrencySelect = document.getElementById('trip-currency');
const cancelCreateTripBtn = document.getElementById('cancel-create-trip');

// Add Expense Modal elements
const addExpenseForm = document.getElementById('add-expense-form');
const expenseDescriptionInput = document.getElementById('expense-description');
const expenseAmountInput = document.getElementById('expense-amount');
const expenseCurrencySelect = document.getElementById('expense-currency');
const expensePayerSelect = document.getElementById('expense-payer');
const expenseReceiptInput = document.getElementById('expense-receipt');
const receiptPreview = document.getElementById('receipt-preview');
const receiptPlaceholder = document.getElementById('receipt-placeholder');
const uploadReceiptBtn = document.getElementById('upload-receipt-btn');
const aiItemizeBtn = document.getElementById('ai-itemize-btn');
const cancelAddExpenseBtn = document.getElementById('cancel-add-expense');

// Itemize Expense Modal elements
const itemizeExpenseDescription = document.getElementById('itemize-expense-description');
const itemizationFormContainer = document.getElementById('itemization-form-container');
const itemizedSummaryDiv = document.getElementById('itemized-summary-div');
const cancelItemizeExpenseBtn = document.getElementById('cancel-itemize-expense');
const submitExpenseBtn = document.getElementById('submit-expense-btn');

// Add Member Modal elements
const addMemberForm = document.getElementById('add-member-form');
const memberIdInput = document.getElementById('member-id');
const cancelAddMemberBtn = document.getElementById('cancel-add-member');

// Profile Modal elements
const profileDetailsDiv = document.getElementById('profile-details');
const closeProfileModalBtn = document.getElementById('close-profile-modal');


// --- Currency Data ---
const currencies = {
    "USD": "United States Dollar", "EUR": "Euro", "JPY": "Japanese Yen", "GBP": "British Pound Sterling",
    "AUD": "Australian Dollar", "CAD": "Canadian Dollar", "CHF": "Swiss Franc", "CNY": "Chinese Yuan",
    "SEK": "Swedish Krona", "NZD": "New Zealand Dollar", "MXN": "Mexican Peso", "SGD": "Singapore Dollar",
    "HKD": "Hong Kong Dollar", "NOK": "Norwegian Krone", "KRW": "South Korean Won", "TRY": "Turkish Lira",
    "RUB": "Russian Ruble", "INR": "Indian Rupee", "BRL": "Brazilian Real", "ZAR": "South African Rand"
};

// --- Utility Functions ---

/**
 * Shows a loading spinner.
 */
function showLoading() {
    loadingSpinner.classList.remove('hidden');
}

/**
 * Hides the loading spinner.
 */
function hideLoading() {
    loadingSpinner.classList.add('hidden');
}

/**
 * Displays a message to the user.
 * @param {string} message - The message to display.
 * @param {boolean} isError - Whether the message is an error.
 */
function showMessage(message, isError = false) {
    messageText.textContent = message;
    messageBox.className = `fixed top-5 right-5 text-white py-2 px-4 rounded-lg shadow-lg z-50 transition-transform transform`;
    messageBox.classList.add(isError ? 'bg-red-500' : 'bg-blue-500', 'show');
    
    setTimeout(() => {
        messageBox.classList.remove('show');
        messageBox.classList.add('hide');
    }, 3000);
}

/**
 * Shows a specific view and hides others.
 * @param {string} viewId - The ID of the view to show.
 */
function showView(viewId) {
    const views = [authView, dashboardView, tripDetailView];
    views.forEach(view => {
        if (view.id === viewId) {
            view.classList.remove('hidden');
        } else {
            view.classList.add('hidden');
        }
    });
    appHeader.classList.toggle('hidden', viewId === 'auth-view');
}

/**
 * Opens a modal.
 * @param {HTMLElement} modal - The modal element to open.
 */
function openModal(modal) {
    modalBackdrop.classList.remove('hide');
    modalBackdrop.classList.add('show');
    modal.classList.remove('hide');
    modal.classList.add('show');
}

/**
 * Closes a modal.
 * @param {HTMLElement} modal - The modal element to close.
 */
function closeModal(modal) {
    modalBackdrop.classList.remove('show');
    modalBackdrop.classList.add('hide');
    modal.classList.remove('show');
    modal.classList.add('hide');
    setTimeout(() => {
        modalBackdrop.classList.add('hidden');
        modal.classList.add('hidden');
    }, 300); // Wait for animation to finish
}

/**
 * Populates a select element with currency options.
 * @param {HTMLSelectElement} selectElement - The select element to populate.
 */
function populateCurrencies(selectElement) {
    selectElement.innerHTML = '';
    for (const code in currencies) {
        const option = document.createElement('option');
        option.value = code;
        option.textContent = `${code} - ${currencies[code]}`;
        selectElement.appendChild(option);
    }
}

/**
 * Formats a Firestore Timestamp into a readable string.
 * @param {Timestamp} timestamp - The Firestore Timestamp object.
 * @returns {string} - The formatted date string.
 */
function formatDate(timestamp) {
    if (!timestamp) return 'N/A';
    return timestamp.toDate().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// --- Authentication ---

/**
 * Handles the authentication state changes.
 */
onAuthStateChanged(auth, user => {
    if (user) {
        currentUser = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName
        };
        console.log("User is signed in:", currentUser);
        showView('dashboard-view');
        attachTripsListener();
    } else {
        currentUser = null;
        console.log("User is signed out.");
        showView('auth-view');
        if (tripsUnsubscribe) tripsUnsubscribe();
        if (tripDetailUnsubscribe) tripDetailUnsubscribe();
    }
    hideLoading();
});

/**
 * Handles user registration.
 * @param {Event} e - The form submission event.
 */
async function handleRegister(e) {
    e.preventDefault();
    showLoading();
    const username = registerUsernameInput.value;
    const email = registerEmailInput.value;
    const password = registerPasswordInput.value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: username });
        
        // Create a user document in Firestore
        await setDoc(doc(db, "users", userCredential.user.uid), {
            uid: userCredential.user.uid,
            displayName: username,
            email: email,
            createdAt: Timestamp.now()
        });

        showMessage("Registration successful!");
        registerForm.reset();
    } catch (error) {
        console.error("Registration error:", error);
        showAuthMessage(`Error: ${error.message}`, true);
    } finally {
        hideLoading();
    }
}

/**
 * Handles user login.
 * @param {Event} e - The form submission event.
 */
async function handleLogin(e) {
    e.preventDefault();
    showLoading();
    const email = loginEmailInput.value;
    const password = loginPasswordInput.value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        showMessage("Login successful!");
        loginForm.reset();
    } catch (error) {
        console.error("Login error:", error);
        showAuthMessage(`Error: ${error.message}`, true);
    } finally {
        hideLoading();
    }
}

/**
 * Handles user logout.
 */
async function handleLogout() {
    showLoading();
    try {
        await signOut(auth);
        closeModal(profileModal);
        showMessage("You have been logged out.");
    } catch (error) {
        console.error("Logout error:", error);
        showMessage("Error logging out.", true);
    } finally {
        hideLoading();
    }
}

/**
 * Displays a message on the authentication form.
 * @param {string} message - The message to display.
 * @param {boolean} isError - Whether the message is an error.
 */
function showAuthMessage(message, isError = false) {
    authMessage.textContent = message;
    authMessage.className = 'mb-4 text-center p-2 rounded-md';
    authMessage.classList.add(isError ? 'bg-red-100' : 'bg-green-100', isError ? 'text-red-700' : 'text-green-700');
    authMessage.classList.remove('hidden');
}

/**
 * Hides the authentication form message.
 */
function hideAuthMessage() {
    authMessage.classList.add('hidden');
}

// --- Trip Management ---

/**
 * Attaches a real-time listener for the user's trips.
 */
function attachTripsListener() {
    if (!currentUser) return;
    if (tripsUnsubscribe) tripsUnsubscribe(); // Detach previous listener

    const q = query(collection(db, "trips"), where("members", "array-contains", currentUser.uid));
    tripsUnsubscribe = onSnapshot(q, (querySnapshot) => {
        const trips = [];
        querySnapshot.forEach((doc) => {
            trips.push({ id: doc.id, ...doc.data() });
        });
        renderTrips(trips);
    }, (error) => {
        console.error("Error fetching trips:", error);
        showMessage("Could not fetch trips.", true);
    });
}

/**
 * Renders the list of trips on the dashboard.
 * @param {Array<Object>} trips - The array of trip objects.
 */
function renderTrips(trips) {
    tripsListDiv.innerHTML = '';
    if (trips.length === 0) {
        tripsListDiv.innerHTML = `<p class="text-gray-500 col-span-full text-center">You have no trips yet. Create one to get started!</p>`;
        return;
    }

    trips.forEach(trip => {
        const tripCard = document.createElement('div');
        tripCard.className = "bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer";
        tripCard.innerHTML = `
            <h3 class="text-xl font-bold text-gray-800 truncate">${trip.name}</h3>
            <p class="text-gray-500 mt-2">Created: ${formatDate(trip.createdAt)}</p>
            <div class="mt-4 flex -space-x-2 overflow-hidden">
                <!-- Member avatars would go here -->
            </div>
        `;
        tripCard.addEventListener('click', () => {
            currentTripId = trip.id;
            showView('trip-detail-view');
            attachTripDetailListener(trip.id);
        });
        tripsListDiv.appendChild(tripCard);
    });
}

/**
 * Handles the creation of a new trip.
 * @param {Event} e - The form submission event.
 */
async function handleCreateTrip(e) {
    e.preventDefault();
    showLoading();
    const tripName = tripNameInput.value;
    const tripCurrency = tripCurrencySelect.value;

    try {
        await addDoc(collection(db, "trips"), {
            name: tripName,
            currency: tripCurrency,
            owner: currentUser.uid,
            members: [currentUser.uid],
            createdAt: Timestamp.now()
        });
        showMessage("Trip created successfully!");
        closeModal(createTripModal);
        createTripForm.reset();
    } catch (error) {
        console.error("Error creating trip:", error);
        showMessage("Failed to create trip.", true);
    } finally {
        hideLoading();
    }
}

// --- Trip Detail View ---

/**
 * Attaches a real-time listener for a specific trip's details.
 * @param {string} tripId - The ID of the trip to listen to.
 */
function attachTripDetailListener(tripId) {
    if (tripDetailUnsubscribe) tripDetailUnsubscribe(); // Detach previous listener

    tripDetailUnsubscribe = onSnapshot(doc(db, "trips", tripId), async (doc) => {
        if (doc.exists()) {
            const tripData = { id: doc.id, ...doc.data() };
            await renderTripDetail(tripData);
        } else {
            console.error("Trip not found");
            showMessage("Trip not found.", true);
            showView('dashboard-view');
        }
    }, (error) => {
        console.error("Error fetching trip details:", error);
        showMessage("Could not fetch trip details.", true);
    });
}

/**
 * Renders the details of a single trip.
 * @param {Object} trip - The trip data object.
 */
async function renderTripDetail(trip) {
    showLoading();
    
    // Fetch member details
    const memberPromises = trip.members.map(uid => getDoc(doc(db, "users", uid)));
    const memberDocs = await Promise.all(memberPromises);
    const members = memberDocs.map(doc => doc.data());

    // Fetch expenses
    const expensesQuery = query(collection(db, "trips", trip.id, "expenses"));
    const expenseDocs = await getDocs(expensesQuery);
    const expenses = expenseDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Calculate balances
    const balances = calculateBalances(expenses, members, trip.currency);
    
    tripDetailView.innerHTML = `
        <!-- Header -->
        <div class="mb-8">
            <button id="back-to-dashboard-btn" class="text-blue-600 hover:underline mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Back to Dashboard
            </button>
            <div class="flex justify-between items-start">
                <div>
                    <h2 class="text-4xl font-bold text-gray-800">${trip.name}</h2>
                    <p class="text-gray-500 mt-2">Default Currency: ${trip.currency}</p>
                </div>
                <button id="add-expense-btn-detail" class="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    Add Expense
                </button>
            </div>
        </div>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Left Column: Expenses -->
            <div class="lg:col-span-2">
                <h3 class="text-2xl font-bold text-gray-800 mb-4">Expenses</h3>
                <div id="expenses-list" class="space-y-4">
                    ${expenses.length > 0 ? expenses.map(e => renderExpenseCard(e, members)).join('') : '<p class="text-gray-500 bg-white p-6 rounded-lg shadow-sm">No expenses have been added yet.</p>'}
                </div>
            </div>

            <!-- Right Column: Members & Balances -->
            <div class="space-y-8">
                <!-- Members -->
                <div>
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-2xl font-bold text-gray-800">Members</h3>
                        ${trip.owner === currentUser.uid ? `<button id="add-member-btn" class="text-blue-600 hover:underline text-sm font-medium">+ Add Member</button>` : ''}
                    </div>
                    <div id="members-list" class="space-y-3 bg-white p-4 rounded-lg shadow-sm">
                        ${members.map(m => renderMember(m)).join('')}
                    </div>
                </div>

                <!-- Balances -->
                <div>
                    <h3 class="text-2xl font-bold text-gray-800 mb-4">Balances</h3>
                    <div id="balances-list" class="space-y-3 bg-white p-4 rounded-lg shadow-sm">
                        ${renderBalances(balances, trip.currency)}
                    </div>
                </div>
            </div>
        </div>
    `;

    // Attach event listeners
    document.getElementById('back-to-dashboard-btn').addEventListener('click', () => {
        showView('dashboard-view');
        if (tripDetailUnsubscribe) tripDetailUnsubscribe();
        currentTripId = null;
    });

    document.getElementById('add-expense-btn-detail').addEventListener('click', () => {
        populateAddExpenseModal(members, trip.currency);
        openModal(addExpenseModal);
    });
    
    if (trip.owner === currentUser.uid) {
        document.getElementById('add-member-btn').addEventListener('click', () => openModal(addMemberModal));
    }

    // Add listeners for deleting expenses
    document.querySelectorAll('.delete-expense-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
            const expenseId = e.currentTarget.dataset.expenseId;
            if (confirm("Are you sure you want to delete this expense? This action cannot be undone.")) {
                await handleDeleteExpense(trip.id, expenseId);
            }
        });
    });

    hideLoading();
}

/**
 * Renders a single expense card.
 * @param {Object} expense - The expense object.
 * @param {Array<Object>} members - The array of member objects.
 * @returns {string} - The HTML string for the expense card.
 */
function renderExpenseCard(expense, members) {
    const payer = members.find(m => m.uid === expense.payerId);
    return `
        <div class="bg-white p-5 rounded-lg shadow-sm flex justify-between items-center">
            <div>
                <p class="font-bold text-lg text-gray-800">${expense.description}</p>
                <p class="text-sm text-gray-500">Paid by ${payer ? payer.displayName : 'Unknown'} on ${formatDate(expense.createdAt)}</p>
            </div>
            <div class="text-right">
                <p class="font-bold text-xl text-gray-900">${expense.amount.toFixed(2)} ${expense.currency}</p>
                 <button data-expense-id="${expense.id}" class="delete-expense-btn text-red-500 hover:text-red-700 text-xs mt-1">Delete</button>
            </div>
        </div>
    `;
}

/**
 * Renders a single member in the list.
 * @param {Object} member - The member object.
 * @returns {string} - The HTML string for the member.
 */
function renderMember(member) {
    return `<div class="flex items-center justify-between p-2 rounded-md hover:bg-gray-100">
                <span class="text-gray-700">${member.displayName}</span>
                <span class="text-xs text-gray-400">${member.email}</span>
            </div>`;
}

/**
 * Calculates the final balances for each member.
 * @param {Array<Object>} expenses - The array of expense objects.
 * @param {Array<Object>} members - The array of member objects.
 * @param {string} baseCurrency - The base currency of the trip.
 * @returns {Object} - An object with member balances.
 */
function calculateBalances(expenses, members, baseCurrency) {
    const balances = {};
    members.forEach(m => balances[m.uid] = 0);

    expenses.forEach(expense => {
        // For simplicity, this example assumes all expenses are in the base currency.
        // A real implementation would need exchange rate conversion here.
        balances[expense.payerId] += expense.amount;
        const share = expense.amount / expense.participants.length;
        expense.participants.forEach(participantId => {
            balances[participantId] -= share;
        });
    });

    return balances;
}

/**
 * Renders the balances list.
 * @param {Object} balances - The balances object.
 * @param {string} currency - The trip's currency.
 * @returns {string} - The HTML string for the balances list.
 */
function renderBalances(balances, currency) {
    let html = '';
    // This is a simplified balance view. A full implementation would show who owes whom.
    for (const uid in balances) {
        const user = auth.currentUser; // This is a simplification. You'd need a proper user map.
        const balance = balances[uid];
        const name = user && user.uid === uid ? user.displayName : `Member ${uid.substring(0, 5)}`;
        const colorClass = balance >= 0 ? 'text-green-600' : 'text-red-600';
        const sign = balance >= 0 ? '+' : '';
        html += `
            <div class="flex items-center justify-between p-2 rounded-md hover:bg-gray-100">
                <span class="text-gray-700">${name}</span>
                <span class="font-medium ${colorClass}">${sign}${balance.toFixed(2)} ${currency}</span>
            </div>
        `;
    }
    return html;
}

/**
 * Handles adding a new member to the trip.
 * @param {Event} e - The form submission event.
 */
async function handleAddMember(e) {
    e.preventDefault();
    const userIdToAdd = memberIdInput.value.trim();
    if (!userIdToAdd) return;

    showLoading();
    try {
        // Check if user exists
        const userDoc = await getDoc(doc(db, "users", userIdToAdd));
        if (!userDoc.exists()) {
            throw new Error("User with this ID does not exist.");
        }

        // Add member to trip
        const tripRef = doc(db, "trips", currentTripId);
        await updateDoc(tripRef, {
            members: arrayUnion(userIdToAdd)
        });

        showMessage("Member added successfully!");
        closeModal(addMemberModal);
        addMemberForm.reset();
    } catch (error) {
        console.error("Error adding member:", error);
        showMessage(error.message, true);
    } finally {
        hideLoading();
    }
}

// --- Expense Management ---

/**
 * Populates the Add Expense modal with current trip data.
 * @param {Array<Object>} members - The members of the current trip.
 * @param {string} defaultCurrency - The trip's default currency.
 */
function populateAddExpenseModal(members, defaultCurrency) {
    // Populate currencies
    populateCurrencies(expenseCurrencySelect);
    expenseCurrencySelect.value = defaultCurrency;

    // Populate payers
    expensePayerSelect.innerHTML = '';
    members.forEach(member => {
        const option = document.createElement('option');
        option.value = member.uid;
        option.textContent = member.displayName;
        if (member.uid === currentUser.uid) {
            option.selected = true;
        }
        expensePayerSelect.appendChild(option);
    });

    // Reset form
    addExpenseForm.reset();
    receiptPreview.classList.add('hidden');
    receiptPlaceholder.classList.remove('hidden');
    aiItemizeBtn.disabled = true;
    expenseReceiptInput.value = ''; // Clear file input
}

/**
 * Handles the submission of the Add Expense form, leading to the itemization step.
 * @param {Event} e - The form submission event.
 */
async function handleAddExpense(e) {
    e.preventDefault();
    
    const description = expenseDescriptionInput.value;
    const amount = parseFloat(expenseAmountInput.value);
    const currency = expenseCurrencySelect.value;
    const payerId = expensePayerSelect.value;
    const receiptFile = expenseReceiptInput.files[0];

    if (!description || isNaN(amount) || !currency || !payerId) {
        showMessage("Please fill all required fields.", true);
        return;
    }

    showLoading();
    
    // Get exchange rate if currency is different from trip's base currency
    const tripDoc = await getDoc(doc(db, "trips", currentTripId));
    const tripCurrency = tripDoc.data().currency;
    let exchangeRate = 1;
    if (currency !== tripCurrency) {
        try {
            exchangeRate = await getExchangeRate(currency, tripCurrency);
        } catch (error) {
            showMessage("Could not fetch exchange rate. Please use the trip's default currency.", true);
            hideLoading();
            return;
        }
    }

    currentItemization = {
        description,
        totalAmount: amount,
        currency,
        payerId,
        receiptFile,
        tripCurrency,
        exchangeRate,
        baseAmount: amount * exchangeRate,
        items: [],
        participants: []
    };

    closeModal(addExpenseModal);
    setupItemizationModal();
    openModal(itemizeExpenseModal);
    hideLoading();
}

/**
 * Handles deleting an expense.
 * @param {string} tripId - The ID of the trip.
 * @param {string} expenseId - The ID of the expense to delete.
 */
async function handleDeleteExpense(tripId, expenseId) {
    showLoading();
    try {
        const expenseRef = doc(db, "trips", tripId, "expenses", expenseId);
        await deleteDoc(expenseRef);
        showMessage("Expense deleted successfully.");
    } catch (error) {
        console.error("Error deleting expense:", error);
        showMessage("Failed to delete expense.", true);
    } finally {
        hideLoading();
    }
}


// --- AI & Itemization ---

/**
 * Handles the receipt file selection.
 */
function handleReceiptSelection() {
    const file = expenseReceiptInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            receiptPreview.src = e.target.result;
            receiptPreview.classList.remove('hidden');
            receiptPlaceholder.classList.add('hidden');
        };
        reader.readAsDataURL(file);
        aiItemizeBtn.disabled = false;
    }
}

/**
 * Uses Gemini to analyze a receipt image and extract items.
 */
async function handleAiItemize() {
    if (!expenseReceiptInput.files[0]) {
        showMessage("Please upload a receipt image first.", true);
        return;
    }
    
    showLoading();
    aiItemizeBtn.disabled = true;
    aiItemizeBtn.textContent = 'Analyzing...';

    try {
        const compressedFile = await imageCompression(expenseReceiptInput.files[0], {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920
        });

        const items = await analyzeImageWithGemini(compressedFile);
        
        // Populate the itemization modal with the extracted items
        currentItemization.items = items;
        closeModal(addExpenseModal);
        setupItemizationModal(true); // true indicates it's from AI
        openModal(itemizeExpenseModal);
        showMessage("Receipt analyzed successfully!");

    } catch (error) {
        console.error("AI Itemization Error:", error);
        showMessage(`AI analysis failed: ${error.message}`, true);
    } finally {
        hideLoading();
        aiItemizeBtn.disabled = false;
        aiItemizeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd" /></svg> AI Itemize`;
    }
}

/**
 * Sets up the itemization modal with form fields.
 * @param {boolean} fromAI - Whether the data is from the AI.
 */
async function setupItemizationModal(fromAI = false) {
    itemizeExpenseDescription.textContent = `${currentItemization.description} - ${currentItemization.totalAmount.toFixed(2)} ${currentItemization.currency}`;
    
    // Fetch members for checkboxes
    const tripDoc = await getDoc(doc(db, "trips", currentTripId));
    const memberIds = tripDoc.data().members;
    const memberPromises = memberIds.map(uid => getDoc(doc(db, "users", uid)));
    const memberDocs = await Promise.all(memberPromises);
    const members = memberDocs.map(doc => doc.data());

    let formHTML = '<form id="itemize-expense-form">';
    
    if (fromAI && currentItemization.items.length > 0) {
        // AI-populated items
        currentItemization.items.forEach((item, index) => {
            formHTML += createItemHTML(item, index, members);
        });
    } else {
        // Manual itemization: start with one item field
        formHTML += createItemHTML({ description: 'Item 1', price: currentItemization.totalAmount }, 0, members);
    }

    formHTML += `
        <button type="button" id="add-another-item-btn" class="mt-4 text-blue-600 hover:underline text-sm font-medium">+ Add another item</button>
    </form>`;
    
    itemizationFormContainer.innerHTML = formHTML;
    updateItemizedSummary(members);

    // Attach event listeners within the modal
    itemizationFormContainer.addEventListener('input', () => updateItemizedSummary(members));
    itemizationFormContainer.addEventListener('change', () => updateItemizedSummary(members));
    document.getElementById('add-another-item-btn').addEventListener('click', () => {
        const itemCount = itemizationFormContainer.querySelectorAll('.item-container').length;
        const newItemHtml = createItemHTML({ description: `Item ${itemCount + 1}`, price: 0 }, itemCount, members);
        document.getElementById('add-another-item-btn').insertAdjacentHTML('beforebegin', newItemHtml);
    });

    document.getElementById('itemize-expense-form').addEventListener('submit', handleFinalExpenseSubmission);
}

/**
 * Creates the HTML for a single item in the itemization form.
 * @param {Object} item - The item data {description, price}.
 * @param {number} index - The index of the item.
 * @param {Array<Object>} members - The trip members.
 * @returns {string} - The HTML string for the item form fields.
 */
function createItemHTML(item, index, members) {
    return `
        <div class="item-container p-4 border rounded-lg mb-4 bg-white">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label for="item-desc-${index}" class="block text-sm font-medium text-gray-700">Item Description</label>
                    <input type="text" id="item-desc-${index}" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm" value="${item.description || ''}" required>
                </div>
                <div>
                    <label for="item-price-${index}" class="block text-sm font-medium text-gray-700">Price (${currentItemization.currency})</label>
                    <input type="number" step="0.01" id="item-price-${index}" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm" value="${item.price || 0}" required>
                </div>
            </div>
            <div class="mt-4">
                <p class="block text-sm font-medium text-gray-700 mb-2">Shared by:</p>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    ${members.map(member => `
                        <label class="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                            <input type="checkbox" data-member-id="${member.uid}" data-item-index="${index}" class="h-4 w-4 text-blue-600 border-gray-300 rounded">
                            <span>${member.displayName}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

/**
 * Updates the summary view in the itemization modal based on form inputs.
 * @param {Array<Object>} members - The trip members.
 */
function updateItemizedSummary(members) {
    const items = [];
    const itemContainers = itemizationFormContainer.querySelectorAll('.item-container');
    let totalAssigned = 0;

    itemContainers.forEach((container, index) => {
        const description = container.querySelector(`#item-desc-${index}`).value;
        const price = parseFloat(container.querySelector(`#item-price-${index}`).value) || 0;
        totalAssigned += price;

        const participants = [];
        container.querySelectorAll(`input[type="checkbox"]:checked`).forEach(checkbox => {
            participants.push(checkbox.dataset.memberId);
        });
        
        items.push({ description, price, participants });
    });

    // Update the global itemization object
    currentItemization.items = items;
    
    // Render summary
    itemizedSummaryDiv.innerHTML = '';
    const summaryList = document.createElement('ul');
    summaryList.className = 'space-y-2 text-sm';
    
    items.forEach(item => {
        const share = item.participants.length > 0 ? (item.price / item.participants.length).toFixed(2) : '0.00';
        const memberNames = item.participants.map(pid => members.find(m => m.uid === pid)?.displayName || 'Unknown').join(', ');
        summaryList.innerHTML += `
            <li class="flex justify-between">
                <span class="text-gray-600">${item.description}</span>
                <span class="text-gray-800 font-medium">${item.price.toFixed(2)} ${currentItemization.currency}</span>
            </li>
            <li class="text-xs text-gray-500 pl-2 mb-2">
                &hookrightarrow; ${memberNames} (${share} each)
            </li>
        `;
    });
    itemizedSummaryDiv.appendChild(summaryList);

    const totalEl = document.createElement('div');
    totalEl.className = 'mt-4 pt-4 border-t font-bold flex justify-between';
    totalEl.innerHTML = `<span>Total Assigned</span><span>${totalAssigned.toFixed(2)} ${currentItemization.currency}</span>`;
    itemizedSummaryDiv.appendChild(totalEl);

    const originalTotalEl = document.createElement('div');
    originalTotalEl.className = 'mt-1 flex justify-between text-sm text-gray-500';
    originalTotalEl.innerHTML = `<span>Original Total</span><span>${currentItemization.totalAmount.toFixed(2)} ${currentItemization.currency}</span>`;
    itemizedSummaryDiv.appendChild(originalTotalEl);

    // Validation
    const difference = currentItemization.totalAmount - totalAssigned;
    const validationEl = document.createElement('div');
    validationEl.className = 'mt-4 p-2 rounded-md text-sm font-semibold ';
    
    if (Math.abs(difference) < 0.01) {
        validationEl.textContent = `Totals match. Ready to submit!`;
        validationEl.className += 'bg-green-100 text-green-800';
        submitExpenseBtn.disabled = false;
    } else {
        validationEl.textContent = `Unassigned: ${difference.toFixed(2)} ${currentItemization.currency}`;
        validationEl.className += 'bg-red-100 text-red-800';
        submitExpenseBtn.disabled = true;
    }
    itemizedSummaryDiv.appendChild(validationEl);
}

/**
 * Handles the final submission of the fully itemized expense.
 * @param {Event} e - The form submission event.
 */
async function handleFinalExpenseSubmission(e) {
    e.preventDefault();
    showLoading();

    try {
        let receiptURL = '';
        if (currentItemization.receiptFile) {
            const filePath = `receipts/${currentTripId}/${Date.now()}_${currentItemization.receiptFile.name}`;
            const fileRef = ref(storage, filePath);
            const snapshot = await uploadBytes(fileRef, currentItemization.receiptFile);
            receiptURL = await getDownloadURL(snapshot.ref);
        }

        const batch = writeBatch(db);
        
        // Flatten participants list and create expense doc
        const allParticipants = new Set();
        currentItemization.items.forEach(item => {
            item.participants.forEach(pid => allParticipants.add(pid));
        });

        const expenseRef = doc(collection(db, "trips", currentTripId, "expenses"));
        batch.set(expenseRef, {
            description: currentItemization.description,
            amount: currentItemization.totalAmount,
            currency: currentItemization.currency,
            baseAmount: currentItemization.baseAmount, // Amount in trip's base currency
            payerId: currentItemization.payerId,
            participants: Array.from(allParticipants),
            receiptURL: receiptURL,
            createdAt: Timestamp.now()
        });

        // Create item sub-collection documents
        currentItemization.items.forEach(item => {
            const itemRef = doc(collection(expenseRef, "items"));
            batch.set(itemRef, {
                description: item.description,
                price: item.price,
                participants: item.participants
            });
        });

        await batch.commit();

        showMessage("Expense added successfully!");
        closeModal(itemizeExpenseModal);
        currentItemization = {}; // Clear the state

    } catch (error) {
        console.error("Error submitting expense:", error);
        showMessage("Failed to submit expense.", true);
    } finally {
        hideLoading();
    }
}

// --- External APIs ---

/**
 * Fetches the exchange rate between two currencies.
 * @param {string} from - The currency code to convert from.
 * @param {string} to - The currency code to convert to.
 * @returns {Promise<number>} - The exchange rate.
 */
async function getExchangeRate(from, to) {
    // NOTE: This uses a free API with no key required. It may have rate limits.
    // For a production app, use a more robust service.
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${from}`);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const data = await response.json();
    const rate = data.rates[to];
    if (!rate) {
        throw new Error(`Exchange rate for ${to} not found.`);
    }
    return rate;
}

/**
 * Sends an image to the Gemini API for analysis.
 * @param {File} imageFile - The image file to analyze.
 * @returns {Promise<Array<Object>>} - A promise that resolves to an array of item objects.
 */
async function analyzeImageWithGemini(imageFile) {
    // IMPORTANT: This function requires a server-side component or a cloud function
    // to securely handle the API key. Exposing an API key on the client-side is a
    // major security risk. The URL below is a placeholder for your backend endpoint.

    const backendUrl = 'YOUR_BACKEND_ENDPOINT_FOR_GEMINI_API';
    
    // This is a mock implementation.
    console.warn("Using mock Gemini API response. Implement a secure backend endpoint.");
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                { description: 'Coffee', price: 4.50 },
                { description: 'Croissant', price: 3.25 },
                { description: 'Orange Juice', price: 5.00 }
            ]);
        }, 1500);
    });
    
    /*
    // Example of how a real implementation might look:
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(backendUrl, {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze image.');
    }

    const data = await response.json();
    return data.items; // Assuming the backend returns { items: [...] }
    */
}


// --- Profile Management ---

/**
 * Renders the user's profile details in the modal.
 */
function renderProfile() {
    if (!currentUser) return;
    profileDetailsDiv.innerHTML = `
        <div class="p-4 border rounded-lg bg-gray-50">
            <p><strong class="font-medium text-gray-800">Username:</strong> <span class="text-gray-600">${currentUser.displayName}</span></p>
            <p><strong class="font-medium text-gray-800">Email:</strong> <span class="text-gray-600">${currentUser.email}</span></p>
        </div>
        <div>
            <p class="font-medium text-gray-800">Your User ID:</p>
            <div class="mt-2 p-3 bg-gray-100 rounded-md flex items-center justify-between">
                <span id="user-id-text" class="text-sm text-gray-700 font-mono break-all">${currentUser.uid}</span>
                <button id="copy-user-id-btn" class="ml-4 text-gray-500 hover:text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                </button>
            </div>
            <p class="text-xs text-gray-500 mt-2">Share this ID with friends to add them to your trips.</p>
        </div>
    `;
    
    document.getElementById('copy-user-id-btn').addEventListener('click', () => {
        const userIdText = document.getElementById('user-id-text').innerText;
        navigator.clipboard.writeText(userIdText).then(() => {
            showMessage("User ID copied to clipboard!");
        }).catch(err => {
            showMessage("Failed to copy ID.", true);
        });
    });
}


// --- Event Listeners ---

/**
 * Attaches all initial event listeners.
 */
function initializeEventListeners() {
    // Auth
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
    logoutBtn.addEventListener('click', handleLogout);

    // Profile
    profileBtn.addEventListener('click', () => {
        renderProfile();
        openModal(profileModal);
    });
    closeProfileModalBtn.addEventListener('click', () => closeModal(profileModal));
    
    // Dashboard
    createTripBtn.addEventListener('click', () => {
        populateCurrencies(tripCurrencySelect);
        openModal(createTripModal);
    });

    // Create Trip Modal
    createTripForm.addEventListener('submit', handleCreateTrip);
    cancelCreateTripBtn.addEventListener('click', () => closeModal(createTripModal));

    // Add Expense Modal
    addExpenseForm.addEventListener('submit', handleAddExpense);
    cancelAddExpenseBtn.addEventListener('click', () => closeModal(addExpenseModal));
    uploadReceiptBtn.addEventListener('click', () => expenseReceiptInput.click());
    expenseReceiptInput.addEventListener('change', handleReceiptSelection);
    aiItemizeBtn.addEventListener('click', handleAiItemize);

    // Itemize Expense Modal
    cancelItemizeExpenseBtn.addEventListener('click', () => {
        if (confirm("Are you sure? All itemization progress will be lost.")) {
            closeModal(itemizeExpenseModal);
            currentItemization = {};
        }
    });

    // Add Member Modal
    addMemberForm.addEventListener('submit', handleAddMember);
    cancelAddMemberBtn.addEventListener('click', () => closeModal(addMemberModal));
    
    // Auth tabs
    loginTabBtn.addEventListener('click', () => {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        loginTabBtn.classList.add('text-blue-600', 'border-b-2', 'border-blue-600');
        loginTabBtn.classList.remove('text-gray-500');
        registerTabBtn.classList.remove('text-blue-600', 'border-b-2', 'border-blue-600');
        registerTabBtn.classList.add('text-gray-500');
        hideAuthMessage();
    });

    registerTabBtn.addEventListener('click', () => {
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
        registerTabBtn.classList.add('text-blue-600', 'border-b-2', 'border-blue-600');
        registerTabBtn.classList.remove('text-gray-500');
        loginTabBtn.classList.remove('text-blue-600', 'border-b-2', 'border-blue-600');
        loginTabBtn.classList.add('text-gray-500');
        hideAuthMessage();
    });
}

// --- App Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    showLoading();
    initializeEventListeners();
    // Auth state will be checked by onAuthStateChanged, which will hide loading.
});
