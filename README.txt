LI BUILT — NETLIFY DRAG-AND-DROP WEBSITE
========================================

DEPLOY IN UNDER 2 MINUTES
1. Log in to Netlify.
2. Open the Sites page.
3. Drag the ZIP file onto the Netlify deploy area.
4. Netlify will publish the website and activate the project-planner form automatically.

IMPORTANT BEFORE PUBLIC LAUNCH
The current brand name, phone, email, testimonials, company details and portfolio descriptions are polished placeholders because final company information was not supplied.

Search and replace these items in index.html:
- LI BUILT
- (516) 555-0147
- projects@libuilt.com
- License / insurance wording, if the company wants it displayed
- Nassau and Suffolk service areas
- Sample testimonials
- Sample portfolio imagery and project names
- Schema.org URL: https://example.com

IMAGES
- The hero image is bundled locally.
- Additional design-preview images load from Unsplash.
- Replace all sample project images with the construction company's actual completed work before launch. Original project photography will increase credibility and conversion.

NETLIFY FORMS
The multi-step consultation form is configured with:
- data-netlify="true"
- a hidden form-name field
- a spam honeypot
- a thank-you confirmation page

After the first production deployment, submit one test form. Then open Netlify > Forms to verify the submission and configure email notifications.

FILES
- index.html: complete website
- thank-you.html: confirmation page
- assets/css/styles.css: all visual design and responsive behavior
- assets/js/main.js: navigation, filters, modal, slider, planner, reviews and animation
- assets/images/hero.jpg: local hero image
- assets/images/favicon.svg: browser icon
- netlify.toml: security and cache headers
- _redirects: Netlify routing

DESIGN FEATURES INCLUDED
- Premium cinematic hero section
- Responsive mobile navigation
- Contractor comparison positioning
- Interactive services hover previews
- Filterable portfolio and project lightbox
- Before/after drag slider
- Four-step lead qualification form
- Netlify form handling
- Process and quality-control sections
- Long Island service-area map
- FAQ accordion
- Review carousel
- Search engine metadata and structured data
- Accessibility and reduced-motion support
- Mobile optimization

PHOTO CREDIT
The bundled hero image is from Alef Morais on Unsplash and is free to use under the Unsplash License.


FULL AUDIT UPDATE
- Hero changed to a real Long Island shingle-style home in Quogue.
- Portfolio cards now show specific Long Island city labels.
- Added four same-view before/after sliders: pool, bathroom, living area and basement.
- Added Long Island home-type expertise strip and mobile refinements.
- All forms remain configured for Netlify Forms.

AI VISUALIZER SETUP
===================
The website includes a working OpenAI-powered renovation visualizer.

After deploying to Netlify:
1. Open Site configuration > Environment variables.
2. Add OPENAI_API_KEY with your OpenAI project API key.
3. Optional: add OPENAI_IMAGE_MODEL. Default: gpt-image-1.5
4. Optional: add OPENAI_IMAGE_QUALITY. Default: medium
5. Trigger a new deploy after saving the environment variable.

Security:
- Never paste the API key into index.html or browser JavaScript.
- The key is read only by netlify/functions/visualize-space.mjs.
- Consider setting OpenAI project budget and rate limits before public launch.

The visualizer compresses uploaded images in the browser before sending them to the Netlify Function. Generated concepts are returned to the current browser session and are not stored by this website.
