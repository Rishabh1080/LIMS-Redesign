# LIMS V3 Product Document

## Document purpose

This document captures the product as implemented in the current codebase, plus the workflows that are strongly implied by the UI and in-memory demo data.

It is based on the React/Vite prototype in this repository, not on a production backend or API contract.

## Confidence and scope

- High confidence: page structure, navigation, user-facing labels, visible actions, status names, entity relationships, and happy-path UI flows.
- Medium confidence: intended business process behind each screen when the UI suggests behavior but does not fully implement it.
- Low confidence: persistence rules, permissions, backend validations, integrations, and audit/compliance logic that are not present in the prototype.

Where useful, this document explicitly marks things as:

- `Implemented in UI`
- `Implied by workflow`
- `Placeholder / not implemented yet`

---

## 1. Product summary

LIMS V3 is a laboratory information management system for tracking the end-to-end lifecycle of:

- samples
- test requests
- jobs and analyst allocation
- datasheets and result entry
- review and approval handoffs
- COA and report generation
- retained and disposed remnants
- material inventory
- instrument records and servicing
- environment logs
- leave records
- trainings and attendance
- operational alerts and approval requests

The product appears designed for a QA/QC or analytical laboratory environment, likely serving internal lab teams handling industrial, water, utility, textile, or chemical samples.

The application is currently a frontend prototype with local state. There is no router, no API layer, and no persistent storage in the current implementation.

---

## 2. Product model at a glance

### Primary entities

#### Sample

A sample is the top-level testing object. It has:

- sample ID like `IICT/2025-2026/1101`
- status: `Pending`, `Under Analysis`, `Completed`
- customer representative
- reference
- request mode (`Online`, `Pickup`)
- created date/time
- reporting date/time
- category such as IQC, ILC, PT, Amendment, Complaint, Retained, Disposed
- product and parameter details

#### Test Request

A test request is a unit of testing under a sample. It has:

- test request ID like `URLS/26/ULRS/O/2026/30/330`
- status such as `Not allocated`, `Result Under Testing`, `Result Under Approval`, `Reviewed`, `Approved`, `Rejected`
- parameter
- test method
- product
- age
- target reporting date

#### Job

A job appears to be a grouped work package created from one or more test requests for operational execution and allocation.

#### Datasheet

A datasheet is the result-entry layer for a test request or method. It is currently a placeholder screen with save/refresh behavior.

#### Report / COA

Reports exist in multiple stages:

- report selection / template selection
- temporary report
- finalized report

They can be:

- consolidated
- product-wise
- parameter-wise

#### Material

A material record stores:

- name
- unique key
- unit of measure
- quantity thresholds
- description
- transaction history

#### Instrument

An instrument record stores:

- name
- unique key
- make/model/serial
- access roles
- calibration details
- preventive maintenance details
- breakdown details
- additional commercial/location details
- service history

#### Alert / Request

The app includes cross-functional requests and alerts:

- sample transition requests
- datasheet approval requests
- material alerts
- instrument alerts
- environment data alerts
- document alerts

---

## 3. Likely user roles

The UI suggests these roles or actor groups:

- Lab Manager
- Technician
- Quality Analyst
- Supervisor
- Technical Manager
- Quality Team
- Universal Admin
- Review Board
- Shift Supervisor
- Quality Officer

These appear in:

- allocation modals
- review routing
- instrument access controls
- service reminders
- training and operational records

No role-based access control is actually enforced in the current frontend.

---

## 4. Global navigation and shell

## Navigation structure

The main sidebar has two sections:

### Home

- Dashboard

### LIMS

- Requests for me
- Test Requests
- Samples Workspace
- All Samples
- Environment Data
- Leave Records
- Materials
- Instruments
- Trainings

## Shared shell behavior

Implemented in UI:

- collapsible desktop sidebar
- mobile drawer sidebar
- breadcrumbs
- global header with:
  - home shortcut
  - "No Active Alerts" pill
  - support phone number
  - notifications button
  - user profile button

Badges are shown for:

- Requests for me
- Test Requests

The app is state-switched inside `src/App.jsx`, not route-based.

---

## 5. Status model

### Sample statuses

- `Pending`
- `Under Analysis`
- `Completed`

### Test request statuses

- `Not allocated`
- `Result Under Testing`
- `Result Under Approval`
- `Rejected`
- `Reviewed`
- `Approved`

### Datasheet statuses implied by registry

- `Under Testing`
- `Under Approval`
- `Rejected`
- `Reviewed`
- `Approved`

### Parameter progression implied by sample cards

Parameter circles summarize progress such as:

- Not allocated
- Under Testing
- Under Approval
- Rejected
- Reviewed
- Approved

---

## 6. Main user journeys

## 6.1 Sample lifecycle

### Happy path

1. User opens `Samples Workspace` or `All Samples`.
2. User creates a new sample.
3. User enters customer details, basic details, product details, parameter data, and additional details.
4. Sample is saved and opened in `Sample Details`.
5. From sample details, user either:
   - sends the sample for review, or
   - opens test requests to operationalize testing.
6. Test requests are created / grouped into jobs / allocated.
7. Analysts add methods and results.
8. Datasheet is saved.
9. Test request is submitted for review, with remnant availability captured.
10. Once sample work is complete, COA/report flow is used.
11. User generates a temp report and finalizes it, or directly finalizes from selection.
12. Completed samples can move into retained/disposed remnant workflows.

### Alternate paths

- Pending samples can be edited.
- Completed samples open report actions instead of review actions.
- Retained samples can be disposed or sent for IQC.
- Disposed samples remain viewable as historical records.

## 6.2 Operational queue lifecycle

1. User opens `Test Requests`.
2. Depending on queue state, they see:
   - allocated to me
   - pending for allocation
   - pending for approval
   - all test requests
3. User allocates test requests to analysts/reviewers/instruments.
4. User reviews or approves requests in the approval queue.
5. User drills into a test request detail page.
6. User adds methods, adds results, and submits for review.

## 6.3 Alert center lifecycle

1. User sees alerts in `Dashboard` or `Requests for me`.
2. User opens a request or alert section.
3. Depending on alert type, they:
   - view a request
   - approve or reject
   - add env data
   - reorder/dispose material
   - generate service / view service
   - update document

---

## 7. Detailed page inventory

## 7.1 Dashboard

Purpose:

- operational landing page
- executive summary by module
- quick drill-down into high-signal areas

Implemented in UI:

- module tabs:
  - Samples
  - Instruments
  - Inventory
  - Documents
  - Invoice
- one primary hero card per module
- four metric cards per module
- alerts side panel with priority filter:
  - All
  - Severe
  - Med Priority

Data surfaced:

- sample counts by status and receipt mode
- retained sample counts
- test request queue distribution
- request / alert totals
- instrument fleet readiness
- low stock / expired material counts
- training counts
- dispatch or customer-facing constraints

Alert groups shown on dashboard:

- Materials
- Instruments
- Environmental Data

Primary actions:

- open module destination page
- open alert center focused on the relevant section

Notable limitation:

- dashboard is analytical and navigational only; it does not perform edits directly

## 7.2 Requests for me

Purpose:

- unified approval center and alert inbox

Top-level sections:

- My Requests
- Material Alerts
- Instrument Alerts
- Env. Data Alerts
- Document Alerts

Category chips under `My Requests`:

- All Requests
- Samples
- Datasheet

### My Requests view

Shows request cards with:

- item/title
- source state -> target state transition
- days
- raised on
- actions: View, Approve, Reject

Request detail modal includes:

- requester name
- request date
- request comment
- approval table for multiple approvers
- remind-all action
- comment entry
- approve / reject actions

Implied workflow:

- sample state transition approval
- datasheet state transition approval
- multi-approver review chain

### Material Alerts view

Shows:

- material name
- alert type
- batch number
- min quantity
- current quantity
- alert raised on
- days since
- action button

Examples in data:

- nearing expiry
- low stock
- COA missing
- packaging deviation
- reference standard replenishment

### Instrument Alerts view

Shows:

- instrument name
- type (`maintenance` or `breakdown`)
- alert raised on
- days since
- last service
- service due
- action

Actions:

- `Generate Service` for maintenance
- `View Service` for breakdown

### Env. Data Alerts view

Supports two modes:

- empty/healthy state
- populated alert state

Alert rows show:

- lab name
- alert raised on
- last update
- due
- action (`Add Env Data`)

### Document Alerts view

Shows:

- document name
- last update
- expiry date
- action (`Update Doc`)

## 7.3 Samples Workspace

Purpose:

- day-to-day working area for recent or active samples

Implemented in UI:

- page title: `Samples Workspace`
- primary CTA: `New Sample`
- search bar
- filter drawer
- applied filter pills
- sample list
- sample card view toggle:
  - modern
  - legacy
  - grid

Filters:

- status
- request mode
- customer representative
- reference
- created on
- reporting date

Primary actions:

- open sample
- edit sample when applicable
- clear filters
- create sample

Data emphasis:

- recent samples
- active sample metadata
- parameter progress summary

## 7.4 All Samples

Purpose:

- master sample listing across categories and lifecycle states

Tabs:

- All Samples
- IQC Samples
- ILC Samples
- PT Samples
- Amendment Samples
- Complaint
- Retained
- Disposed

Standard listing views:

- search in active category
- filter drawer
- sample count
- sample card view toggle

### Retained tab

Special behavior:

- checkbox selection
- bulk select
- dispose action
- send for IQC action
- bulk dispose modal with mandatory comment

Columns shown:

- remnant ID
- tested at
- tested by
- retention date
- action

### Disposed tab

Shows:

- remnant ID
- tested at
- retention date
- disposal date
- disposal remarks
- open action

Important workflow implication:

- remnants are formally managed after completion
- disposal requires explicit confirmation and comment

## 7.5 Sample Details

Purpose:

- detailed sample record and control point for next-step actions

Header includes:

- breadcrumb-like sample identity
- sample ID
- sample status pill
- created date/time

Actions vary by status:

- `Pending`
  - Send for Review
  - Edit
- `Under Analysis`
  - Test Requests
- `Completed`
  - COA Report
  - Test Requests

More actions menu includes:

- Create Amendment
- Create Complaint
- Add final comments
- Acknowledgement Receipt
- Proforma Invoice

Body content:

- product data table
- image download placeholders
- parameter data table
- barcode / tracking block

Review workflow:

- Request Review modal
- choose "Send to"
- optional comments
- success toast after sending

Notes:

- sample details is the main bridge between sample creation and test execution
- several report/invoice-style actions are visible but not yet fully implemented

## 7.6 New Sample / Edit Sample wizard

Purpose:

- create or edit a sample through a multi-step form

Steps:

1. Customer Details
2. Basic Details
3. Product Details
4. Additional Details

### Customer Details

Fields:

- Sample Type
- Receiving Date
- Customer
- Customer Address

### Basic Details

Fields include:

- Sampling Plan & Procedure
- Sample Creation Date & Time
- Representative
- Statement of Conformity
- Receipt Mode
- Nature of Sample
- Brand Name
- Packaging Condition

### Product Details

Fields include:

- Category
- Product
- Description
- Quantity
- Sample Size
- Quality
- Identification Mark
- Condition
- Image Upload

Parameter table supports:

- select/deselect rows
- edit parameter name
- edit method
- edit required size
- edit charges
- edit estimated time
- add parameter
- add product
- auto-fill parameters

### Additional Details

Fields include:

- Mode of Sample Receipt
- Tentative Reporting Date
- Amount (inc. taxes)
- Received By

Edit mode behavior:

- prepopulates data from existing sample
- shows all steps as completed in the rail
- supports direct step navigation

Known limitation:

- validation logic exists conceptually but is currently disabled before advancing or saving

## 7.7 Test Requests Home

Purpose:

- centralized queue management for test requests across operational states

Tabs:

- Allocated to me
- Pending for allocation
- Pending for approval
- All Test Requests

Row fields:

- test request ID
- optional status column
- product
- target reporting date
- age
- actions

Actions by queue:

- allocate
- view
- review
- approve
- reject

### Allocation flow

Allocation modal includes:

- request details:
  - test parameter
  - MoA
  - template
- selection tabs:
  - Analysts
  - Instrument
  - Material
- assignment fields:
  - Allocate to
  - Reviewer
  - Instrument

### Approval flow

Approval/review/reject modal requires:

- comment
- optional narration for approve action

Implied business purpose:

- this page is for supervisors, coordinators, or reviewers managing queue movement

## 7.8 Test Requests Listing

Purpose:

- sample-level view of all test requests and jobs for a particular sample

Header:

- title `All Test Requests`
- back navigation

Two major panels:

- Test Requests
- Jobs

### Test Requests panel

Default mode:

- shows detailed request rows
- allows selecting multiple unallocated requests
- allows `Create Job`
- allows per-request allocate/view

Create Job mode:

- multi-select requests
- assignee required
- reviewer required
- create job action

### Jobs panel

Shows:

- job/test request ID
- status
- product
- age
- reporting date
- action

Actions:

- allocate for pending jobs
- view for active/completed jobs

Approved/read-only mode:

- used when sample is completed
- disables create/allocate behavior
- shows approved states

Important workflow:

- jobs appear to be created from selected test requests, then allocated and worked separately

## 7.9 Test Request Details

Purpose:

- method-level workspace for an individual test request

Header shows:

- request ID
- status pill
- timestamp

Actions depend on workflow stage:

### Default stage

- Add Method
- Add Results

### In-progress stage

- Add Method
- Add Results
- Send for Review

### Submitted stage

- Print

Supporting flows:

- Add Method modal
- Remnant availability modal

Method behavior:

- starts with one method
- additional methods can be added
- when multiple methods exist, a sidebar of method selectors appears

Current implementation note:

- main content area is still placeholder text: `Template content will be added here`

## 7.10 Datasheet

Purpose:

- result-entry or worksheet page for a datasheet ID

Header actions:

- Calculate
- Refresh
- Save

Current implementation:

- refresh shows loading animation
- save returns user to test request details and advances workflow stage
- actual datasheet template is not implemented yet

This is a functional placeholder, not a finished result-entry screen.

## 7.11 COA Report Selection

Purpose:

- choose report granularity and templates before report generation/finalization

Report type options:

- Consolidated
- Product Wise
- Parameter Wise

Per-product template selection is required before continuing.

Actions:

- Generate
- Finalise

Behavior:

- action is disabled until report type and templates are selected
- transition shows loading state before moving to next report page

## 7.12 Temporary Report

Purpose:

- pre-finalized report preview and version browsing

Features:

- version selector
- grouped report sidebar:
  - Product Wise Reports
  - Consolidated Reports
  - Parameter Wise Reports
- row-level report selectors
- print action
- finalize action
- more actions menu

Current content:

- placeholder preview for selected report and version

## 7.13 Finalized Report

Purpose:

- finalized report browsing and version switching

Features:

- version selector
- grouped report sidebar
- print action
- edit parameters action
- more actions menu

Current content:

- placeholder preview for selected report and version

Difference from temp report:

- finalize action is removed
- report rows all appear to be NABL-tagged

## 7.14 Environment Data

Purpose:

- maintain environmental monitoring logs for lab areas

Main screen shows:

- log count
- table of logs
- add log action
- delete log action

Fields for add-log modal:

- recording date and time
- temperature
- relative humidity
- location

Validation implemented:

- recording date/time required
- temperature must be numeric/decimal
- humidity must be numeric with `%`

Locations in demo data:

- Main Laboratory
- Humidity Chamber
- Sample Receiving Bay
- Instrument Room

## 7.15 Leave Records

Purpose:

- maintain employee leave records within the lab operations module

Main screen shows:

- record count
- employee name
- from date
- to date
- view action

Add-record modal fields:

- from
- to
- remarks
- file upload

Validation implemented:

- attachment must be PDF/DOC/DOCX
- max attachment size 10 MB

This module is operationally adjacent to workload and scheduling, especially for analyst allocation.

## 7.16 Materials

Purpose:

- manage laboratory material inventory and stock transactions

Listing columns:

- name
- description
- key
- created
- actions

Actions:

- open material
- edit
- delete
- new transaction
- create new material

New material fields:

- name
- unique key
- unit
- initial quantity
- min quantity
- description

Transaction types:

- In
- Out
- Out - Damaged

Transaction fields vary by type:

- quantity
- cost
- expiry date for `In`
- supplier for `Out`
- batch/serial number
- make/supplier

Important implication:

- materials support both stock intake and consumption/damage tracking

## 7.17 Material Details

Purpose:

- detailed inventory history for a single material

Header actions:

- back
- print QR
- new transaction

Summary card shows:

- material name
- unique key
- description
- current quantity
- minimum quantity
- QR code

Transaction tabs:

- All Transactions
- In
- Out
- Out - Damaged

Table fields:

- type
- quantity
- supplier/batch
- transaction date
- expiry date
- cost
- by

Workflow:

- add transaction from detail page
- return success toast to the same page

## 7.18 Instruments

Purpose:

- manage the equipment fleet

Listing columns:

- name
- last service on
- calibrated?
- next service on
- action

Header actions:

- Calibration Schedule
- New Instrument

Row actions:

- open
- edit
- delete

This is the fleet overview / registry screen.

## 7.19 Instrument Details

Purpose:

- single-instrument detail page with service records

Header actions:

- back
- new service
- print QR
- more menu with edit

Summary section shows:

- name
- description
- make
- unique key
- model number
- serial number
- QR code

Record tabs:

- Calibration
- Maintenance
- Breakdown
- Service

Current table is generic and placeholder-like, but represents service history records.

### New Service flow

Modal fields:

- type of service
  - Calibration
  - Breakdown
  - Maintenance
  - Service
- vendor
- next service on
- attachments
- details and summary

Validation:

- next service date required

## 7.20 New Instrument / Edit Instrument wizard

Purpose:

- create or maintain instrument master data and reminder configuration

Steps:

1. Basic Details
2. Calibration Details
3. Preventive Maintenance
4. Breakdown Details
5. Additional Details

### Basic Details

Fields:

- Name
- Unique Key
- Serial Number
- Make
- Model
- Allow Access to
- Description

### Calibration / PM / Breakdown steps

Shared scheduling pattern:

- Last Performed On
- Frequency (days)
- Remind Before days
- Reminder Frequency
- Remind To
- Template
- Workflow

### Additional Details

- Cost of Equipment
- Reference to Purchase file
- Current Location
- Manufacturer / Supplier

Edit mode behavior:

- prefilled values from existing instrument
- direct step navigation enabled

## 7.21 Trainings

Purpose:

- maintain training programs relevant to lab readiness and compliance

Listing columns:

- name
- description
- start date
- end date
- action

Action:

- open attendance

Example trainings:

- GLP Induction
- Instrument Calibration Basics
- Sample Handling & Storage
- Quality Documentation Review
- Method Validation Refresher

## 7.22 Training Attendance

Purpose:

- track session-level attendance timing for a training

Columns:

- serial number
- date
- in time
- out time
- action

Action:

- Mark Attendance

This is currently a simple attendance schedule page.

---

## 8. Cross-page workflows in detail

## 8.1 Create a new sample

Implemented in UI:

1. Open `Samples Workspace` or `All Samples`.
2. Click `New Sample`.
3. Complete wizard steps.
4. Save sample.
5. User lands on `Sample Details`.
6. Toast confirms creation.

Current limitations:

- no true persistence
- no backend-generated sample ID
- validation is intentionally bypassed

## 8.2 Edit an existing sample

Implemented in UI:

1. Open pending sample.
2. Click `Edit`.
3. Modify fields in wizard.
4. Save changes.
5. Return to sample details with success toast.

Restriction implied:

- editing is mainly available for pending samples

## 8.3 Send sample for review

Implemented in UI:

1. Open pending sample details.
2. Click `Send for Review`.
3. Select target reviewer/team.
4. Enter comments.
5. Submit.

Outcome:

- review request toast
- review-request state on page

## 8.4 Create jobs from test requests

Implemented in UI:

1. Open sample details.
2. Open `Test Requests`.
3. Enter create-job mode.
4. Select one or more unallocated requests.
5. choose assignee and reviewer
6. create job

Outcome:

- selected requests are removed from request list
- job appears in jobs list
- success toast shown

## 8.5 Allocate test requests

Implemented in UI:

1. From Test Requests home or sample-level Test Requests listing, click `Allocate`.
2. Review analyst/instrument/material tabs.
3. Select allocate-to, reviewer, instrument.
4. submit allocation

Outcome:

- status changes to `Result Under Testing`
- queue bucket may change to allocated-to-me

## 8.6 Add method and results to a test request

Implemented / partially implemented:

1. Open test request details.
2. Add method if needed.
3. Click `Add Results`.
4. Open datasheet.
5. Refresh or save datasheet.
6. Saving moves request to in-progress stage and shows a datasheet-updated toast.

Placeholder:

- the datasheet content itself is not yet built

## 8.7 Submit test request for review

Implemented in UI:

1. From in-progress test request detail, click `Send for Review`.
2. Answer remnant availability question.
3. Request moves to submitted state.
4. page switches to print-oriented action set

Implied business rule:

- remnant disposition is captured as part of final review handoff

## 8.8 Generate and finalize reports

Implemented flow:

1. From sample details, open COA/report flow.
2. Select report type.
3. Assign templates.
4. choose:
   - Generate -> opens temporary report
   - Finalise -> opens finalized report
5. From temporary report, user can finalize later.

Current limitations:

- report preview content is still placeholder text
- edit parameters action in finalized report is visible but not implemented

## 8.9 Retain and dispose remnants

Implemented in UI:

1. Open `All Samples`.
2. Switch to `Retained`.
3. Select one or more remnants.
4. Click dispose.
5. Add mandatory comment.
6. confirm disposal

Additional visible action:

- `Send for IQC`

Disposed remnants are then viewable under the `Disposed` tab with disposal date and remarks.

## 8.10 Manage materials

Implemented in UI:

1. Create material from materials listing.
2. open a material detail page.
3. Add inventory transactions.
4. Filter transactions by type.
5. print QR if needed.

## 8.11 Manage instruments

Implemented in UI:

1. Create instrument via 5-step wizard.
2. open instrument detail page.
3. add service record.
4. review service history by service category.
5. edit the instrument from detail page or list.

## 8.12 Record environment data

Implemented in UI:

1. open environment data
2. click `Add Data Log`
3. enter reading
4. submit
5. new row appears in table
6. logs can be deleted

## 8.13 Manage leave and trainings

Implemented in UI:

- add leave record with attachment constraints
- view leave rows
- open training attendance
- mark attendance from schedule rows

---

## 9. Product behaviors and rules inferred from the prototype

These rules are not always enforced technically, but the product clearly suggests them.

- Sample creation precedes test execution.
- Test requests belong to a sample.
- Jobs are created from test requests.
- Test requests move from unallocated -> under testing -> under approval/review -> approved/rejected.
- Completed samples unlock report generation/finalized report access.
- Retained and disposed are post-completion sample states or sub-lifecycles.
- Material, instrument, environment, and document issues feed an operational alert center.
- Leave and training affect workforce readiness and therefore allocation decisions.
- Instruments have recurring reminder logic for calibration, maintenance, and breakdown-related workflows.
- Report output can exist in multiple versions.

---

## 10. Known gaps in the current product implementation

## Backend and persistence

- no API integration
- no database persistence
- no authentication or authorization
- no route-based URLs

## Workflow completeness

- datasheet body is placeholder
- test request detail content area is placeholder
- temp/finalized report preview body is placeholder
- many secondary actions are visible but not wired

## Validation / business logic

- new sample validation is present conceptually but disabled
- several forms do not fully validate all fields
- no hard enforcement of status transitions beyond local state changes

## Operational realism

- dashboard metrics are derived from demo data
- some tables use mock or repeated values
- actions like print, remind all, calibration schedule, edit parameters, delete, and some view buttons are mainly UI affordances

---

## 11. What this product already does well

- clear end-to-end lab operations framing
- strong separation between sample management, execution queue, reporting, and support operations
- good visibility into queue states and alert states
- thoughtful handling of retained/disposed samples
- consistent modal and toast patterns
- reusable shells for multi-step master-data entry
- report flow structure is already mapped, even if content templates are pending

---

## 12. Recommended product framing

If this system were described to stakeholders today, the most accurate summary would be:

> LIMS V3 is a frontend prototype for a multi-module laboratory operations platform centered on sample intake, test request allocation, result entry, review/approval, report generation, and supporting readiness functions like materials, instruments, environment monitoring, leave, and training.

It is best understood as:

- a strong product prototype
- a workflow demonstrator
- a design/system-level rebuild of a LIMS UI

It is not yet a production-ready transactional system.

---

## 13. Short index of pages

- Dashboard
- Requests for me
- Test Requests
- Samples Workspace
- All Samples
- Sample Details
- New Sample / Edit Sample
- Test Requests Listing
- Test Request Details
- Datasheet
- COA Report Selection
- Temporary Report
- Finalized Report
- Environment Data
- Leave Records
- Materials
- Material Details
- Instruments
- Instrument Details
- New Instrument / Edit Instrument
- Trainings
- Training Attendance

