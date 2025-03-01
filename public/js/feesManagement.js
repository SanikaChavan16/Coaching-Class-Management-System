// document.addEventListener('DOMContentLoaded', () => {
//     document.querySelectorAll('.update-btn').forEach(button => {
//         button.addEventListener('click', async () => {
//             const id = button.dataset.id;
//             const paidFees = document.querySelector(`.paidFees[data-id='${id}']`).value;
//             const response = await fetch(`/students/update-fees/${id}`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ paidFees })
//             });
//             const data = await response.json();
//             if (data.success) window.location.reload();
//         });
//     });

//     document.getElementById('reminderForm').addEventListener('submit', async (e) => {
//         e.preventDefault();
//         const reminderDate = document.getElementById('reminderDate').value;
//         const reminderTime = document.getElementById('reminderTime').value;
//         const response = await fetch('/students/schedule-reminder', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ reminderDate, reminderTime })
//         });
//         if ((await response.json()).success) alert('Reminder scheduled!');
//     });
// });


document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.update-btn').forEach(button => {
        button.addEventListener('click', async () => {
            const id = button.dataset.id;
            const paidFeesInput = document.querySelector(`.paidFees[data-id='${id}']`);
            const paidFees = parseFloat(paidFeesInput.value);

            if (isNaN(paidFees) || paidFees < 0) {
                alert('Please enter a valid amount.');
                return;
            }

            try {
                const response = await fetch(`/students/update-fees/${id}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ paidFees })
                });
                
                const data = await response.json();
                if (data.success) {
                    // Update remaining fees dynamically
                    const remainingFeesCell = paidFeesInput.closest('tr').querySelector('td:nth-child(5)');
                    remainingFeesCell.textContent = `₹${data.remainingFees}`;
                    alert('Fees updated successfully!');
                } else {
                    alert('Failed to update fees. Please try again.');
                }
            } catch (error) {
                console.error('Error updating fees:', error);
                alert('An error occurred while updating fees.');
            }
        });
    });

    document.getElementById('reminderForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const reminderDate = document.getElementById('reminderDate').value;
        const reminderTime = document.getElementById('reminderTime').value;
        
        try {
            const response = await fetch('/students/schedule-reminder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reminderDate, reminderTime })
            });
            
            if ((await response.json()).success) {
                alert('Reminder scheduled successfully!');
            } else {
                alert('Failed to schedule reminder. Please try again.');
            }
        } catch (error) {
            console.error('Error scheduling reminder:', error);
            alert('An error occurred while scheduling the reminder.');
        }
    });
});

