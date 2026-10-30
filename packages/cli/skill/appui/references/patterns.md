# Composition patterns

## Families and configuration

Use `variant` for visual forms of the same control, props for behavior/data,
and `preset` for a composed screen layout. Consult the catalog's `families`
metadata before introducing another name for an existing family. Button groups
text, icon, link and provider actions without merging their native semantics.
Composer groups the input, panel, attachments and loading decorator; use their
existing exports and slots rather than inventing an unsupported variant prop.

The source workspace exposes WorkspaceTemplate (`chat`, `agent`, `multi-agent`,
`starter`, `image-generation`), DashboardTemplate (`overview`, `finance`,
`marketing`) and ProfileTemplate (`account`, `medical`) as typed presets. Those
template APIs are not included in the local CLI release. Existing template
exports and URLs remain compatible. Preserve each preset's callback and data
schema instead of accepting a generic bag of options.

## Form layout

Use Field around one shared Input, Textarea, Select, ComboBox or NumberField.
It changes layout while the control keeps its own label, description and
validation. FieldGroup columns and responsive Field orientation follow their
respective container widths, including a column or a narrow dialog.
FieldSet supplies a native legend, description and inherited disabled state.
An inner group or explicit `isDisabled={false}` cannot re-enable a locked group.
Close portaled surfaces when the group becomes disabled; keep their exit content
inert and preserve field values. Native fieldset behavior alone does not cover a
portal.

## Forms and settings

Use shared Input, Input Group, Textarea, NumberField, Select and ComboBox.
Labels, hints and validation belong to the actual accessible control. Preserve
native validation when explicit invalid state is absent. Validation growth
keeps submit controls usable by a real pointer. Inside dialogs, verify selector
layering, repeat-trigger dismissal, Escape closing only the selector, and focus
returning to its trigger. Required task progress excludes optional tasks and
completion follows saved data. Meter ARIA values stay finite and in range.

## Conversations

Reuse Message/Conversation from the existing template pattern. Identity is
BrandMark or a caller avatar. MessageActions owns feedback transitions. Shared
Composer fills the container; width limits belong to the layout. The composer
footer uses normal measured flow so growth leaves messages/jump controls usable.
Disclosure spacing belongs inside Collapsible: closed content leaves zero height.

## Collections and layouts

Table actions keep row geometry across density variants. Settings/filter
toolbars use shared selection controls. Collapsed sidebar controls and profile
visuals share a horizontal center. Split Pane constraints must not hide controls.
Native scrolling stays usable with hidden bars.

Menu search keeps outer height, width and row geometry. Header actions align to
the actual trailing content edge. Check long lists with rapid repeated keys,
immediate Enter, reversal, boundaries and ordinary editing. Independent heading
keys prevent an entering row from moving or shrinking an existing section.

Use ActionMenu for command collections, ContextMenu for context actions and
Menubar for persistent application commands. They share items, selection groups,
submenus and density. Keep mixed settings or form surfaces in Dropdown/Popover.
Scope RTL layout and React Aria's keyboard direction with the same locale provider.

## Site navigation and direction

Use Navigation Menu for site links and Menubar for application commands. Site
navigation keeps ordinary Tab access to its links and disclosure buttons. Choose
floating or inline panels based on the surrounding layout; inline changes animate
the actual height. Check native Enter activation and destination focus: navigation
can move focus before a press finishes, so use onNavigate for navigation feedback.

Use Direction with a locale to scope both DOM direction and React Aria behavior,
including portals. Direction-only scopes use representative en-US/ar-AE locales;
choose a real locale for localized formatting and announcements. Changing direction
must retain field values, focus and component identity.

## Content rows

Use Item for content with media, a title, description and separate actions. It
reuses Card and the approved complete text roles. ItemGroup is a native list with
separated or joined rows. Sizes animate actual padding, gaps and row geometry.
Actions move below content according to the row's own container width.
Use ItemLink when the entire row is one destination; keep interactive controls
outside that link. Native activation supplies onNavigate feedback. Disabled rows
are noninteractive and preserve list semantics. Keep local ImageArtwork sources
and explicit sheet crops when presenting image media.

## Workspace tabs

Use WorkspaceTabs for open documents or conversations. Native Tabs owns selection,
roving focus and panel association; each close button is a separate sibling of its
tab. The parent owns removal, dirty-document confirmation and saved drafts. Closing
a tab must not destroy its document data. Keep manual keyboard activation separate
from focus, including Delete. Retain the old panel mounted and inert during its
crossfade. Use the shared horizontal ScrollArea for overflow and verify RTL keys.

Tabs belong above the content pane, beside a full-height sidebar. Use leading for each document's actual harness icon; toolbarLeading, toolbarTrailing and footer compose the surrounding controls. Keep the compact rail visible, place sidebar disclosure at its top, animate real sidebar column width, and preserve mounted sidebar state. Use shared small icon buttons and retain native drawers on narrow screens. Chat search is an icon opening CommandPalette, with conversation and quick-action groups. hideHeader preserves an accessible dialog title while presenting the search directly.

The Agent Workspace template combines this block with Conversation, Message,
Composer, project navigation and a resizable terminal. Navigation and terminal use
the shared Drawer on narrow or short containers. This template is available in the
owner's checkout; the local source installer distributes WorkspaceTabs separately.
Use the quiet Button variant for neutral text actions and sidebar rows. Tooltip
uses native focus wrappers for native controls and direct context for accessible
React Aria controls; custom wrappers can declare their triggerType explicitly.

## Notifications and asynchronous actions

Use one scoped NotificationProvider for an application's queue, and useNotification
from its descendants. notify returns a stable key; update preserves that card;
a caller identity deduplicates repeated updates. dismiss and clear remove active
notifications while their exit motion completes. Queue limits are bounded;
maxVisible is selected when the provider mounts. Position changes animate with
the shared layout token. Error and pending notifications stay until dismissed;
positive durations have a five-second minimum and pause on hover, keyboard focus
and a hidden document. Queued cards start their countdown when they become visible.

promise shows pending/result content in the same card. The caller owns the actual
operation and cancellation. A dismissed or unmounted result must not reappear.
Capture data at submission, preserve a newer editable draft, and block repeated
submission. Notification actions dismiss by default; set dismiss:false to retain
one. A dialog opened from an action must return focus to a persistent producer,
rather than the transient notification control. Pass returnFocus explicitly when
notification production happens away from that control.

The standalone Notification exposes onDismiss at the start and onExitComplete
after its real height exit. Keep it mounted until onExitComplete when removing it
from a parent. Use the documentation replay action for timed/loading examples.

Clipboard and download feedback follows the source snapshot. Ignore stale results
when text changes or the consumer unmounts. Keep pending actions focusable, prevent
repeated activation and announce real failure/retry. Use actual UTF-8 downloads
rather than a success message that never produces the requested file.

## Workspace members

TeamMembers is controlled by the application's saved members. Supply onRoleChange,
onInvite and onRemove only for available operations; omitting callbacks displays
read-only roles. Each callback may return a promise and resolves after the caller
updates its data. Pending requests guard repeated activation, preserve submitted
data, and report real rejection without replacing the current role or invitation
draft. Owner/current-user removal controls are protected in the UI. The application
owns its actual authorization and transport.

Outline, soft and plain surfaces share the same member rows. Comfortable/compact
density and email/status options preserve complete type roles. Native joined lists
retain their row geometry; removal excludes the exiting row immediately and returns
focus to a surviving row. The final row and empty view crossfade within the measured
surface. Nested invitation/confirmation dialogs use the existing Select and native
Form; Escape closes only the active selector before its containing dialog.

Use layout="table" for searchable member management. It composes the shared DataTable,
role/status Select filters, sort controls and native row semantics; narrow rows stack
without horizontal scrolling. Invite member shares its toolbar after the filters.
Use DataTable toolbarActions for collection actions and match their measured control
heights. Embed TeamMembers with variant="plain" and showHeader={false} inside a
Dialog to avoid a second visible card. isInviteOpen/onInviteOpenChange support an
external invite producer; change field values on opening, never during exit.

The Agent Workspace template includes this block in its saved local team dialog,
with initialMembers and onMembersChange for integration. The demonstration updates
local membership data and does not send email.

## Segmented configuration

Use SegmentedControl for a persistent view/configuration choice, and RadioGroup
for form fields. Its soft/outline/underline surfaces, small/medium sizes,
horizontal/vertical orientation and content/equal fit share one keyboard model.
Options can be disabled independently; FieldSet disabling covers the group.
A controlled application may defer its value update, so navigation follows actual
focus and preserves every key plus immediate activation. Reveal focused choices
inside the strip immediately without moving the surrounding page. Complete type
roles change together, and selection/size use scoped shared motion tokens.

## Named color choices

ColorSwatch uses native accessible color descriptions, alpha checkerboard, small/medium/large sizes, circle/square shape and flat/gloss appearance. ColorSwatchPicker supplies native single selection for named colors in grid, row or list layout. The caller receives its original color string; equivalent strings select the same choice, and colors outside the palette leave choices unselected. Avoid duplicate equivalent colors. FieldSet can disable the collection. Typeahead focuses, Enter selects, and directional controls reserve their own edge space. Keep an empty status outside the native ListBox so it has zero selectable options. Include external size/shape/appearance/disabled dependencies in native dynamic renderers and inspect actual item geometry during changes.

## Folder state

Tree nodes with children (including an empty array) are folders. FileExplorer kind="folder" preserves that branch semantics even before files are added. Use FolderIcon with the actual isExpanded render state; keep its distinct open/closed glyphs mounted while opacity changes. Tree entry motion reads the root's scoped motion tokens and expansion uses Collapsible's real height. Direction must follow the nearest dir scope, including nested overrides.

## Pending button presentation

Button hides its mounted label and glyphs while the centered Spinner appears.
The accessible action name, focus and outer dimensions remain stable; loadingLabel
supplies a progress description rather than a longer visible label. Do not reserve
an idle loader slot or duplicate the spinner in a consumer. Check native pending
state and repeated activation on the actual rendered control.

## Task workspaces

Start from the installed screen's working composition and the user's primary task.
appUI's AI Chat and Agent Workspace patterns allocate the remaining viewport to
the conversation, editor or canvas; contextual tabs and inspectors hold secondary
work.

SplitPane supports primaryEdge="end" for a trailing inspector and primaryId for
an external disclosure button. Its default edge remains start. Use a Drawer for
mobile settings without remounting the main editor or losing results and drafts.
Follow actual container width,
preserve deliberate focus across breakpoints and allow native scrolling when a
short screen genuinely requires it.
