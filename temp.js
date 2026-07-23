
        document.addEventListener("DOMContentLoaded", (event) => {
            if (typeof gsap !== 'undefined') {
                gsap.registerPlugin(ScrollTrigger);

                // Initial Load
                gsap.from(".gs-anim", { y: -50, opacity: 0, duration: 1, ease: "power3.out" });
                gsap.from(".gs-anim-up", { y: 50, opacity: 0, duration: 1, delay: 0.2, ease: "power3.out" });
                gsap.from(".gs-anim-in", { x: 50, opacity: 0, duration: 1.5, delay: 0.4, ease: "power3.out" });

                // (Hero Image Slider Removed)

                // Stats Counters
                ScrollTrigger.create({
                    trigger: ".gs-stats",
                    start: "top 85%",
                    onEnter: () => {
                        const counters = document.querySelectorAll('.gs-counter');
                        counters.forEach(counter => {
                            const target = +counter.getAttribute('data-target');
                            gsap.to(counter, { innerHTML: target, duration: 2.5, snap: { innerHTML: 1 }, ease: "power2.out" });
                        });
                    },
                    once: true
                });

                // Scroll Up Elements
                const upElements = document.querySelectorAll('.gs-scroll-up');
                upElements.forEach(el => {
                    gsap.from(el, { scrollTrigger: { trigger: el, start: "top 85%" }, y: 40, opacity: 0, duration: 1, ease: "power3.out" });
                });

                // Staggered Grids
                const staggerGroups = document.querySelectorAll('.gs-stagger');
                staggerGroups.forEach(group => {
                    gsap.from(group.children, { scrollTrigger: { trigger: group, start: "top 80%" }, y: 40, opacity: 0, duration: 0.8, stagger: 0.15, ease: "power3.out" });
                });

                // Scale In
                const scaleElements = document.querySelectorAll('.gs-scale-in');
                scaleElements.forEach(el => {
                    gsap.from(el, { scrollTrigger: { trigger: el, start: "top 85%" }, scale: 0.8, opacity: 0, duration: 1.2, ease: "power3.out" });
                });

                // Slide Left
                const leftElements = document.querySelectorAll('.gs-slide-left');
                leftElements.forEach(el => {
                    gsap.from(el, { scrollTrigger: { trigger: el, start: "top 85%" }, x: -100, opacity: 0, duration: 1, ease: "power3.out" });
                });

                // Slide Right
                const rightElements = document.querySelectorAll('.gs-slide-right');
                rightElements.forEach(el => {
                    gsap.from(el, { scrollTrigger: { trigger: el, start: "top 85%" }, x: 100, opacity: 0, duration: 1, ease: "power3.out" });
                });
            }
        });
    