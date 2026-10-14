# WEBKD animation source

`webkd_method.py` contains the detailed mathematical explainer (`WebKDMethod`) and its static poster (`WebKDPoster`). The original short overview remains available as `WebKDOverview` and `WebKDOverviewPoster`. The website's rendered overview assets are preserved separately.

The detailed film explains the method, perplexity premium, leave-one-out action information, plain-language weighting intuition, and the role-asymmetric training objective. It is silent and designed to be understood from the on-screen text. All probability bars, surprisal bar lengths, and anchor-strength diagrams are explicitly illustrative, not experimental measurements.

## Render

Use Python 3.11 or newer in a virtual environment and install `requirements.txt`. Follow the [Manim Community installation guide](https://docs.manim.community/en/stable/installation.html) for platform dependencies. The typefaces are Helvetica Neue and Georgia; change the `SANS` and `SERIF` constants on systems without them. No LaTeX installation is needed: Matplotlib mathtext generates the vector equations, also saved under `assets/formulas/` for reuse in the design explorer.

From the repository root:

```sh
python -m venv .venv-manim
.venv-manim/bin/python -m pip install -r animations/requirements.txt
.venv-manim/bin/python -m manim -qh --fps 30 --media_dir /tmp/webkd-manim animations/webkd_method.py WebKDMethod
.venv-manim/bin/python -m manim -qh -s --media_dir /tmp/webkd-manim animations/webkd_method.py WebKDPoster
```

Export the film with browser streaming metadata at the front of the file:

```sh
ffmpeg -y -i /tmp/webkd-manim/videos/webkd_method/1080p30/WebKDMethod.mp4 -c copy -movflags +faststart assets/webkd-method.mp4
cp /tmp/webkd-manim/images/webkd_method/WebKDPoster_ManimCE_v0.22.0.png assets/webkd-method-poster.png
```

The scene writes renderer-clock chapter boundaries and segment indices to `webkd-method-chapters.json` inside the chosen media directory. The delivered metadata is corrected to encoded frame boundaries and is in `assets/webkd-method-chapters.json` and `assets/webkd-method-chapters.vtt`.

## Chapters and transcript

Times below refer to the rendered detailed film; exact boundaries are in the JSON.

| Start | Chapter | Content |
|---|---|---|
| 00:00 | Context | Student rollout, first error, independent suffix corrections |
| 00:10 | Premium | Equation 2: extra average surprisal under the frozen seed |
| 00:21 | Action contribution | Equation 4: delete a span, rescore the action, and explain learning emphasis |
| 00:36 | Loss and masks | Equation 5: normalized weighted CE and role-asymmetric anchor |
| 00:47 | Anchor intuition | Pointwise penalty, zero initial drift, effect of anchor strength |
| 00:59 | Takeaway | Three complementary controls on the teacher's supervision |

### 00:00 — Context

Begin with a behavior-cloned student. Collect its failed rollouts and keep its successful episodes as examples of its writing style. The teacher identifies the earliest erroneous step. Preserve the correct prefix, then edit each response in the suffix independently at the exact observation history the student originally saw. The corrected actions do not produce the next training context. Each structured response has think, plan, step, memory, and action components.

### 00:10 — Perplexity premium

Under the frozen seed student, define the average token surprisal:

```tex
S_{BC}(y|h) = -1/|y| sum_i log pi_{BC}(y_i | h, y_{<i}).
Pi(y*, y) = S_{BC}(y*|h) - S_{BC}(y|h).
```

This is Equation 2, written with an explicit shorthand for readability. It is a difference in mean log-perplexity, in nats per token, rather than a difference in raw perplexities. The teacher's corrected text can be much less natural to the student than its own text. Uniform SFT spends loss on surprising wording as well as on decisions. Style-conditioned edits reduce this friction while retaining the teacher's correction. The measure does not causally isolate style from reasoning content. The film shows one compact premium equation, with `S` defined in words. Three horizontal bars share the same zero origin and the same color: original student text is short/low, raw teacher editing is long/high, and style-conditioned editing is short/low. Bar length alone encodes qualitative mean per-token surprisal under the frozen seed; no numerical experimental values are assigned.

### 00:21 — Action contribution

For a rationale span `s`, hold the edited action `a*` fixed and compute:

```tex
Delta_s = log P_{BC}(a* | h, y*) - log P_{BC}(a* | h, y* \ s).
```

Both scores are computed once, offline, under the frozen seed checkpoint. They are summed log-probabilities at the corrected action-token positions. The second score deletes the span and retokenizes the remainder. A larger `Delta_s` means that span makes the corrected action more probable under the student. A negative value remains meaningful and stays in the ranking. This requires no teacher logits. The on-screen action example and probability bars are illustrative, not measurements or a causal proof about the browser environment.

The same deletion demonstration then explains the weighting intuition in plain language: more support for the action receives more learning weight; less informative spans are downweighted without being discarded. When all contributions within a step are nearly tied, their weights remain balanced. This does not claim that any pair of similar contributions always receives similar weights, because the exact map depends on ranks within the whole step.

There is no separate rank/dead-zone slide and no weighting equation in this part of the film. The exact rank map and its parameters remain available in the website's expanded maths section and the reusable formula assets.

### 00:36 — Loss and masks

The slide presents the fully indexed Equation 5 with separate labels for its two terms, a smaller CE definition, and two role lanes. Reasoning uses span-weighted CE with a strong anchor; decisions use imitation weight 1 with a nearly inactive anchor. Equation 5 combines two normalized means over supervised response positions:

```tex
L_WD = [sum_i w_i CE_i / sum_i w_i] + beta [sum_i gamma_i kl_i / sum_i gamma_i].
CE_i = -log pi_theta(y_i* | h, y*_{<i}).
```

The first term redistributes the learning signal. Its denominator is the weight sum, not the token count; constant weights reproduce ordinary SFT exactly. The second term limits drift from the frozen behavior-cloned reference. Its normalization makes `beta` a penalty per anchored token.

The anchor mask is 1 on think, plan, and memory tokens. The reported implementation uses `10^-6` elsewhere, including action and step tokens. Thus rationale stays close to its prior while corrected decisions can move essentially freely. The rationale is anchored, not frozen.

### 00:47 — Anchor intuition

For the target corpus token at each position, let `p_i` be the current student's probability and `q_i` the frozen reference probability:

```tex
d_i = log q_i - log p_i.
kl_i = exp(d_i) - d_i - 1.
```

At initialization, `p_i=q_i`, so the anchor is zero. With no anchor, weighted cross-entropy fits the target freely. A sufficiently strong anchor can limit how far rationale-token probability moves from its prior. A very strong anchor can resist useful changes too. The film's three lanes show schematic fixed-context, free-token-logit intuition, not predictions for whole-network training.

For the optional analytic target-cap formula in the explorer, define `a_i=w_i/sum_j w_j` and `b_i=beta gamma_i/sum_j gamma_j`. At fixed context with free per-position logits, the unclamped objective has optimum `p_i*=min(1, q_i b_i/(b_i-a_i))` if `b_i>a_i`, and `p_i*=1` otherwise. A cap strictly below 1 requires `b_i(1-q_i)>a_i`. This stronger condition matters: the mere presence of an anchor does not prove that a token is capped.

### 00:59 — Takeaway

Keep the student's contexts and writing format. Emphasize reasoning that supports the action. Allow corrected decisions to change while limiting rationale drift. The paper's reported setting is `beta=0.03` per anchored token.

The `k3` expression is evaluated on target corpus tokens, so it is a pointwise KL surrogate, not an exact full-vocabulary KL. The unbiased KL-estimator interpretation requires samples from the current student, which is a different sampling condition. The implementation also clamps `d_i` to `[-20,8]`.

## Formula assets

All SVGs use vector paths and transparent backgrounds. `premium.svg`, `information.svg`, `weights.svg`, `loss.svg`, and `kl.svg` provide the core equations. `loss_compact.svg` omits repeated summation indices for the closing summary; all sums still cover supervised response tokens. The main loss slide and poster retain every index, with side-set summation indices rendered into a temporary SVG under the Manim media directory. This keeps the full formula readable without enlarging its vertical footprint. Auxiliary assets provide the mean-surprisal definition, role probabilities, weight parameters, midpoint, normalized rank, coefficient definitions, and the optional target-cap result.

The formulas and descriptions were checked against the supplied draft's Equations 2, 4, 5, 10, and 17, Appendix B.4–B.6, and Appendix E.1. A sentence in the draft's Section 3.3.2 reverses the direction of rationale drift; the animation follows the explicit role mask and the surrounding mathematical definitions.
