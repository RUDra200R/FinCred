// Login and Register Opertion
async function performLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
            return true; // Login successful
        } else {
            const data = await response.json();
            alert(data.message); // Display error message
            return false; // Login failed
        }
    } catch (err) {
        console.error('Error:', err);
        return false; // Login failed
    }
}

async function performLogout() {
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
        });

        if (response.ok) {
            window.location.href = 'login.html';
            return true;
        } else {
            const data = await response.json();
            alert(data.message); // Display error message
            return false;
        }
    } catch (err) {
        console.error('Error:', err);
        return false;
    }
}

// Document ready event
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginlink = document.getElementById('loginlink');
    const logoutlink = document.getElementById('logoutlink');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const success = await performLogin();
            if (success) {
                window.location.href = 'home.html';
            }
        });
    }
    if (registerForm) {
                registerForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const name = document.getElementById('name').value;
                    const email = document.getElementById('email').value;
                    const jobProfile = document.getElementById('jobProfile').value;
                    const salary = document.getElementById('salary').value;
                    const password = document.getElementById('password').value;
        
                    try {
                        const response = await fetch('/api/auth/register', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ name, email, jobProfile, salary, password }),
                        });
        
                        const data = await response.json();
                        if (response.ok) {
                            alert(data.message);
                            window.location.href = 'login.html';
                        } else {
                            alert(data.message);
                        }
                    } catch (err) {
                        console.error('Error:', err);
                    }
                });
            }

    if (logoutlink) {
        logoutlink.addEventListener('click', async () => {
            const success = await performLogout();
        });
    }

 });
// End of login and register operation
// Budget Operation
document.getElementById('calculate-button').addEventListener('click', async function (e) {
    e.preventDefault(); // Prevent default button behavior

    const income = parseFloat(document.getElementById('income').value);
    const housing = parseFloat(document.getElementById('housing').value);
    const food = parseFloat(document.getElementById('food').value);
    const transportation = parseFloat(document.getElementById('transportation').value);
    const education = parseFloat(document.getElementById('education').value);
    const healthcare = parseFloat(document.getElementById('healthcare').value);
    const personal = parseFloat(document.getElementById('personal').value);
    const savings = parseFloat(document.getElementById('savings').value);

    try {
        const response = await fetch('/api/auth/budget', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ income, housing, food, transportation, education, healthcare, personal, savings })
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message);
            document.getElementById('totalIncome').innerText = income;
            document.getElementById('totalExpenses').innerText = data.totalExpenses;
            document.getElementById('remainingMoney').innerText = data.remainingMoney;
        } else {
            alert('Error calculating budget');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An unexpected error occurred');
    }
});


//End of Budget Operation

// contact operations
document.getElementById('contactForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const name = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const message = document.getElementById('message').value;

    try {
        const response = await fetch('/api/auth/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, phone, message }),
        });

        const data = await response.json();
        if (response.ok) {
            alert(data.message);
            window.location.href = 'contact.html';
        } else {
            alert(data.message);
        }
    } catch (err) {
        console.error('Error:', err);
        alert('An error occurred while submitting the form.');
    }
});
//End of contact operation


