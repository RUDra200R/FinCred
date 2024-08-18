
//profile data
// Fetch and display profile data
document.getElementById('profileButton').addEventListener('click', async function(event) {
    event.preventDefault(); // Prevent default button action

    try {
        const response = await fetch('/api/auth/profile', {
            method: 'GET',
            credentials: 'include' // Ensure cookies are sent with the request
        });

        if (response.ok) {
            const data = await response.json();
            document.getElementById('name').textContent = data.name || 'N/A';
            document.getElementById('jobProfile').textContent = data.jobProfile || 'N/A';
            document.getElementById('email').textContent = data.email || 'N/A';
            document.getElementById('salary').textContent = data.salary || 'N/A';
            document.getElementById('profilePopup').classList.add('active');
        } else {
            console.error('Failed to fetch profile data:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching profile data:', error);
    }
});

// Close profile popup when clicking outside
document.addEventListener('click', function(event) {
    const profilePopup = document.getElementById('profilePopup');
    if (!profilePopup.contains(event.target)) {
        profilePopup.classList.remove('active');
    }
});

document.getElementById('logoutButton').addEventListener('click', async function() {
try {
    const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include' // Ensure cookies are sent with the request
    });

    if (response.ok) {
        window.location.href = 'login.html'; // Redirect to login page
    } else {
        const data = await response.json();
        alert(data.message); // Display error message
    }
} catch (err) {
    console.error('Error logging out:', err);
}
});

// delete operation 
document.getElementById('deleteButton').addEventListener('click', async function() {
    const confirmation = confirm('Are you sure you want to delete your account?');
    if (!confirmation) return;

    try {
        const response = await fetch('/api/auth/delete', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`, // Assuming you use a token
            }
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('deleteSuccessMessage', data.message);
            localStorage.removeItem('token'); // Log out by removing token
            window.location.href = 'login.html'; // Redirect to login page
        } else {
            const data = await response.json();
            alert(data.message); // Display error message
        }
    } catch (err) {
        console.error('Error deleting account:', err);
        alert('An error occurred while trying to delete your account. Please try again later.');
    }
});