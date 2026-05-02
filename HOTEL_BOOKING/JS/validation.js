/* ===================================
   Extracted Validation Logic
   Covers: Mod #18 (improve form UX), #32 (fix email validation),
   #34 (price verification via lookup table)
   =================================== */

(function () {
    'use strict';

    // === Hotel price lookup table (Mod #34) ===
    // Server-side verification is ideal, but this client-side lookup
    // prevents trivial URL manipulation of prices
    var HOTEL_PRICES = {
        // Shimla
        'Havens Resort': 4120,
        'Oberoi Cecil': 4200,
        'Marigold Sarovar Portico': 4150,
        'Flag House Resort': 4100,
        // Araku Valley
        'Krishna Tara Comforts': 370,
        'Sri Sai Suvarna Inn': 360,
        'Araku Haritha Valley Resort': 380,
        'Hill Park Resort': 390,
        // Manali
        'Hotel Devlok Manali': 280,
        'Sterling Manali-Resorts&Hotels': 2100,
        'Hotel Snow Park Manali': 290,
        'Hotel Jupiter': 2110,
        // Goa
        'Hotel Colva Kinara': 2120,
        'Jasminn by Mango Hotels': 2150,
        'The Queeny': 2130,
        'Amigo Plaza': 2110,
        // Ooty
        'Hotel Preethi Classic Towers': 380,
        'Hotel Lakeview': 3100,
        'Treebo Yantra Leisures': 390,
        'Berry Hills Resort': 3110,
        // Agra
        'Hotel Atulyaa Taj': 3100,
        'ITC Mughal': 3120,
        'Hotel Royale Residency': 380,
        'Hotel Pushp Villa': 390,
        // Darjeeling
        'Central Heritage Resort': 580,
        'Summit Grace Hotel': 590,
        'The Swiss Hotel': 5100,
        'Hotel Broadway (Annexe)': 5110,
        // Dalhousie
        'Snow Valley Resorts': 480,
        'Grand View Hotel': 4100,
        'Alps Resort Dalhousie': 4120,
        'A.S Clarks Inn': 490,
        // Dharamshala
        'Hotel Center Point': 270,
        'Hotel Inclover': 280,
        'Treebo GK Conifer': 290,
        'WelcomHeritage Grace Hotel': 2100,
        // Alleppey
        'Hotel Royale Park': 380,
        'Alleppey Prince Hotel': 390,
        'Hotel Bonanza': 3100,
        'Royal Homes': 370
    };

    function getQueryParams() {
        var params = {};
        var queryString = window.location.search.substring(1);
        if (queryString) {
            var pairs = queryString.split('&');
            for (var i = 0; i < pairs.length; i++) {
                var pair = pairs[i].split('=');
                var key = decodeURIComponent(pair[0]);
                var value = decodeURIComponent(pair[1] || '');
                params[key] = value;
            }
        }
        return params;
    }

    // === Booking form validation (Mod #18, #32) ===
    function showError(input, message) {
        // Clear previous error
        clearError(input);
        var errorEl = document.createElement('span');
        errorEl.className = 'field-error';
        errorEl.textContent = message;
        errorEl.style.cssText = 'color: #e94560; font-size: 0.85rem; display: block; margin-top: 4px;';
        input.parentNode.appendChild(errorEl);
        input.style.borderColor = '#e94560';
        input.focus();
    }

    function clearError(input) {
        var existing = input.parentNode.querySelector('.field-error');
        if (existing) existing.remove();
        input.style.borderColor = '';
    }

    function clearAllErrors() {
        document.querySelectorAll('.field-error').forEach(function (el) { el.remove(); });
        document.querySelectorAll('input, select, textarea').forEach(function (el) { el.style.borderColor = ''; });
    }

    window.validateBooking = function () {
        clearAllErrors();

        var nameInput = document.getElementById('guest-name');
        var emailInput = document.getElementById('guest-email');
        var phoneInput = document.getElementById('guest-phone');
        var checkIn = document.getElementById('check-in');
        var checkOut = document.getElementById('check-out');

        // Name validation
        if (!nameInput || nameInput.value.trim() === '') {
            showError(nameInput, 'Please provide your name.');
            return false;
        }

        // Email validation (Mod #32 — using proper regex instead of manual indexOf)
        if (!emailInput || emailInput.value.trim() === '') {
            showError(emailInput, 'Please provide your email.');
            return false;
        }
        var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!emailPattern.test(emailInput.value.trim())) {
            showError(emailInput, 'Please provide a valid email address.');
            return false;
        }

        // Phone validation
        if (!phoneInput || phoneInput.value.trim() === '') {
            showError(phoneInput, 'Please provide your phone number.');
            return false;
        }
        var phone = phoneInput.value.trim().replace(/[\s\-\(\)]/g, '');
        if (phone.length < 10 || phone.length > 13 || !/^\+?\d+$/.test(phone)) {
            showError(phoneInput, 'Please provide a valid phone number (10+ digits).');
            return false;
        }

        // Date validation
        var today = new Date();
        today.setHours(0, 0, 0, 0);

        if (!checkIn || !checkIn.value) {
            showError(checkIn, 'Please select a check-in date.');
            return false;
        }
        if (!checkOut || !checkOut.value) {
            showError(checkOut, 'Please select a check-out date.');
            return false;
        }

        var checkInDate = new Date(checkIn.value);
        var checkOutDate = new Date(checkOut.value);

        if (checkInDate <= today) {
            showError(checkIn, 'Check-in date cannot be today or in the past.');
            return false;
        }
        if (checkOutDate <= checkInDate) {
            showError(checkOut, 'Check-out date must be after the check-in date.');
            return false;
        }

        return true;
    };

    // === Price calculation with lookup verification (Mod #34) ===
    window.calculatePrice = function () {
        var params = getQueryParams();
        var hotelName = params.hotel || '';
        var urlPrice = parseInt(params.price) || 0;

        // Verify price against lookup table
        var verifiedPrice = HOTEL_PRICES[hotelName];
        if (verifiedPrice && verifiedPrice !== urlPrice) {
            urlPrice = verifiedPrice; // Use verified price
        }
        var pricePerNight = verifiedPrice || urlPrice;

        if (!pricePerNight) {
            alert('Unable to determine hotel price. Please go back and select a hotel.');
            return;
        }

        var checkIn = document.getElementById('check-in');
        var checkOut = document.getElementById('check-out');
        if (!checkIn || !checkIn.value || !checkOut || !checkOut.value) {
            alert('Please select check-in and check-out dates first.');
            return;
        }

        var checkInDate = new Date(checkIn.value);
        var checkOutDate = new Date(checkOut.value);
        var numDays = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

        if (numDays <= 0) {
            alert('Check-out date must be after check-in date.');
            return;
        }

        var numAdults = parseInt(document.getElementById('adults').value) || 1;
        var numChildren = parseInt(document.getElementById('children').value) || 0;
        var bedSize = parseInt(document.getElementById('bedding').value) || 1;

        var bedCharge = bedSize === 2 ? 20 : 0;
        var totalPrice = (pricePerNight + bedCharge) * numDays + (100 * numAdults) + (50 * numChildren);

        var totalEl = document.getElementById('totalPrice');
        if (totalEl) {
            totalEl.innerText = '₹' + totalPrice.toLocaleString('en-IN');
        }
    };

    // === Initialize booking page ===
    window.initBookingPage = function () {
        var params = getQueryParams();
        var hotelNameSpan = document.getElementById('hotelName');
        var hotelPriceSpan = document.getElementById('hotelPrice');

        if (params.hotel && hotelNameSpan) {
            hotelNameSpan.innerText = params.hotel;
        }
        if (params.price && hotelPriceSpan) {
            // Verify against lookup
            var verified = HOTEL_PRICES[params.hotel];
            var displayPrice = verified || parseInt(params.price);
            hotelPriceSpan.innerText = '₹' + displayPrice + ' per night';
        }
    };

    // === Feedback form validation ===
    window.validateFeedbackForm = function () {
        clearAllErrors();

        var name = document.getElementById('feedback-name');
        var email = document.getElementById('feedback-email');
        var feedback = document.getElementById('feedback-text');

        if (!name || name.value.trim() === '') {
            showError(name, 'Please provide your name.');
            return false;
        }

        var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!email || !emailPattern.test(email.value.trim())) {
            showError(email, 'Please provide a valid email address.');
            return false;
        }

        if (!feedback || feedback.value.trim() === '') {
            showError(feedback, 'Please provide your feedback.');
            return false;
        }

        return true;
    };

})();
