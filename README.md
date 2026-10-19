# WEBKD research website

A responsive, buildless HTML design for **Teaching Agents in Their Own Style: Black-Box Teacher Distillation for Web Agents** by Md Farhan Ishmam and Kenneth Marino.

Open **`design-explorer.html`** for the interactive design working document. Open `index.html` for the research page itself. Both work directly from the local folder. To use a local server:

```sh
python3 serve.py
```

Then visit `http://127.0.0.1:4186/`. No package installation or build step is required. Fonts load from Google Fonts, with local system fallbacks.

## Implemented direction

The saved explorer selection is now the default page, with no preview URL required:

- **Light mode — Field notes:** warm ivory `#F7F7EF`, ink `#252820`, olive `#D3DF81`.
- **Dark mode — After hours:** deep slate `#151C24`, light ink `#EFF4F7`, green `#B9E69A`.
- **Typography:** Manrope headings and body; IBM Plex Mono for code, labels, and data.
- **Layout:** full paper-title hero, quiet accents, compact spacing, sharp edges.
- **Content order:** idea → method → results → paper, with the detailed Manim animation and full loss explanations.

The header switch changes color mode and remembers the choice in this browser. First-time visitors follow their system preference; subsequent system changes are followed until the visitor makes an explicit selection. The mode initializes before the page paints. Embedded explorer previews use their palette's native light/dark appearance; full preview pages can switch modes without changing the main site's preference.

`site-design.js` records the approved settings. The matching HTML attributes and title in `index.html` provide the same layout before JavaScript runs. `site-theme.js` controls mode preference and accessible custom-accent colors; `site-theme.css` provides the paired colors and component treatments.

Open `design-explorer.html` directly for the dedicated working document with five workspaces:

1. **Playground:** six palettes, custom highlight color, four font systems, three hero layouts, accent treatments, spacing, edge styles, method visual, and reorderable content.
2. **Compare directions:** two complete site previews with a table of the settings that differ.
3. **Content & structure:** idea-first, evidence-first, and method-first routes, with recommended first-layer and deeper content.
4. **Motion & math:** the full Manim explanation, exact formula SVGs, and a numerical sandbox for span ranks, dead-zone shrinkage, and the rationale anchor.
5. **Decisions:** save named snapshots, record rationale and open questions, export/import the workspace as JSON, download a text brief, or print/save the decision document as PDF.

Explorer choices, notes, and snapshots stay in browser local storage. The **Open full preview** link encodes the selected configuration in the URL. Explorer settings affect previews without changing the approved default in `site-design.js`. The live preview uses a validated message bridge, so it also works when opened with `file://`.

Files: `design-explorer.html`, `design-explorer.css`, `design-explorer.js`, `design-preview.css`, and `design-preview.js`. The numerical sandbox uses clearly labeled synthetic values; it does not simulate actual model training.

## Content structure

1. **Title:** single desktop headline with the University of Utah wordmark immediately to its left, authors, and Paper / Code links.
2. **Overview:** concise method description and student / raw teacher / style-preserving correction examples.
3. **Method:** Manim explanation, four training stages, and an enlarged expandable equation reference. The full loss is inside the disclosure with the contribution scores, weight map, and anchor. Its equation and two concise term descriptions sit side by side on wide screens and stack on mobile.
4. **Experimental results:** separate panels for seen TimeWarp v6, unseen v1–v5, and OnlineMind2Web. TimeWarp model/version controls update charts with standard-error whiskers and complete data tables. OnlineMind2Web has model and difficulty controls, mean/standard-error bars, and a complete table using the author-supplied numerical values. The original figure remains linked for reference.
5. **Paper and citation:** canonical arXiv link and copyable BibTeX with the arXiv identifier, year, and subject class.

The presentation uses academic labels, without slogans, headline metric cards, or a standalone loss banner. `paper-layout.css` controls the revised hierarchy. `results-data.js` stores the transcribed source values; `results.js` and `results.css` render the benchmark panels.

## Manim animation

The method section includes a roughly 67-second, silent 1080p Manim explanation with chapter controls, a rich static poster, and a written explanation. It covers original student contexts, the perplexity premium (Eq. 2), leave-one-out action information (Eq. 4), a qualitative explanation of contribution weighting, and the complete normalized loss and role-asymmetric pointwise KL surrogate (Eq. 5). The muted film autoplays when it enters the viewport and pauses when it leaves. Manual pauses are respected. The Speed button offers 0.5×, 0.75×, 1×, 1.25×, 1.5×, and 2× playback.

The premium scene uses same-color bars whose lengths show low / high / low schematic surprisal. The separate rank-weight slide is merged into the contribution explanation without rank equations; the exact weight map remains available in the expandable equation reference. The loss scene separates the indexed equation, its two terms, and the reasoning/decision role descriptions with consistent spacing. Playback controls are in `site-video.js` and `video-controls.css`.

The original 22-second overview remains available as an explorer option at `assets/webkd-overview.mp4`. Full math, caveats, chapter timings, and rendering instructions are in `animations/README.md`. Reusable equation SVGs live in `assets/formulas/`; the website's expandable formula explanation is styled by `loss-explainer.css`.

- Video: `assets/webkd-method.mp4`
- Static diagram: `assets/webkd-method-poster.png`
- Editable source: `animations/webkd_method.py`
- Pinned Python dependency: `animations/requirements.txt`

With [Manim Community and its native dependencies installed](https://docs.manim.community/en/stable/installation.html), render from the repository root:

```sh
python -m manim -qh --fps 30 --media_dir /tmp/webkd-manim animations/webkd_method.py WebKDMethod
python -m manim -qh -s --media_dir /tmp/webkd-manim animations/webkd_method.py WebKDPoster
```

Copy the output MP4 and PNG into the asset paths above. No LaTeX is required. The rendered animation uses Helvetica Neue and Georgia; these can be changed in the source to match fonts installed on the rendering host.

## Source and content notes

The supplied preprint is copied to `assets/webkd-paper.pdf`. TimeWarp values are transcribed from Table 1 (p. 7): 144 mean/standard-error pairs across three students, eight methods, and six versions. OnlineMind2Web uses 56 mean/standard-error pairs supplied by the author on October 14, 2026, covering two students, seven methods, and four difficulty/overall groups. Values are stored as fractions and displayed as percentages; difficulty rates refer to each subset. Overall results and their standard errors are used as supplied, without reconstructing them from subset results. The original Figure 4 (p. 8) remains available for reference. Means and standard errors are over three runs. No Gemma results are inferred. Two Qwen 4B overall means (Takeover and Re-style) currently disagree with the weighted difficulty means; the supplied table values are retained verbatim.

The browser correction example is explicitly illustrative and adapted from Figure 1. It is not a recorded or live agent session. Paper links use [arXiv:2610.19834](https://arxiv.org/abs/2610.19834). The BibTeX follows the arXiv title and metadata (2026, cs.AI). The footer contains the webkd home link, followed by Paper and Code links. The hero and footer Code links point to the user-provided [WEBKD repository](https://github.com/sparklabutah/webkd).

The University of Utah wordmark comes from the [official university website asset](https://templates.utah.edu/_main-v3-1/images/template/university-of-utah-logo.svg). The dark version preserves the asset; the light version changes its white lettering to black and retains the red mark.

The site is a buildless static site. Serve it locally with `python3 serve.py`, or serve the repository root with static hosting. The navigation’s “Read the paper” link opens the canonical arXiv page directly.
