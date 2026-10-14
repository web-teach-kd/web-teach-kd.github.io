"""WEBKD method film — Manim Community, no LaTeX required.

Render from the repository root (Manim Community 0.22):
    python -m manim -qh --fps 30 --media_dir /tmp/webkd-manim \
        animations/webkd_method.py WebKDMethod
Copy the rendered WebKDMethod.mp4 to assets/webkd-method.mp4. Render the
all-stage poster separately with the same command plus -s and WebKDPoster.
Copy its PNG output to assets/webkd-method-poster.png. For browser streaming,
remux the film with ffmpeg using -c copy -movflags +faststart.

All response bars are schematic. This animation contains no measured values.
The original student contexts stay fixed: suffix responses are independently
edited at those contexts, not rolled forward from earlier corrected actions.
"""
from manim import *

CREAM = "#F7F7EF"
INK = "#252820"
MUTED = "#7A7E70"
LINE = "#D8DCD0"
OLIVE = "#D3DF81"
DEEP = "#536724"
PANEL = "#EFEFE5"
ERROR = "#AB624C"
WHITE_PAPER = "#FEFEF9"
SANS = "Helvetica Neue"
SERIF = "Georgia"


def label(text, size=22, color=INK, font=SANS, weight=NORMAL):
    return Text(text, font=font, font_size=size, color=color, weight=weight)


def response_card(x, index, edited=False):
    """Repeated line lengths represent the student's retained writing format."""
    outline = RoundedRectangle(width=2.58, height=1.70, corner_radius=.12,
                               stroke_color=DEEP if edited else LINE,
                               stroke_width=1.5,
                               fill_color=WHITE_PAPER, fill_opacity=1)
    outline.move_to([x, -.70, 0])
    caption = label(f"response {index}" + (" / edited" if edited else ""),
                    16, DEEP if edited else MUTED)
    caption.move_to([x, -.08, 0])
    rows = VGroup()
    for i, (name, width) in enumerate((("think", 1.37), ("plan", 1.10),
                                      ("step", .28), ("memory", 1.24), ("action", .91))):
        y = -.40 - i * .22
        tag = label(name, 13, MUTED).move_to([x - .79, y, 0])
        bar = RoundedRectangle(width=width, height=.07 if i < 4 else .12,
                               corner_radius=.035,
                               stroke_width=0,
                               fill_color=(DEEP if edited and i == 4 else
                                           OLIVE if edited else LINE),
                               fill_opacity=1)
        bar.move_to([x - .29 + width / 2, y, 0])
        rows.add(tag, bar)
    return VGroup(outline, caption, rows)


class WebKDOverview(Scene):
    def construct(self):
        self.camera.background_color = CREAM
        top = label("WEBKD  /  THE TEACHER AS EDITOR", 16, DEEP, weight=MEDIUM)
        top.to_corner(UL, buff=.55)
        concept = label("CONCEPTUAL METHOD", 14, MUTED).to_corner(UR, buff=.55)
        rule = Line([-6.55, 3.05, 0], [6.55, 3.05, 0], color=LINE, stroke_width=1)
        self.add(top, concept, rule)

        steps = ["01  STUDENT ROLLOUT", "02  LOCALIZE", "03  EDIT", "04  TRAIN"]
        step_labels = VGroup(*[label(s, 16, MUTED) for s in steps])
        step_labels.arrange(RIGHT, buff=.85).move_to([0, -3.35, 0])
        self.add(step_labels)
        progress = Line([-6.55, -2.96, 0], [-3.275, -2.96, 0],
                        color=DEEP, stroke_width=3)
        self.add(Line([-6.55, -2.96, 0], [6.55, -2.96, 0], color=LINE, stroke_width=1))
        self.add(progress)
        step_labels[0].set_color(DEEP)

        def heading(text, sub):
            title = label(text, 36, font=SERIF)
            if title.width > 12.7:
                title.scale_to_fit_width(12.7)
            title.move_to([0, 2.38, 0])
            subtitle = label(sub, 20, MUTED).move_to([0, 1.77, 0])
            return VGroup(title, subtitle)

        def advance(index):
            animations = [progress.animate.put_start_and_end_on(
                [-6.55, -2.96, 0], [-6.55 + (index + 1) * 3.275, -2.96, 0])]
            for j, item in enumerate(step_labels):
                animations.append(item.animate.set_color(DEEP if j == index else MUTED))
            return animations

        title = heading("Start where the student went.",
                        "Collect a failed rollout from the behavior-cloned student.")
        self.play(FadeIn(title, shift=UP * .12), run_time=.7)
        xs = [-4.80, -1.60, 1.60, 4.80]
        states, cards, connections = VGroup(), VGroup(), VGroup()
        for i, x in enumerate(xs):
            state = VGroup(Circle(radius=.34, stroke_color=INK, stroke_width=1.5,
                                  fill_color=CREAM, fill_opacity=1),
                           label(f"s{i + 1}", 22))
            state.move_to([x, .75, 0])
            states.add(state)
            cards.add(response_card(x, i + 1))
            connections.add(Line([x, .41, 0], [x, .15, 0], color=LINE, stroke_width=1.5))
            if i < 3:
                connections.add(Arrow([x + .45, .75, 0], [xs[i + 1] - .45, .75, 0],
                                      buff=0, color=MUTED, stroke_width=1.5,
                                      max_tip_length_to_length_ratio=.05))
        footer = label("Original student contexts and structured responses", 19, MUTED)
        footer.move_to([0, -2.15, 0])
        self.play(LaggedStart(*[FadeIn(VGroup(states[i], cards[i]), shift=RIGHT*.12)
                               for i in range(4)], lag_ratio=.25),
                  Create(connections), FadeIn(footer), run_time=1.8)
        self.wait(1.8)

        next_title = heading("Find the first mistake.",
                             "The teacher localizes the earliest erroneous step.")
        self.play(Transform(title, next_title), *advance(1), FadeOut(footer), run_time=.8)
        error_ring = Circle(radius=.44, stroke_color=ERROR, stroke_width=3).move_to(states[2])
        error_tag = label("first error", 17, ERROR).move_to([1.60, 1.36, 0])
        prefix_line = Line([-6.09, -1.86, 0], [-.31, -1.86, 0], color=MUTED, stroke_width=2)
        suffix_line = Line([.31, -1.86, 0], [6.09, -1.86, 0], color=ERROR, stroke_width=2)
        prefix_tag = label("Preserve the correct prefix", 20, MUTED).move_to([-3.2, -2.18, 0])
        suffix_tag = label("Rewrite the faulty suffix", 20, ERROR).move_to([3.2, -2.18, 0])
        split = VGroup(prefix_line, suffix_line, prefix_tag, suffix_tag)
        self.play(Create(error_ring), FadeIn(error_tag), FadeIn(split),
                  cards[2][0].animate.set_stroke(ERROR), run_time=.7)
        self.wait(1.8)

        next_title = heading("Better corrections. Familiar voice.",
                             "One independent teacher edit at each original student context.")
        self.play(Transform(title, next_title), *advance(2),
                  FadeOut(error_ring), FadeOut(error_tag), FadeOut(split), run_time=.8)
        edit_arrows = VGroup(*[Arrow([x, .33, 0], [x, .13, 0], buff=0,
                                    color=DEEP, stroke_width=3,
                                    max_tip_length_to_length_ratio=.30) for x in xs[2:]])
        retained = label("prefix kept verbatim", 19, MUTED).move_to([-3.2, -1.97, 0])
        edit_note = label("student style + teacher decisions", 19, DEEP).move_to([3.2, -1.97, 0])
        context_note = label("Contexts stay fixed. Each response is corrected independently.", 18, MUTED)
        context_note.move_to([0, -2.50, 0])
        self.play(Create(edit_arrows), FadeIn(retained), run_time=.6)
        self.play(Transform(cards[2], response_card(xs[2], 3, edited=True)),
                  Transform(cards[3], response_card(xs[3], 4, edited=True)),
                  FadeIn(edit_note), run_time=1.2)
        self.play(FadeIn(context_note), run_time=.5)
        self.wait(2.5)
        timeline = VGroup(states, cards, connections, edit_arrows, retained, edit_note, context_note)

        next_title = heading("Teach the decision. Preserve the voice.",
                             "A training objective that pays attention to what changes the action.")
        self.play(FadeOut(timeline), Transform(title, next_title), *advance(3), run_time=.7)

        left = RoundedRectangle(width=6.1, height=3.35, corner_radius=.16,
                                stroke_color=LINE, stroke_width=1.3,
                                fill_color=WHITE_PAPER, fill_opacity=1).move_to([-3.22, -.55, 0])
        right = left.copy().move_to([3.22, -.55, 0])
        left_tag = label("01 / ACTION-INFORMATIVE WEIGHTS", 15, DEEP).move_to([-3.22, .65, 0])
        right_tag = label("02 / RATIONALE ANCHOR", 15, DEEP).move_to([3.22, .65, 0])
        left_title = label("Weight useful reasoning", 26, font=SERIF).move_to([-3.22, .03, 0])
        right_title = label("Keep the student's voice", 26, font=SERIF).move_to([3.22, .03, 0])
        bars = VGroup()
        for i, (width, opacity) in enumerate(((1.25, .25), (2.5, 1), (1.9, .60))):
            bar = RoundedRectangle(width=width, height=.16, corner_radius=.07,
                                   stroke_width=0, fill_color=DEEP, fill_opacity=opacity)
            bar.move_to([-4.64 + width / 2, -.55 - .32 * i, 0])
            bars.add(bar)
        left_text = label("More signal for spans that\nhelp predict the corrected action.", 19, MUTED)
        left_text.move_to([-3.22, -1.64, 0])
        anchor_circle = Circle(radius=.37, color=DEEP, stroke_width=2).move_to([2.10, -.80, 0])
        anchor_dot = Dot([2.10, -.80, 0], radius=.06, color=DEEP)
        anchor_line = Line([2.47, -.80, 0], [3.80, -.80, 0], color=DEEP, stroke_width=2)
        action_arrow = Arrow([3.80, -.80, 0], [4.70, -.80, 0], buff=0, color=DEEP,
                             stroke_width=2, max_tip_length_to_length_ratio=.12)
        right_text = label("Anchor the rationale to the prior.\nLet the corrected action move freely.", 19, MUTED)
        right_text.move_to([3.22, -1.64, 0])
        objective = VGroup(left, right, left_tag, right_tag, left_title, right_title,
                           bars, left_text, anchor_circle, anchor_dot, anchor_line, action_arrow, right_text)
        self.play(FadeIn(VGroup(left, right, left_tag, right_tag, left_title, right_title)), run_time=.7)
        self.play(LaggedStart(*[GrowFromEdge(b, LEFT) for b in bars], lag_ratio=.18),
                  Create(VGroup(anchor_circle, anchor_dot, anchor_line, action_arrow)),
                  FadeIn(left_text), FadeIn(right_text), run_time=1.0)
        self.wait(2.4)
        self.play(FadeOut(objective), FadeOut(title), run_time=.65)

        final_title = label("Better decisions.\nStill their own voice.", 47, font=SERIF)
        final_title.move_to([0, .62, 0])
        accent = Line([-1.15, -1.12, 0], [1.15, -1.12, 0], color=DEEP, stroke_width=3)
        final_sub = label("Black-box teacher distillation, through text alone.", 23, MUTED)
        final_sub.move_to([0, -1.72, 0])
        self.play(FadeIn(final_title, shift=UP * .16), Create(accent), FadeIn(final_sub), run_time=.8)
        self.wait(2.6)


class WebKDOverviewPoster(Scene):
    """Static all-stage fallback. Render with: manim -qh -s ... WebKDPoster"""
    def construct(self):
        self.camera.background_color = CREAM
        eyebrow = label("WEBKD  /  THE TEACHER AS EDITOR", 16, DEEP, weight=MEDIUM)
        eyebrow.to_corner(UL, buff=.55)
        concept = label("CONCEPTUAL METHOD", 14, MUTED).to_corner(UR, buff=.55)
        title = label("Better decisions. Still their own voice.", 37, font=SERIF)
        title.move_to([0, 2.43, 0])
        subtitle = label("Student rollout  /  Localize the mistake  /  Edit independently  /  Train", 20, MUTED)
        subtitle.move_to([0, 1.81, 0])
        self.add(eyebrow, concept, title, subtitle,
                 Line([-6.55, 3.05, 0], [6.55, 3.05, 0], color=LINE, stroke_width=1))
        xs = [-4.8, -1.6, 1.6, 4.8]
        for i, x in enumerate(xs):
            state = VGroup(Circle(radius=.34, stroke_color=INK, stroke_width=1.5,
                                  fill_color=CREAM, fill_opacity=1), label(f"s{i + 1}", 22))
            state.move_to([x, .75, 0])
            self.add(state, response_card(x, i + 1, edited=i > 1))
            self.add(Arrow([x, .34, 0], [x, .13, 0], buff=0,
                           color=DEEP if i > 1 else LINE, stroke_width=2,
                           max_tip_length_to_length_ratio=.30))
            if i < 3:
                self.add(Arrow([x + .45, .75, 0], [xs[i + 1] - .45, .75, 0],
                               buff=0, color=MUTED, stroke_width=1.5,
                               max_tip_length_to_length_ratio=.05))
        self.add(Circle(radius=.44, stroke_color=ERROR, stroke_width=2).move_to([1.6, .75, 0]))
        self.add(label("first error", 17, ERROR).move_to([1.6, 1.36, 0]))
        self.add(label("Preserve the prefix", 20, MUTED).move_to([-3.2, -1.92, 0]))
        self.add(label("Edit in the student's style", 20, DEEP).move_to([3.2, -1.92, 0]))
        self.add(label("Original student contexts stay fixed; suffix responses are corrected independently.",
                       18, MUTED).move_to([0, -2.42, 0]))
        self.add(Line([-6.55, -2.96, 0], [6.55, -2.96, 0], color=LINE, stroke_width=1))
        self.add(label("TRAIN  /  Action-informative weights  +  Rationale anchor", 21, DEEP)
                 .move_to([0, -3.36, 0]))

# The detailed explainer uses Matplotlib's mathtext to create vector equations.
# This keeps both the editable source and website formula assets independent of TeX.
from pathlib import Path
import json
import re
import matplotlib
matplotlib.use("Agg")
from matplotlib import mathtext, font_manager

FORMULA_DIR = Path(__file__).resolve().parents[1] / "assets" / "formulas"
FORMULAS = {
    "premium": r"\Pi(y^*,y)=\frac{1}{|y^*|}\sum_i-\log\pi_{\mathrm{BC}}(y_i^*\mid h,y_{<i}^*)-\frac{1}{|y|}\sum_i-\log\pi_{\mathrm{BC}}(y_i\mid h,y_{<i})",
    "surprisal": r"S_{\mathrm{BC}}(y\mid h)=-\frac{1}{|y|}\sum_i\log\pi_{\mathrm{BC}}(y_i\mid h,y_{<i})",
    "premium_compact": r"\Pi(y^*,y)=S_{\mathrm{BC}}(y^*\mid h)-S_{\mathrm{BC}}(y\mid h)",
    "information": r"\Delta_s=\log P_{\mathrm{BC}}(a^*\mid h,y^*)-\log P_{\mathrm{BC}}(a^*\mid h,y^*\setminus s)",
    "weights": r"v_s=\operatorname{clip}_{[\phi,1]}\!\left(\phi+(1-\phi)\left[\frac{1}{2}+\left(r_s-\frac{1}{2}\right)\min\!\left(1,\frac{\sigma}{\tau_{\mathrm{dz}}}\right)\right]\right)",
    "weights_gate": r"\sigma=\max_s\Delta_s-\min_s\Delta_s,\qquad \phi=0.1,\qquad \tau_{\mathrm{dz}}=0.05\;\mathrm{nats}",
    "loss": r"\mathcal{L}_{\mathrm{WD}}=\frac{\sum_i w_i\,\mathrm{CE}_i}{\sum_i w_i}+\beta\,\frac{\sum_i\gamma_i\,\mathrm{kl}_i}{\sum_i\gamma_i}",
    "loss_compact": r"\mathcal{L}_{\mathrm{WD}}=\frac{\sum w_i\,\mathrm{CE}_i}{\sum w_i}+\beta\,\frac{\sum\gamma_i\,\mathrm{kl}_i}{\sum\gamma_i}",
    "ce": r"\mathrm{CE}_i=-\log\pi_\theta(y_i^*\mid h,y_{<i}^*)",
    "kl": r"d_i=\log q_i-\log p_i,\qquad \mathrm{kl}_i=e^{d_i}-d_i-1",
    "kl_probabilities": r"p_i=\pi_\theta(y_i^*\mid h,y_{<i}^*),\qquad q_i=\pi_{\mathrm{ref}}(y_i^*\mid h,y_{<i}^*)",
    "coefficients": r"a_i=\frac{w_i}{\sum_jw_j},\qquad b_i=\frac{\beta\gamma_i}{\sum_j\gamma_j}",
    "target_cap": r"p_i^*=\min\!\left(1,\frac{q_i b_i}{b_i-a_i}\right)\quad\mathrm{if}\ b_i>a_i;\qquad p_i^*=1\quad\mathrm{otherwise}",
    "midpoint": r"\sigma=0\quad\Longrightarrow\quad v_s=\frac{1+\phi}{2}=0.55",
    "rank": r"r_s=\frac{\operatorname{avgrank}(\Delta_s)-1}{m-1}\quad(m>1)",
}


def generate_formulas():
    FORMULA_DIR.mkdir(parents=True, exist_ok=True)
    with matplotlib.rc_context({"mathtext.fontset": "stix", "svg.fonttype": "path", "svg.hashsalt": "webkd-formulas"}):
        for name, expression in FORMULAS.items():
            path = FORMULA_DIR / f"{name}.svg"
            mathtext.math_to_image("$" + expression + "$", path, format="svg",
                                  prop=font_manager.FontProperties(size=28),
                                  color=INK, dpi=150)
            svg = re.sub(r'<g id="patch_1">.*?</g>', '', path.read_text(), flags=re.S)
            svg = re.sub(r"<dc:date>.*?</dc:date>", "", svg)
            path.write_text("\n".join(line.rstrip() for line in svg.splitlines()).rstrip() + "\n")


def equation(name, width=11.5, center=(0, 0, 0)):
    path = FORMULA_DIR / f"{name}.svg"
    if not path.exists():
        generate_formulas()
    obj = SVGMobject(str(path), color=INK)
    obj.scale_to_fit_width(width)
    return obj.move_to(center)


def panel(width, height, center, color=WHITE_PAPER):
    return RoundedRectangle(width=width, height=height, corner_radius=.13,
                            stroke_color=LINE, stroke_width=1.2,
                            fill_color=color, fill_opacity=1).move_to(center)


def block(text, center, width=2.1, fill=OLIVE, text_color=INK, size=22):
    return VGroup(panel(width, .57, center, fill), label(text, size, text_color).move_to(center))


def indexed_loss_equation(height=1.18, center=(0,.72,0)):
    """Keep every summation index, typeset beside its sigma to reduce height."""
    folder=Path(config.media_dir) / "formula-cache"
    folder.mkdir(parents=True,exist_ok=True)
    path=folder / "loss-side-indices.svg"
    expression=FORMULAS["loss"].replace(r"\sum_i",r"{\sum}_i")
    with matplotlib.rc_context({"mathtext.fontset":"stix","svg.fonttype":"path","svg.hashsalt":"webkd-loss"}):
        mathtext.math_to_image("$"+expression+"$",path,format="svg",
                              prop=font_manager.FontProperties(size=28),color=INK,dpi=150)
    svg=re.sub(r'<g id="patch_1">.*?</g>','',path.read_text(),flags=re.S)
    svg=re.sub(r"<dc:date>.*?</dc:date>","",svg)
    path.write_text(svg)
    obj=SVGMobject(str(path),color=INK)
    obj.scale_to_fit_height(height)
    return obj.move_to(center)


def loss_slide_parts():
    """A spaced equation stack followed by two readable role lanes."""
    main=indexed_loss_equation()
    terms=VGroup(label("Weighted cross-entropy",19,DEEP).move_to([-.78,-.31,0]),
                 label("Pointwise anchor",19,DEEP).move_to([2.37,-.31,0]))
    definition=equation("ce",5.0)
    definition.scale_to_fit_height(.39)
    definition.move_to([0,-.89,0])
    rows=VGroup()
    weights=VGroup()
    anchors=VGroup()
    for y,title,components,weight,anchor,fill in [
        (-1.67,"Reasoning","think / plan / memory","Span-weighted CE","Anchored (γ = 1)",WHITE_PAPER),
        (-2.52,"Decisions","step / action","CE weight 1","Nearly free (γ = 10⁻⁶)",PANEL),
    ]:
        rows.add(panel(12.20,.60,(0,y,0),fill),
                 label(title,21,INK,weight=MEDIUM).move_to([-5.05,y,0]),
                 label(components,18,MUTED).move_to([-2.56,y,0]))
        weights.add(label(weight,19,DEEP).move_to([.75,y,0]))
        anchors.add(label(anchor,19,DEEP).move_to([4.40,y,0]))
    return main,terms,definition,rows,weights,anchors


class WebKDLossPreview(Scene):
    """Static QA view of the exact loss layout used in the film."""
    def construct(self):
        self.camera.background_color=CREAM
        self.add(label("WEBKD  /  INSIDE THE OBJECTIVE",16,DEEP,weight=MEDIUM).to_corner(UL,buff=.5),
                 label("04 / LOSS AND MASKS",15,MUTED).to_corner(UR,buff=.5),
                 Line([-6.55,3.05,0],[6.55,3.05,0],color=LINE,stroke_width=1),
                 Line([-6.55,-3.07,0],[6.55,-3.07,0],color=LINE,stroke_width=1),
                 label("The training objective",34,font=SERIF).move_to([0,2.38,0]),
                 label("Learn corrected decisions while keeping reasoning near the frozen seed.",21,MUTED)
                 .move_to([0,1.80,0]))
        self.add(*loss_slide_parts())
        self.add(label("Eq. 5 · Each term is normalized by its own weight sum over supervised tokens.",18,MUTED)
                 .move_to([0,-3.47,0]))


class WebKDMethod(Scene):
    """Detailed loss-and-intuition film. All illustrative diagrams are labelled."""
    def construct(self):
        generate_formulas()
        self.camera.background_color = CREAM
        top = label("WEBKD  /  INSIDE THE OBJECTIVE", 16, DEEP, weight=MEDIUM).to_corner(UL, buff=.5)
        self.chapter_label = label("01 / CONTEXT", 15, MUTED).to_corner(UR, buff=.5)
        self.chrome = VGroup(top, self.chapter_label,
                            Line([-6.55, 3.05, 0], [6.55, 3.05, 0], color=LINE, stroke_width=1),
                            Line([-6.55, -3.07, 0], [6.55, -3.07, 0], color=LINE, stroke_width=1))
        self.add(self.chrome)
        self.chapters = []

        def section(number, short, title, subtitle):
            self.chapters.append({"start": round(self.time, 3), "chapter": short, "title": title, "animation_index": self.renderer.num_plays})
            current = Group(*[m for m in self.mobjects if m is not self.chrome])
            new_chapter = label(f"{number:02d} / {short.upper()}", 15, MUTED).to_corner(UR, buff=.5)
            h = label(title, 34, font=SERIF).move_to([0, 2.38, 0])
            if h.width > 12.8:
                h.scale_to_fit_width(12.8)
            sub = label(subtitle, 21, MUTED).move_to([0, 1.80, 0])
            if sub.width > 12.5:
                sub.scale_to_fit_width(12.5)
            if len(current):
                self.play(FadeOut(current), Transform(self.chapter_label, new_chapter), run_time=.45)
            else:
                self.chapter_label.become(new_chapter)
            self.play(FadeIn(VGroup(h, sub), shift=UP*.08), run_time=.55)

        def note(text, color=MUTED, size=19):
            item = label(text, size, color).move_to([0, -3.47, 0])
            if item.width > 12.7:
                item.scale_to_fit_width(12.7)
            self.add(item)
            return item

        # 01 — The supervision is local to the original student contexts.
        section(1, "Context", "Edit the failure at the student's own contexts.",
                "The teacher corrects each suffix response independently.")
        xs = [-4.8, -1.6, 1.6, 4.8]
        cards, states, links = VGroup(), VGroup(), VGroup()
        for i, x in enumerate(xs):
            states.add(VGroup(Circle(radius=.31, stroke_color=INK, stroke_width=1.5,
                                     fill_color=CREAM, fill_opacity=1), label(f"h{i+1}", 21))
                       .move_to([x,.75,0]))
            cards.add(response_card(x, i+1))
            links.add(Line([x,.43,0],[x,.15,0], color=LINE, stroke_width=1.5))
            if i < 3:
                links.add(Arrow([x+.4,.75,0],[xs[i+1]-.4,.75,0],buff=0,color=MUTED,
                                stroke_width=1.5,max_tip_length_to_length_ratio=.05))
        self.play(LaggedStart(*[FadeIn(VGroup(states[i],cards[i])) for i in range(4)],lag_ratio=.2),
                  Create(links), run_time=1.5)
        footer=note("Start from a behavior-cloned student; retain its successful episodes as style examples.")
        self.wait(1.5)
        first=VGroup(Circle(radius=.42,stroke_color=ERROR,stroke_width=2.5).move_to(states[2]),
                     label("first error",18,ERROR).move_to([1.6,1.32,0]))
        self.play(Create(first),run_time=.6)
        self.wait(1.0)
        self.play(Transform(cards[2],response_card(1.6,3,True)),
                  Transform(cards[3],response_card(4.8,4,True)),run_time=1.2)
        self.add(label("Keep the correct prefix",22,MUTED).move_to([-3.2,-1.96,0]),
                 label("Edit in the student's style",22,DEEP).move_to([3.2,-1.96,0]))
        self.play(FadeIn(label("Corrected actions do not generate the next training context.",22,DEEP)
                         .move_to([0,-2.55,0])),run_time=.5)
        self.wait(3.0)

        # 02 — One readable equation and one unambiguous visual encoding.
        section(2,"Premium","Why can a correct edit be hard to learn?",
                "Teacher wording can be surprising even when the decision is right.")
        self.play(FadeIn(equation("premium_compact",8.5,(0,1.03,0))),run_time=.6)
        definition=label("S = mean per-token surprisal under the frozen seed",21,MUTED)
        definition.move_to([0,.40,0])
        self.play(FadeIn(definition),run_time=.4)

        # All bars start at zero and use the same color. Their lengths are
        # qualitative only: no invented experimental values or hue encoding.
        origin=-1.60
        ys=[-.46,-1.17,-1.88]
        axis=VGroup(Line([origin,-.16,0],[origin,-2.12,0],color=MUTED,stroke_width=1.3),
                    label("0",16,MUTED).move_to([origin,-2.35,0]))
        captions=["Original student text","Raw teacher edit","Style-conditioned edit"]
        widths=[1.70,5.65,1.94]
        levels=["low","high","low"]
        labels=VGroup()
        bars=VGroup()
        ends=VGroup()
        for y,caption,width,level in zip(ys,captions,widths,levels):
            labels.add(label(caption,22,INK).move_to([-4.13,y,0]))
            bars.add(RoundedRectangle(width=width,height=.30,corner_radius=.055,
                        stroke_width=0,fill_color=DEEP,fill_opacity=1)
                     .move_to([origin+width/2,y,0]))
            ends.add(label(level,19,MUTED).move_to([origin+width+.43,y,0]))
        self.play(Create(axis),FadeIn(labels),run_time=.4)
        self.play(LaggedStart(*[AnimationGroup(GrowFromEdge(bar,LEFT),FadeIn(end))
                  for bar,end in zip(bars,ends)],lag_ratio=.35),run_time=1.8)
        note("Eq. 2 · y*: edit; y: student's response · Bar lengths are schematic, not measured values.",size=18)
        self.wait(3.0)
        cue=label("Writing the correction in the student's style lowers the wording cost.",21,DEEP)
        cue.move_to([0,-2.75,0])
        self.play(FadeIn(cue),run_time=.5)
        self.wait(3.0)

        # 03 — Equation 4: remove one span, keep the target action fixed.
        section(3,"Action contribution","Which reasoning actually supports the action?",
                "Delete one span, and score the same corrected action again.")
        self.play(FadeIn(equation("information",12.0,(0,.94,0))),run_time=.6)
        comparison=VGroup(panel(5.8,2.55,(-3.15,-1.02,0)),panel(5.8,2.55,(3.15,-1.02,0)))
        self.play(FadeIn(comparison),run_time=.5)
        self.add(label("WITH SPAN s",17,DEEP).move_to([-3.15,-.02,0]),
                 label("WITHOUT SPAN s",17,ERROR).move_to([3.15,-.02,0]))
        present=block("Return to the shop page.",(-3.15,-.59,0),4.8,OLIVE,size=22)
        removed=block("Return to the shop page.",(3.15,-.59,0),4.8,PANEL,size=22)
        self.play(FadeIn(present),FadeIn(removed),run_time=.6)
        self.add(label('Corrected action:  goto("/shop")',21).move_to([-3.15,-1.20,0]),
                 label('Corrected action:  goto("/shop")',21).move_to([3.15,-1.20,0]))
        self.play(removed.animate.set_opacity(.2),
                  Create(Line([.78,-.59,0],[5.5,-.59,0],color=ERROR,stroke_width=2)),run_time=.7)
        withbar=RoundedRectangle(width=4.4,height=.16,corner_radius=.06,stroke_width=0,
                                 fill_color=DEEP,fill_opacity=1).move_to([-3.15,-1.72,0])
        withoutbar=RoundedRectangle(width=1.65,height=.16,corner_radius=.06,stroke_width=0,
                                    fill_color=ERROR,fill_opacity=1).move_to([1.78,-1.72,0])
        self.play(GrowFromEdge(withbar,LEFT),GrowFromEdge(withoutbar,LEFT),run_time=.8)
        self.add(label("Higher action probability",18,DEEP).move_to([-3.15,-2.06,0]),
                 label("Lower action probability",18,ERROR).move_to([3.15,-2.06,0]))
        note("Eq. 4 · Both scores come from the frozen seed, offline. Illustrative bars; no teacher logits needed.")
        self.wait(3.0)
        # Merge the weight intuition into the deletion example, without
        # introducing a separate rank/dead-zone slide or weighting equations.
        cue=label("More support for the action → more learning weight.",22,DEEP)
        cue.move_to([0,-2.69,0])
        self.play(FadeIn(cue),run_time=.5)
        self.wait(2.0)
        next_cue=label("Less informative spans are downweighted, not discarded.",22,DEEP)
        next_cue.move_to([0,-2.69,0])
        self.play(Transform(cue,next_cue),run_time=.5)
        self.wait(2.0)
        next_cue=label("When all contributions are nearly tied, keep the weights balanced.",21,DEEP)
        next_cue.move_to([0,-2.69,0])
        self.play(Transform(cue,next_cue),run_time=.5)
        self.wait(2.5)

        # 04 — A compact full objective with separate reasoning/decision lanes.
        section(4,"Loss and masks","The training objective",
                "Learn corrected decisions while keeping reasoning near the frozen seed.")
        main,terms,definition,rows,weights,anchors=loss_slide_parts()
        self.play(FadeIn(main),run_time=.7)
        self.play(FadeIn(terms),run_time=.5)
        self.play(FadeIn(definition),run_time=.5)
        self.play(FadeIn(rows),run_time=.7)
        self.play(FadeIn(weights),run_time=.4)
        self.wait(1.3)
        self.play(FadeIn(anchors),run_time=.4)
        note("Eq. 5 · Each term is normalized by its own weight sum over supervised tokens.",size=18)
        self.wait(5.5)

        # 05 — Pointwise anchor with explicit fixed-token analytic intuition.
        section(5,"Anchor intuition","The anchor responds to drift from the seed.",
                "The reference is the same frozen behavior-cloned checkpoint.")
        self.play(FadeIn(equation("kl",11.0,(0,1.06,0))),run_time=.7)
        self.play(FadeIn(equation("kl_probabilities",10.4,(0,.29,0))),run_time=.6)
        self.add(label("At initialization: pᵢ = qᵢ, so the anchor is zero.",22,DEEP).move_to([0,-.37,0]))
        self.wait(2.6)
        cols=[-4.25,0,4.25]
        titles=["NO ANCHOR (β = 0)","BINDING ANCHOR","VERY STRONG ANCHOR"]
        captions=["Fit the corpus freely","Limit rationale drift","Can resist useful change"]
        fill_widths=[2.95,1.40,.57]
        for x,title,caption in zip(cols,titles,captions):
            self.add(panel(4.0,1.80,(x,-1.62,0)),label(title,17,DEEP).move_to([x,-1.00,0]),
                     label(caption,18,MUTED).move_to([x,-2.19,0]))
        bars=VGroup()
        for x,width in zip(cols,fill_widths):
            left=x-1.5
            self.add(Line([left,-1.62,0],[left+3,-1.62,0],color=LINE,stroke_width=4),
                     Line([left+.42,-1.90,0],[left+.42,-1.35,0],color=MUTED,stroke_width=1.5),
                     label("qᵢ",16,MUTED).move_to([left+.42,-1.96,0]),
                     label("1",16,MUTED).move_to([left+3,-1.96,0]))
            bars.add(Arrow([left+.42,-1.62,0],[left+width,-1.62,0],buff=0,color=DEEP,
                           stroke_width=3,max_tip_length_to_length_ratio=.12))
        self.play(LaggedStart(*[GrowArrow(a) for a in bars],lag_ratio=.3),run_time=1.1)
        note("Fixed context, free token logits · Illustrative behavior, not measured results.",size=18)
        self.wait(3.5)
        self.play(FadeIn(label("The mask makes this restraint role-specific.",22,DEEP)
                         .move_to([0,-2.77,0])),run_time=.5)
        self.wait(2.5)

        # 06 — A concise synthesis with exact implementation caveat.
        section(6,"Takeaway","Pay the premium where it improves the decision.",
                "Style-conditioned targets, action-informative weights, and a rationale anchor.")
        self.play(FadeIn(equation("loss_compact",8.4,(0,.75,0))),run_time=.7)
        takeaways=VGroup(
            label("1. Keep the student's states and writing format.",25).move_to([0,-.5,0]),
            label("2. Give more weight to reasoning that supports the action.",25).move_to([0,-1.1,0]),
            label("3. Let decisions change while limiting rationale drift.",25).move_to([0,-1.7,0]))
        self.play(LaggedStart(*[FadeIn(t,shift=UP*.05) for t in takeaways],lag_ratio=.45),run_time=1.4)
        self.add(label("Paper setting: β = 0.03 per anchored token",22,DEEP).move_to([0,-2.40,0]))
        note("The corpus-token anchor is a pointwise k₃ surrogate, not an exact full-distribution KL.",size=19)
        self.wait(4.0)
        self.chapters.append({"start":round(self.time,3),"chapter":"End","animation_index":self.renderer.num_plays})
        Path(config.media_dir, "webkd-method-chapters.json").write_text(json.dumps(self.chapters,indent=2))


class WebKDPoster(Scene):
    """Equation-rich all-stage poster for the deeper film."""
    def construct(self):
        generate_formulas()
        self.camera.background_color=CREAM
        self.add(label("WEBKD  /  INSIDE THE OBJECTIVE",16,DEEP,weight=MEDIUM).to_corner(UL,buff=.5),
                 label("METHOD + MATHEMATICAL INTUITION",14,MUTED).to_corner(UR,buff=.5),
                 Line([-6.55,3.05,0],[6.55,3.05,0],color=LINE,stroke_width=1))
        self.add(label("Pay the premium where it changes the decision.",33,font=SERIF).move_to([0,2.40,0]),
                 label("A black-box teacher edits. The student's objective decides what to absorb.",21,MUTED)
                 .move_to([0,1.77,0]))
        self.add(indexed_loss_equation(height=1.15,center=(0,.75,0)))
        for x,title,body in [(-4.27,"01 / PRESERVE CONTEXT","Edit each suffix response\nat the original student context."),
                              (0,"02 / WEIGHT REASONING","Remove a span. Measure its\neffect on the corrected action."),
                              (4.27,"03 / ANCHOR RATIONALE","Keep think, plan, memory\nnear the student’s prior.")]:
            self.add(panel(4.05,2.05,(x,-1.23,0)),label(title,16,DEEP).move_to([x,-.58,0]),
                     label(body,20,MUTED).move_to([x,-1.66,0]))
        # Compact diagrammatic marks under each card header.
        self.add(VGroup(*[Dot([-5.42+i*.77,-1.08,0],radius=.065,color=DEEP) for i in range(4)]))
        self.add(Line([-5.42,-1.08,0],[-3.11,-1.08,0],color=DEEP,stroke_width=1.5))
        self.add(label("Δs = log P(with) − log P(without)",19,DEEP).move_to([0,-1.03,0]))
        self.add(label("γ = 1  /  γ ≈ 0",24,DEEP).move_to([4.27,-1.05,0]))
        self.add(label("Weighted CE learns the correction. The pointwise anchor limits drift on rationale tokens.",21,DEEP)
                 .move_to([0,-2.72,0]),
                 Line([-6.55,-3.07,0],[6.55,-3.07,0],color=LINE,stroke_width=1),
                 label("CONTEXT  →  PREMIUM  →  ACTION CONTRIBUTION  →  LOSS  →  ANCHOR",17,MUTED)
                 .move_to([0,-3.47,0]))
