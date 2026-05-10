document.addEventListener('DOMContentLoaded', () => {

    // Reveal Animations on Scroll
    const reveals = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    reveals.forEach(el => revealObserver.observe(el));

    // Smooth Scroll for Navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                const headerOffset = 100;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Sticky Header Scroll Effect
    const header = document.querySelector('.nav-bar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.height = '70px';
            header.style.boxShadow = '0 10px 30px rgba(0,0,0,0.05)';
        } else {
            header.style.height = '80px';
            header.style.boxShadow = 'none';
        }
    });
});

// Tab Content Data
const suiteData = {
    recruit: {
        title: "Recruit Dashboard",
        desc: "The mission control for your hiring team. Manage thousands of applications, automate communications, and generate deep-dive performance reports instantly.",
        features: ["Automated Pipeline Management", "Built-in Offer Letter Engine", "Advanced Export & Analytics"],
        img: "./src/images/app_recruit.png"
    },
    candidate: {
        title: "Candidate Portal",
        desc: "A premium, mobile-first experience that treats candidates like customers. Multi-step profiles, real-time tracking, and zero-friction applications.",
        features: ["Native-Level Mobile UX", "Interactive Status Timeline", "One-Click Documentation"],
        img: "./src/images/app_candidate.png"
    },
    share: {
        title: "Share Portal",
        desc: "Collaborative hiring made professional. Securely share read-only candidate snapshots with stakeholders. No more messy email attachments.",
        features: ["Secure Token Links", "Inline Document Preview", "Feedback Collection Bridge"],
        img: "./src/images/app_share.png"
    },
    dialer: {
        title: "Remote Dialer",
        desc: "Bridge the desktop-mobile gap. Trigger calls on your smartphone directly from your recruitment dashboard via a secure QR bridge.",
        features: ["Instant QR-Handshake", "Real-Time Sync Protocol", "Call Outcome Logging"],
        img: "./src/images/app_dailer.png"
    }
};

function switchTab(tabKey) {
    const data = suiteData[tabKey];
    if (!data) return;

    // Update Buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick').includes(tabKey)) {
            btn.classList.add('active');
        }
    });

    // Animate Content Out
    const content = document.getElementById('tab-content');
    content.style.opacity = '0';
    content.style.transform = 'translateY(10px)';

    setTimeout(() => {
        // Update Text & List
        document.getElementById('tab-title').innerText = data.title;
        document.getElementById('tab-desc').innerText = data.desc;
        document.getElementById('tab-img').src = data.img;

        const featuresList = document.getElementById('tab-features');
        featuresList.innerHTML = data.features.map(f => `
            <li style="display: flex; align-items: center; gap: 1rem; font-weight: 600; font-size: 0.95rem;">
                <i class="fas fa-check-circle" style="color: var(--primary);"></i> ${f}
            </li>
        `).join('');

        // Animate Content In
        content.style.opacity = '1';
        content.style.transform = 'translateY(0)';
    }, 250);
}

async function payNow(planName, amount) {
    try {
        // STEP 1: Create Order on the Backend
        const orderResponse = await fetch('/api/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: amount * 100, // paise
                currency: 'INR',
                receipt: `receipt_${planName.toLowerCase()}_${Date.now()}`
            })
        });

        const contentType = orderResponse.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const text = await orderResponse.text();
            console.error('Non-JSON response received:', text);
            throw new Error(`Server returned non-JSON response (${orderResponse.status}). Please check Vercel logs.`);
        }

        const orderData = await orderResponse.json();

        if (!orderResponse.ok) {
            throw new Error(orderData.error || 'Failed to create order');
        }

        // STEP 2: Open Razorpay Checkout Modal
        const options = {
            "key": "rzp_live_SnoRpxeRfQ16QA", // Live Public Key ID
            "amount": orderData.amount,
            "currency": orderData.currency,
            "name": "NextgenUdaan",
            "description": `Subscription for ${planName} Plan`,
            "image": "./src/images/favicon.png",
            "order_id": orderData.order_id,
            "handler": async function (response) {
                // STEP 3: Verify Payment Signature on the Backend
                const verifyResponse = await fetch('/api/verify-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature
                    })
                });

                const verifyData = await verifyResponse.json();

                if (verifyData.success) {
                    // Redirect to Success Page
                    window.location.href = `success.html?order_id=${response.razorpay_order_id}`;
                } else {
                    alert('Payment verification failed: ' + verifyData.message);
                }
            },
            "prefill": {
                "name": "",
                "email": "",
                "contact": ""
            },
            "theme": {
                "color": "#0f172a"
            },
            "modal": {
                "ondismiss": function () {
                    console.log('Checkout modal closed by user');
                }
            }
        };

        const rzp1 = new Razorpay(options);
        rzp1.on('payment.failed', function (response) {
            alert(`Payment Failed: ${response.error.description}`);
        });
        rzp1.open();

    } catch (error) {
        console.error('Checkout Error:', error);
        alert('An error occurred during checkout: ' + error.message);
    }
}
