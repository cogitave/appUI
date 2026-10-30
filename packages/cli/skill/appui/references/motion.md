# Motion invariants

Use shared durations (fast 160ms, standard 240ms, settle 360ms) and easing tokens.
Measure computed duration and respect the real reduced-motion preference.
Animate opening/closing, selection, search mode, density and actual height.
AnimatedHeight measures the border box including padding; Collapsible owns
spacing so closed content has zero height. Inactive controls leave focus and
accessibility navigation immediately.

Overlay/surface exit durations agree and exit styles remain until unmount.
Outgoing content immediately uses native inert and aria-hidden. Backdrops fade
their own background so opaque drawers do not reveal the page underneath. Keep
titles/field values stable during exit. Test late reversal for flashes or leaks.

Constrained menus retain bounds and row geometry during search changes. Check
trailing-action edge gaps while they move, and accessibility during reversal.

Skeletons preserve content dimensions, including narrow circular placeholders.
Real content stays mounted during placeholder crossfade. Loading completes
automatically and uses the documentation replay action. Inspect an intermediate
frame, completion and surrounding layout; a parent fade does not prove handoff.

Initialize an overlay's focus scope before moving focus into it. Test rapid
sibling switching, immediate activation and closing while outgoing scopes finish.
Track portal ownership for child submenus and dismiss a menu on blank-area clicks.
A queued scroll can arrive after opening: compare actual anchor movement during
that event, without delaying keyboard or pointer dismissal.

Collections can mount after the overlay's first render. Initialize opening focus
from the actual mounted collection with stable composed refs, after focus scopes
are registered. Check immediate navigation and closing without inserting delays.
Verify submenu bounds separately in narrow LTR and RTL layouts; use an alternate
placement when two adjacent surfaces cannot fit at their readable width.

For modal child overlays, restore trigger focus after containment releases.
Remember whether the overlay owned focus before exit inert, including an
application-driven close. A containing dialog can capture the resulting blur;
restore the trigger from that surface, while preserving deliberate focus on
another control.

When measured-height frames are nested, follow a child's active height transition
directly. Adding a full transition at each level prolongs surrounding blank space.
Restore the parent's normal motion token after child completion or cancellation;
verify the actual geometry during motion, rapid reversal and the idle duration.

Interrupted exits may preserve the collection DOM. Reacquire opening focus after
containment resumes, without replacing navigation already inside the collection.
Verify Escape after a late reversal. Collection viewports must fit their positioned
surface; optional CSS sizing variables need a valid fallback. Use standards-mode
HTML integration fixtures so containing-block measurements match real applications.

Animated queues retain outgoing DOM. Remove its interactive role immediately in
addition to inert and aria-hidden, so active collection queries cannot include
exiting rows. Capture owned focus before the queue changes; preserve an action's
new dialog destination. Verify a second full queue cycle while earlier cards are
still exiting. A registered landmark's remembered focus target must remain usable
when a collection is emptied and reused. Keep a stable native viewport anchor;
do not patch dependency internals or insert delays between navigation keys.

Density can change padding, minimum size and gaps without transitioning height
itself. A measured parent follows these child box changes directly, including
Web Animations, and restores its own token when motion completes or is canceled.
Compare parent/child bounds at the same midpoint and at the token's completion.

Use useIsPresent when only reading presence. Manual usePresence registrations
must call safeToRemove after their owned animation. A custom direct child of
popLayout forwards the real DOM ref. Empty/content swaps retain their old visual
for the crossfade while removing its flow height; keep section headings separate.

Card header text needs a readable flex basis before its actions wrap. Check the
actual heading/description width inside narrow containers, not only page overflow.
Nested confirmation restoration waits for its own child overlay to release; an
outer dialog can remain open. Preserve subsequent keyboard/pointer intent.

Verify direction in the compiled browser CSS as well as the source. Prefer logical
edge properties for direction-dependent layout; a compiler may lower :dir into
language matching even when the actual scope uses only dir. Check inner LTR scopes
inside RTL parents. Controlled selection can lag behind focus, so reveal the actual
focused choice immediately and retain each rapid navigation key and final action.

Declare public dependencies for dynamic React Aria collection renderers that use
external size, shape, appearance or disabled state. Verify the real item geometry
and states, not only root attributes. Keep folder shapes mounted for reversible
open/close transitions, and animate folding rails through actual column width.

Anchored selectors must follow their real trigger rectangle while an ancestor changes height or grid columns, through public positioning APIs. Continue positioning the mounted surface through its exit; resize the viewport during closing and verify its original bounds before unmount. Keep a repeated mouse/touch trigger press dismissible without making it inert; pending scroll events that cause no actual movement must not dismiss a newly opened menu. Preserve native keyboard navigation without dependency changes or delayed key tests.

Conversation following is an intent state, not a direct mirror of every resized viewport's end gap. Layout changes and new content retain following; upward wheel/touch/keyboard input suspends it before concurrent content arrives. End/jump resumes it. Use scoped motion tokens for Home/End/jump transitions; retarget the end as content or footer bounds change. Cancel animation and manual intent when the conversation key changes.
