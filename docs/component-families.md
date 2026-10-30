# Component families and configuration

`config/component-families.json` defines the families used by navigation,
documentation, overview cards and registry metadata. Individual routes, exports
and installable names remain available.

## Terminology

| Term | Meaning | Example |
| --- | --- | --- |
| Family | Related components or screen compositions | Workspace, Composer, Button |
| Variant | A visual presentation of one component | `Button variant="secondary"` |
| Prop / option | Behavior, data, configuration or a slot | `Composer attachments={files}` |
| Preset | A composed screen with its own typed data and callbacks | `WorkspaceTemplate preset="agent"` |
| Composition | Components assembled into a reusable pattern | ComposerPanel, ComposerLoader |

## Public APIs

| Family | Public entry / related exports | Choices |
| --- | --- | --- |
| Workspace | `WorkspaceTemplate` | `chat`, `agent`, `multi-agent`, `starter`, `image-generation` |
| Dashboard | `DashboardTemplate` | `overview`, `finance`, `marketing` |
| Profile | `ProfileTemplate` | `account`, `medical` |
| Composer | `Composer`, `ComposerPanel`, `ComposerAttachments`, `ComposerLoader` | Input, provider/permission panel, attachments, loading edge |
| Button | `Button`, `IconButton`, `LinkButton`, `SocialButton` | Text, icon, navigation, provider identity |

Template entry points use discriminated unions. Agent callbacks receive a thread
ID; multi-agent callbacks receive agent IDs; image generation returns a source
and title. Account and medical profiles retain separate data schemas.

Template exports are available from `components/templates/templates.tsx`.
Select and ComboBox, Checkbox and Radio, Table and DataTable, Message and
Conversation keep their separate semantics and APIs.

## Catalog navigation

Template category headings list their preset screens directly underneath.
Button and Composer headings toggle their member lists; member links navigate.
Search matches names, slugs and preset labels. The shared selector navigates
between member routes, and browser history restores the current selection.

The local CLI distributes Base, Blocks and Charts. Its registry and MCP expose
families whose members are included in that distribution. Template source is
available in the appUI source application.
