# Enhanced Visual RBAC Platform – Process, Element & Queue Permission Architecture

Comprehensive enhancement of the RBAC (Role-Based Access Control) interface in the BPMP Platform to make permissions intuitive, transparent, and visually manageable across three distinct scopes: Process-level, Element-level, and Queue-level, backed by a high-density Matrix View and granular operational actions.

## User Review & Critical Decisions

> [!IMPORTANT]
> Decisions confirmed through user clarification:
> - **Visual Scope Architecture**: 3 dedicated views accessible via top tabs:
>   1. **Phân quyền theo Process**: Manage high-level process permissions (View, Start Instance, Deploy/Migrate, Terminate) per role.
>   2. **Phân quyền theo Element**: Control execution, claim, view, and reassign rights per BPMN diagram node (`bpmn:userTask`, `bpmn:serviceTask`).
>   3. **Phân quyền theo Queue**: Manage task worklist queues, custom query filters, and queue assignment per role.
> - **Matrix Grid Toggle**: An instant toggle switch to switch between **Card/Table List View** and **Full Permission Matrix Grid** (Roles as columns, Elements/Processes/Queues as rows with colored action chips).
> - **Configuration Drawer**: Interactive slide-over drawer with instant role search, quick multi-select pills, dynamic rule/filter expression builder (`amount > 5B`, `branch == 'HN'`), and granular action toggles.
> - **Granular Actions**: Explicit permission toggles per role-element mapping:
>   - `View` (Xem biểu mẫu & hồ sơ)
>   - `Execute / Claim` (Nhận & Xử lý phê duyệt)
>   - `Reassign` (Chuyển tiếp hoặc phân bổ lại)
>   - `Cancel` (Hủy hoặc từ chối tác vụ)

---

## 1. Overview & Core Concept

- **What It Does**: Provides process architects, compliance managers, and enterprise admins with a crystal-clear, visual RBAC control tower. Users can easily audit who can do what on each individual step of complex credit, disbursement, or business workflows without getting lost in nested configuration menus.
- **Target Audience**: Process Admins, Security/Compliance Officers, and Operations Leads.
- **Key Value**: Replaces black-box permissions with an interactive, auditable matrix and visual hierarchy matching the enterprise `Ops Unifi Portal` design system.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Process-Level Permissions Flow**:
   - User selects the **Phân quyền theo Process** tab.
   - Views a visual card or table of all registered processes (`NCLOS`, `SDD`, `PSCF`, `ISM`, etc.).
   - Configures which roles can: Start new instances (`Start`), View runtime instances (`View`), Migrate/Deploy versions (`Deploy`), or Terminate instances (`Cancel`).
   - Summary badges indicate total roles assigned and access level.

2. **Element-Level Permissions Flow (BPMN Node Scope)**:
   - User switches to **Phân quyền theo Element**.
   - Left sidebar allows switching between processes (`NCLOS (33)`, `SDD (26)`, etc.).
   - Table displays every user task with its BPMN element ID, assigned role badges, active filter count, and granular permission indicators.
   - Clicking an element or its action gear opens the **Slide-over Configuration Drawer**:
     - Live search filter for 40+ system roles.
     - Role multi-selector with chip removal.
     - Granular Action matrix for each assigned role (`View`, `Execute/Claim`, `Reassign`, `Cancel`).
     - Dynamic execution filter builder (e.g. `amount < 5000000000 && branch == 'HN'`).
     - Instant visual preview of resulting access.

3. **Queue-Level Permissions Flow**:
   - User navigates to **Phân quyền theo Queue**.
   - Inspects existing queues (e.g., `Hàng đợi hồ sơ ưu tiên SME`, `Hàng đợi thẩm định tín dụng`, `Tìm kiếm`).
   - Click `+ Create Queue` to define custom SQL/CAMUNDA task queries, set default priority, and assign authorized roles with claim restrictions.

4. **Matrix View Toggle Flow**:
   - Click **Matrix View** switch in the top toolbar.
   - Transforms the entire screen into an interactive 2D Grid:
     - Columns: Roles (`NCLOS ADMIN`, `NCLOS B CA`, `NCLOS B KS2`, `NCLOS B CO`, `NCLOS SALE`...)
     - Rows: Elements / Queues grouped by process phase.
     - Cells: Color-coded permission pills indicating granted actions (V = View, E = Execute, R = Reassign, C = Cancel). Click any cell to toggle permissions with zero latency.

---

## 3. Visual Layout & Component Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Header: Trang chủ > Foundation Services > Task Management (Ops Unifi)       │
├─────────────────────────────────────────────────────────────────────────────┤
│ [Search process...] │ Process: NCLOS – NCLOS          [View: Table | Matrix]│
│                     ├───────────────────────────────────────────────────────┤
│ ├── ISM         (7) │ Tabs: [Phân quyền Process] [Phân quyền Element]       │
│ ├── NCLOS (33) [★]  │       [Phân quyền Queue]                              │
│ ├── PSCF       (13) ├───────────────────────────────────────────────────────┤
│ └── SDD        (26) │ Main RBAC Table / Matrix Grid                         │
│                     │ - Name (Task / Queue / Process)                       │
│                     │ - Element Type (bpmn:userTask, Query, Process)        │
│                     │ - Roles (Interactive chips: NCLOS ADMIN, NCLOS B CO)  │
│                     │ - Actions Granted: [V] [E] [R] [C]                    │
│                     │ - Condition Filters (e.g. 1 filter)                   │
│                     │ - Configure Action                                    │
└─────────────────────┴───────────────────────────────────────────────────────┘
                                   ▲
                                   │ Click to edit
┌──────────────────────────────────┴──────────────────────────────────────────┐
│ Slide-over Drawer: Cấu hình Quyền hạn (Element: B CHUYEN GIA PHE DUYET)     │
│ - Search Roles input                                                        │
│ - Assigned Roles List with granular checkboxes:                             │
│   ☑ NCLOS ADMIN    [✓ View] [✓ Execute] [✓ Reassign] [✓ Cancel]             │
│   ☑ NCLOS B CA     [✓ View] [✓ Execute] [  Reassign] [  Cancel]             │
│ - Dynamic Expression Filter Builder                                         │
│ - [Hủy] [Lưu cấu hình]                                                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Technical Strategy & Data Models

- **RBAC Data Structure Extension**:
  - `ProcessPermission`: `processKey`, `roleId`, `canView`, `canStart`, `canDeploy`, `canCancel`.
  - `ElementPermission`: `id`, `processKey`, `elementId`, `elementName`, `elementType`, `roles`: `Array<{ role: string; actions: ('VIEW' | 'EXECUTE' | 'REASSIGN' | 'CANCEL')[] }>`, `filters`: `string[]`.
  - `QueueConfig`: `id`, `processKey`, `name`, `query`, `roles`: `string[]`, `actions`: `string[]`.
- **State Management**:
  - Centralized reactive state for RBAC permissions in `src/data/mockBpmData.ts` and `src/components/task-management/TaskManagementModule.tsx`.
  - Instant synchronization between Table View, Matrix Grid View, and the Slide-over Drawer.

---

## 5. Execution Steps

1. **Update Data Types**: Extend `RBACItem` and create `RoleActionPermission` types for granular actions (`VIEW`, `EXECUTE`, `REASSIGN`, `CANCEL`).
2. **Re-architect TaskManagementModule**:
   - Implement the 3 scope tabs: **Phân quyền Process**, **Phân quyền Element**, **Phân quyền Queue**.
   - Implement the **Matrix View** toggle for high-density visual auditing.
3. **Build the Slide-over Drawer**:
   - Implement the interactive configuration drawer with live role search, role badge toggles, action permission checkboxes, and condition filters.
4. **Build Process-Level and Queue-Level Consoles**:
   - Process permissions matrix with quick action toggles.
   - Queue management with custom query creator.
5. **Verification**: Run `compile_applet` and `lint_applet` to ensure zero compilation or type errors.

---

## 6. DMN Decision Table Version History & Semantic Diff Engine

- **DMN Version History Sidebar**: Interactive sliding drawer (`w-[410px]`) showing chronological timeline snapshots with author avatars, roles, timestamps, commit messages, and rule metrics.
- **Semantic Diff Engine (`dmnDiffEngine.ts`)**: Structured clause-level comparison detecting Hit Policy shifts, Input/Output schema changes, and fine-grained Rule diffs (`+ MỚI`, `~ SỬA ĐỔI`, `- ĐÃ XÓA`, `= GIỮ NGUYÊN`).
- **Interactive Version Compare Modal (`DmnVersionCompareModal.tsx`)**: Side-by-side / before-and-after expression tracking with color-coded diff rows and dynamic version selectors.
- **Revert with Safety Backup**: Rollback to any previous snapshot with automatic backup snapshot creation of current state.
- **Read-Only Snapshot Inspector (`DmnVersionInspectModal.tsx`)**: Quick static table inspection of historical rules without modifying active state.

---

## 7. Operation Module Summary Dashboard & Progress Ring

- **Executive Summary Dashboard Card**: Integrated into `OperationModule.tsx` directly above the instance data table, providing at-a-glance visibility into running operations.
- **Dynamic SVG Progress Ring / Donut Chart**:
  - Precision circular progress ring visualizing the ratio of Completed (Blue), Active (Emerald), and Canceled (Rose) instances.
  - Central readout displaying overall completion rate percentage (`${completionRate}%`).
- **Interactive KPI Cards & One-Click Filters**:
  - **Active Instances**: Displays live count, percentage, pulsating ping indicator, and 1-click filter toggle.
  - **Completed Instances**: Displays end-event finished instances, completion rate, and 1-click filter toggle.
  - **Operational Ratio & Health**: Interactive segmented ratio bar, selected count indicator, and reset filters button.
- **Synchronized Filter Panel**: Left sidebar running and finished instances checkboxes dynamically display real-time instance counts.
- **Collapsible Layout**: Expand/collapse toggle button allows operators to maximize table viewport when needed.

