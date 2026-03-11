document.addEventListener("DOMContentLoaded", () => {
    // Initialize Lenis for smooth scrolling
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        touchMultiplier: 2,
        infinite: false,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Register GSAP ScrollTrigger
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0, 0);

        // Custom Cursor Logic
        const cursor = document.getElementById('cursor');
        const cursorFollower = document.getElementById('cursor-follower');

        if (window.innerWidth > 768 && cursor && cursorFollower) {
            gsap.set(cursor, { xPercent: -50, yPercent: -50 });
            gsap.set(cursorFollower, { xPercent: -50, yPercent: -50 });

            let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
            let followerX = window.innerWidth / 2, followerY = window.innerHeight / 2;

            window.addEventListener('mousemove', e => {
                mouseX = e.clientX;
                mouseY = e.clientY;
                gsap.to(cursor, { x: mouseX, y: mouseY, duration: 0.1, ease: "power2.out" });
            });

            gsap.ticker.add(() => {
                followerX += (mouseX - followerX) * 0.15;
                followerY += (mouseY - followerY) * 0.15;
                gsap.set(cursorFollower, { x: followerX, y: followerY });
            });

            const hoverTags = document.querySelectorAll('a, button, .menu-link, .accordion-header');
            hoverTags.forEach(tag => {
                tag.addEventListener('mouseenter', () => {
                    gsap.to(cursor, { scale: 3, opacity: 0.5, duration: 0.3 });
                    gsap.to(cursorFollower, { scale: 1.5, borderColor: 'transparent', backgroundColor: 'rgba(212, 175, 55, 0.2)', duration: 0.3 });
                });
                tag.addEventListener('mouseleave', () => {
                    gsap.to(cursor, { scale: 1, opacity: 1, duration: 0.3 });
                    gsap.to(cursorFollower, { scale: 1, borderColor: '#d4af37', backgroundColor: 'transparent', duration: 0.3 });
                });
            });
        }

        // --- Menu Overlay Logic ---
        const menuBtn = document.getElementById('menu-btn');
        const closeBtn = document.getElementById('close-menu-btn');
        const menuOverlay = document.getElementById('fullscreen-menu');
        const menuLinks = document.querySelectorAll('.menu-link');

        if (menuBtn && closeBtn && menuOverlay) {
            let menuTl = gsap.timeline({ paused: true });
            menuTl.to(menuOverlay, { opacity: 1, duration: 0.4, ease: "power2.inOut" })
                  .from(menuLinks, { x: 50, opacity: 0, stagger: 0.1, duration: 0.6, ease: "power3.out" }, "-=0.2");

            menuBtn.addEventListener('click', () => {
                menuOverlay.classList.add('active');
                menuTl.play();
                lenis.stop();
            });

            closeBtn.addEventListener('click', () => {
                menuTl.reverse().then(() => {
                    menuOverlay.classList.remove('active');
                    lenis.start();
                });
            });
        }

        // --- Global Load Animation ---
        const tl = gsap.timeline();
        
        tl.from("nav, #menu-btn", { y: -30, opacity: 0, duration: 1.2, ease: "power2.out", clearProps: "all" });
        
        if (document.querySelector("#hero-content > *") && !document.querySelector('.piano-bg')) {
            tl.from("#hero-content > *", { y: 30, opacity: 0, stagger: 0.2, duration: 1.2, ease: "power3.out" }, "-=0.8");
        } else if (document.querySelector("#hero-content p") && document.querySelector("#hero-content h1")) {
             tl.from("#hero-content p", { y: 30, opacity: 0, duration: 1.2, ease: "power3.out" }, "-=0.8")
               .from("#hero-content h1", { y: 20, opacity: 0, duration: 1.2, ease: "power3.out" }, "-=0.9");
        }
        
        if (document.querySelector(".vertical-text-container")) {
            tl.from(".vertical-text-container", { x: -20, opacity: 0, duration: 1, ease: "power2.out" }, "-=1");
        }
        
        // --- Page Specific Animations ---

        // 1. Index Page Background Parallax
        if (document.querySelector(".master-bg")) {
            gsap.to(".master-bg", {
                yPercent: 10,
                ease: "none",
                scrollTrigger: { trigger: "body", start: "top top", end: "bottom top", scrub: true }
            });
        }

        // 2. Floor Page Floral Parallax
        if (document.querySelector(".floral-bg")) {
            gsap.to('.floral-bg', {
                yPercent: -20,
                ease: "none",
                scrollTrigger: {
                    trigger: "body",
                    start: "top top",
                    end: "bottom top",
                    scrub: true
                }
            });
        }

        // 3. Image Parallax (floor, menu)
        const categoryCards = document.querySelectorAll('.category-card img, .capsule-img');
        if (categoryCards.length > 0) {
            categoryCards.forEach(img => {
                gsap.fromTo(img,
                    { scale: 1.15, yPercent: -10 },
                    {
                        scale: 1,
                        yPercent: 10,
                        ease: "none",
                        scrollTrigger: {
                            trigger: img.parentElement,
                            start: "top bottom",
                            end: "bottom top",
                            scrub: true
                        }
                    }
                );
            });
        }
        
        // 4. Performer Page Images Maples Parallax
        const maples = document.querySelectorAll('.leaf-decor');
        if (maples.length > 0) {
            maples.forEach(leaf => {
                const speed = leaf.getAttribute('data-speed') || 2;
                gsap.to(leaf, {
                    y: (i, target) => -100 * speed,
                    ease: "none",
                    scrollTrigger: {
                        trigger: leaf.parentElement,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: true
                    }
                });
            });
        }

        // 5. Accordions (Performer and Menu)
        const accordions = document.querySelectorAll('.accordion-header');
        if (accordions.length > 0) {
            accordions.forEach(acc => {
                acc.addEventListener('click', function () {
                    this.classList.toggle('active');
                    const content = this.nextElementSibling;
                    if (content.style.height) {
                        content.style.height = null;
                    } else {
                        content.style.height = content.scrollHeight + "px";
                    }
                });
            });
        }

        // 6. Fade Sections General
        const sections = document.querySelectorAll('.fade-section');
        if (sections.length > 0) {
            sections.forEach(section => {

                // If it is the index page with split layout text
                const textContent = section.querySelector('.text-content');
                const imgContainer = section.querySelector('.img-container');
                const bgNumber = section.querySelector('.section-number-bg');

                if (textContent || imgContainer || bgNumber) {
                    // Index page style
                    if (textContent) {
                        gsap.from(textContent.children, {
                            y: 40, opacity: 0, stagger: 0.15, duration: 1, ease: "power3.out",
                            scrollTrigger: { trigger: section, start: "top 75%" }
                        });
                    } else if (section.children.length > 0) {
                        gsap.from(section.children, {
                            y: 40, opacity: 0, stagger: 0.15, duration: 1, ease: "power3.out",
                            scrollTrigger: { trigger: section, start: "top 75%" }
                        });
                    }

                    if (imgContainer) {
                        const img = imgContainer.querySelector('img');
                        const imgMask = imgContainer.querySelector('.img-mask');
                        if (imgMask) {
                            gsap.from(imgMask, {
                                y: 60, opacity: 0, duration: 1.2, ease: "power3.out",
                                scrollTrigger: { trigger: section, start: "top 75%" }
                            });
                        }
                        if (img) {
                            gsap.fromTo(img,
                                { scale: 1.2, y: -20 },
                                {
                                    scale: 1, y: 20, ease: "none",
                                    scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: true }
                                }
                            );
                        }
                    }

                    if (bgNumber) {
                        gsap.fromTo(bgNumber,
                            { y: -100 },
                            { y: 100, ease: "none", scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: true } }
                        );
                    }
                } else {
                    // Standard floor / performer / menu style
                    gsap.from(section, {
                        y: 50,
                        opacity: 0,
                        duration: 1.2,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: section,
                            start: "top 80%",
                            end: "bottom 20%",
                            toggleActions: "play none none reverse"
                        }
                    });
                }
            });
        }
    }
});
