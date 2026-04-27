/**
 * Reservation Calendar Logic for CLUB YATA
 * Capacity-Based Version
 */
document.addEventListener("DOMContentLoaded", () => {
    const calendarContainer = document.getElementById('reservation-calendar');
    const selectedDateInput = document.getElementById('selected-reservation-date');
    const calendarToggle = document.getElementById('calendar-toggle');
    const calendarModal = document.getElementById('calendar-modal');
    const closeCalendar = document.getElementById('close-calendar');
    
    if (!calendarContainer || !calendarToggle) return;

    let currentDate = new Date();
    let selectedDate = null;

    // --- Capacity Management Data ---
    // You can update these numbers manually as you receive bookings.
    // In a production environment, these would be fetched from a database.
    const dailyCapacity = {
        // Example: '2026-03-20': { booked: 10, max: 10 },
    };

    // Helper to format date as YYYY-MM-DD
    const formatDate = (date) => {
        const d = new Date(date);
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        const year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [year, month, day].join('-');
    };

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        const monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
            "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
        ];

        let html = `
            <div class="calendar-header flex justify-between items-center mb-6">
                <button id="prev-month" class="p-2 hover:text-[#d4af37] transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <div class="text-center">
                    <h3 class="text-lg tracking-[0.2em] font-light">${monthNames[month]} ${year}</h3>
                </div>
                <button id="next-month" class="p-2 hover:text-[#d4af37] transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
            </div>
            <div class="grid grid-cols-7 gap-1 mb-4">
                ${daysOfWeek.map(day => `<div class="text-[9px] text-white/40 tracking-widest text-center py-2">${day}</div>`).join('')}
            </div>
            <div class="grid grid-cols-7 gap-1">
        `;

        // Empty slots for previous month
        for (let i = 0; i < firstDayOfMonth; i++) {
            html += `<div class="aspect-square"></div>`;
        }

        // Days of current month
        const today = new Date();
        today.setHours(0,0,0,0);

        for (let day = 1; day <= daysInMonth; day++) {
            const dateObj = new Date(year, month, day);
            const dateStr = formatDate(dateObj);
            const isPast = dateObj < today;
            const isSelected = selectedDate === dateStr;
            const isSunday = dateObj.getDay() === 0;

            const capacity = dailyCapacity[dateStr] || { booked: 0, max: 10 };
            const occupancy = (capacity.booked / capacity.max) * 100;

            let statusClass = "available";
            let statusText = "OK";
            let statusColorClass = "text-[#d4af37]/60";
            let clickable = true;

            if (isPast) {
                statusClass = "past";
                statusText = "-";
                clickable = false;
            } else if (isSunday) {
                statusClass = "closed";
                statusText = "CLOSED";
                clickable = false;
                statusColorClass = "text-red-400";
            } else if (occupancy >= 100) {
                statusClass = "full";
                statusText = "FULL";
                clickable = false;
                statusColorClass = "text-red-400";
            } else if (occupancy >= 80) {
                statusClass = "limited";
                statusText = "FEW";
                statusColorClass = "text-orange-400";
            }

            html += `
                <div class="relative aspect-square flex flex-col items-center justify-center rounded-lg border border-white/5 transition-all duration-300 ${clickable ? 'cursor-pointer hover:bg-white/5 hover:border-[#d4af37]/30' : 'opacity-40'} ${isSelected ? 'bg-[#d4af37]/10 border-[#d4af37]!' : ''}" 
                     data-date="${dateStr}" ${clickable ? 'onclick="selectReservationDate(\'' + dateStr + '\')"' : ''}>
                    <span class="text-xs ${isSelected ? 'text-[#d4af37]' : 'text-white'}">${day}</span>
                    <span class="text-[7px] mt-1 ${isSelected ? 'text-[#d4af37]' : statusColorClass}">${statusText}</span>
                    ${isSelected ? '<div class="absolute inset-0 border border-[#d4af37] rounded-lg"></div>' : ''}
                </div>
            `;
        }

        html += `</div>`;
        calendarContainer.innerHTML = html;

        // Add event listeners for month navigation
        document.getElementById('prev-month').addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });
        document.getElementById('next-month').addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });
    };

    // Global function for onclick (simpler for dynamic content)
    window.selectReservationDate = (dateStr) => {
        selectedDate = dateStr;
        selectedDateInput.value = dateStr;
        calendarToggle.innerHTML = `<span>${dateStr}</span> <svg class="w-4 h-4 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>`;
        calendarToggle.classList.add('text-[#d4af37]');
        calendarToggle.classList.remove('text-white/40');
        
        // Close modal after selection
        gsap.to(calendarModal, { 
            opacity: 0, 
            scale: 0.95, 
            duration: 0.3, 
            onComplete: () => {
                calendarModal.classList.add('hidden');
            }
        });
        
        renderCalendar(); // Re-render to show selection
    };

    // Modal behavior
    calendarToggle.addEventListener('click', (e) => {
        e.preventDefault();
        calendarModal.classList.remove('hidden');
        gsap.fromTo(calendarModal, 
            { opacity: 0, scale: 0.95 }, 
            { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" }
        );
        renderCalendar();
    });

    closeCalendar.addEventListener('click', () => {
        gsap.to(calendarModal, { 
            opacity: 0, 
            scale: 0.95, 
            duration: 0.3, 
            onComplete: () => {
                calendarModal.classList.add('hidden');
            }
        });
    });

    // Close on outside click
    calendarModal.addEventListener('click', (e) => {
        if (e.target === calendarModal) {
            closeCalendar.click();
        }
    });
});
