
import Lenis from '@studio-freight/lenis'
import { gsap } from 'gsap';
import { preloader } from './preloader';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

// preload the images
preloader();

// All path elements in the page
const paths = [...document.querySelectorAll('path.path-anim')];

// Smooth scrolling initialization (using Lenis https://github.com/studio-freight/lenis)
const lenis = new Lenis({
    lerp: 0.1,
    smooth: true,
});
const scrollFn = () => {
    lenis.raf();
    requestAnimationFrame(scrollFn);
};
requestAnimationFrame(scrollFn);

// Animate the d attribute (path initial ) to the value in data-path-to;
// start when the top of its SVG reaches the bottom of the viewport and 
// end when the bottom of its SVG reaches the top of the viewport 
paths.forEach(el => {
    const svgEl = el.closest('svg');
    const pathTo = el.dataset.pathTo;

    gsap.timeline({
        scrollTrigger: {
            trigger: svgEl,
            start: "top bottom",
            end: "bottom top",
            scrub: true
        }
    })
        .to(el, {
            ease: 'none',
            attr: { d: pathTo }
        });
});

// --- Multibox Menu Logic (Phase 20) ---
{
    class Menu {
        constructor(el) {
            this.DOM = { el: el };
            this.DOM.openCtrl = document.querySelector('.action--menu');
            this.DOM.closeCtrl = document.querySelector('.action--close');

            // Initial animation setup
            this.DOM.items = document.querySelectorAll('.menu__item');
            this.itemsTotal = this.DOM.items.length;
            this.DOM.mainLinks = document.querySelectorAll('.mainmenu > a.mainmenu__item');
            this.DOM.sidemenuLinks = document.querySelectorAll('.sidemenu span.sidemenu__item-inner');
            this.DOM.menulink = document.querySelector('.menu__item-link');

            // Events
            this.DOM.openCtrl.addEventListener('click', () => this.open());
            this.DOM.closeCtrl.addEventListener('click', () => this.close());
        }

        open() {
            this.toggle('open');
        }

        close() {
            this.toggle('close');
        }

        toggle(action) {
            if (this.isAnimating) return;
            this.isAnimating = true;

            // Toggle class for pointer events
            this.DOM.el.classList[action === 'open' ? 'add' : 'remove']('menu--open');
            document.body.classList[action === 'open' ? 'add' : 'remove']('menu-is-open');

            const animationEnd = (pos) => {
                if (pos === this.itemsTotal - 1) {
                    this.isAnimating = false;
                }
            };

            // Animate Items
            this.DOM.items.forEach((el, pos) => {
                const innerEl = el.querySelector('.menu__item-inner');
                const direction = el.dataset.direction;

                // Config for Reveal Effect
                const config = {};
                const configInner = {};

                if (direction === 'bt') {
                    config.y = '101%'; configInner.y = '-101%'; configInner.x = '0%';
                } else if (direction === 'tb') {
                    config.y = '-101%'; configInner.y = '101%'; configInner.x = '0%';
                } else if (direction === 'lr') {
                    config.x = '-101%'; configInner.x = '101%';
                } else if (direction === 'rl') {
                    config.x = '101%'; configInner.x = '-101%';
                } else {
                    config.x = '101%'; config.y = '101%'; configInner.x = '-101%'; configInner.y = '-101%';
                }

                if (action === 'open') {
                    gsap.set(el, config);
                    gsap.set(innerEl, configInner);

                    gsap.to([el, innerEl], {
                        duration: 0.9,
                        ease: "quint.out",
                        x: '0%',
                        y: '0%',
                        onComplete: () => animationEnd(pos)
                    });
                } else {
                    gsap.to(el, {
                        duration: 0.6,
                        ease: "quart.inOut",
                        x: config.x || 0,
                        y: config.y || 0
                    });
                    gsap.to(innerEl, {
                        duration: 0.6,
                        ease: "quart.inOut",
                        x: configInner.x || 0,
                        y: configInner.y || 0,
                        onComplete: () => animationEnd(pos)
                    });
                }
            });

            // Animate Controls
            gsap.to(this.DOM.closeCtrl, {
                duration: 0.6,
                ease: action === 'open' ? "quint.out" : "quart.inOut",
                startAt: action === 'open' ? { rotation: 0 } : null,
                opacity: action === 'open' ? 1 : 0,
                rotation: action === 'open' ? 180 : 270
            });

            gsap.to(this.DOM.openCtrl, {
                duration: action === 'open' ? 0.6 : 0.3,
                delay: action === 'open' ? 0 : 0.3,
                ease: action === 'open' ? "quint.out" : "quad.out",
                opacity: action === 'open' ? 0 : 1
            });

            // Stagger Main Links
            gsap.to(this.DOM.mainLinks, {
                duration: action === 'open' ? 0.9 : 0.2,
                ease: action === 'open' ? "quint.out" : "quart.inOut",
                stagger: action === 'open' ? 0.1 : -0.1,
                startAt: action === 'open' ? { y: '50%', opacity: 0 } : null,
                y: action === 'open' ? '0%' : '50%',
                opacity: action === 'open' ? 1 : 0
            });

            // Stagger Side Links
            gsap.to(this.DOM.sidemenuLinks, {
                duration: action === 'open' ? 0.5 : 0.2,
                ease: action === 'open' ? "quint.inOut" : "quart.inOut",
                stagger: action === 'open' ? 0.05 : -0.05,
                startAt: action === 'open' ? { y: '100%' } : null,
                y: action === 'open' ? '0%' : '100%'
            });

            // CTA Link
            gsap.to(this.DOM.menulink, {
                duration: action === 'open' ? 0.9 : 0.6,
                ease: action === 'open' ? "quint.out" : "quart.inOut",
                startAt: action === 'open' ? { x: '10%' } : null,
                x: action === 'open' ? '0%' : '10%'
            });
        }
    }

    const menuEl = document.querySelector('nav.menu');
    if (menuEl) {
        new Menu(menuEl);
    }
}
