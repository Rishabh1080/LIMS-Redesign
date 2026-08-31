# Bulk Sample Creation

## Purpose

Bulk Sample Creation is a spreadsheet-style workflow for creating many samples under one customer record. It is designed for batches where most metadata and testing requirements are shared, while one or more fields vary by sample.

This guide first explains the complete interface and then gives the exact workflow for creating 20 samples where only `#Make` differs. Each sample will still have its own system-generated Report No.; that identifier must remain unique even when all business data is otherwise the same.

## Opening bulk mode

1. Open the new base sample screen from Samples Workspace or All Samples.
2. Turn on the **Bulk sample creation** switch in the top toolbar.
3. The normal form-layout selector becomes disabled while bulk mode is active.
4. The page shows one shared **Customer Details** section followed by the bulk sample table.
5. Two sample rows are created by default, and Sample #1 starts expanded.

The top-right **Save Sample** button submits the entire batch, despite its singular label.

## Shared Customer Details

These values apply to the complete batch rather than to an individual table row:

- **Customer** — required. Search for and select an existing customer, or use the adjacent plus button to quick-add one.
- **Customer Quotation** — optional. It becomes available when the selected customer has quotations.
- **Receiving Date** — required and defaults to today.
- **Sample Type** — required and defaults to `Base`.
- **Customer Address** — required and is populated from the selected customer's billing address; it can be edited.

Complete or verify these fields before saving the batch.

## Table controls

Above the spreadsheet are four controls:

- **No. of samples** — use minus, plus, or type a whole number. Press Enter or leave the count field to apply a typed value. The minimum is one.
- **Auto-fill** — available when the batch contains at least three rows. It uses Sample #1 and Sample #2 as the pattern and fills rows 3 onward.
- **Undo** — reverts the most recent table Auto-fill where those generated values have not subsequently been changed.
- The count starts at two. Increasing it appends rows with new Report Nos.; reducing it removes rows from the end.

## Spreadsheet columns

The columns are ordered as follows:

1. **Category** — required dropdown.
2. **Product** — required dropdown.
3. **Parameters** — read-only count plus an expansion chevron. The count includes only nonblank testing rows.
4. **Report No.** — required and must be unique.
5. **Customer Ref.** — text.
6. **Sample Drawn By** — text.
7. **#Nature of Sample** — text.
8. **#Specification** — text.
9. **Stamped By** — text.
10. **#Heat No** — text.
11. **#PO No.** — text.
12. **#Make** — text.
13. **PO Sr No.** — text.
14. **Ref. Date** — date in `DD/MM/YYYY` format.
15. **Sample Size** — value and unit. Units are `g`, `kg`, `mg`, `ml`, `L`, and `Units`.
16. **Action** — Copy, Paste, and Delete.

### Report numbers

New rows receive Report Nos. in the form:

- `IICT/2026/0001`
- `IICT/2026/0002`
- `IICT/2026/0003`
- and so on.

Report Nos. are excluded from both table Auto-fill and row Paste. This is intentional: every destination row keeps its own identifier. Saving is blocked if a Report No. is blank or duplicated.

## Row expansion and testing details

Use either the chevron in **Sample #N** or the chevron in **Parameters** to expand a sample. Only one sample can be expanded at a time. Expansion and collapse animate over 200ms.

The expanded **Testing details** table contains:

- Parameter
- Test method
- Charges
- Estimated time
- Action

A new sample starts with one blank testing row. A completely blank row does not increase the Parameters count.

- Click **Parameter** to append another testing row.
- Use the trash action to remove a row; the sole remaining row cannot be deleted.
- **Auto-fill parameters** is disabled until both Category and Product are selected.
- Once enabled, **Auto-fill parameters** replaces that sample's testing rows with preset dummy test data.

Important distinction: the main table's **Auto-fill** does not fill or copy testing details. To repeat testing details across samples, use the row **Copy** and **Paste** actions.

## Copy, Paste, and Delete

Each row has three actions:

- **Copy** stores all of that row's sample metadata and nested testing details.
- **Paste** replaces the destination row's metadata and testing details with the copied content.
- **Delete** removes that row, unless it is the only remaining sample.

Paste deliberately preserves:

- the destination row's internal identity;
- the destination row's Report No.

Nested testing rows are deep-copied, so changing a parameter after pasting does not modify the source or other pasted samples.

## Auto-fill behavior

Auto-fill treats the first two rows as examples and fills rows 3 through the end of the batch.

- If Sample #1 and Sample #2 contain the same value, that value is repeated.
- If one numeric segment changes, the sequence continues while preserving surrounding text and zero-padding. For example, `MAKE-001` and `MAKE-002` produce `MAKE-003`, `MAKE-004`, and so on.
- Supported date sequences continue using the interval between the first two dates.
- If a value does not form a recognized sequence, the Sample #2 value is repeated.
- Parameters and Report No. are never changed.
- Sample Size is copied/extrapolated as a value/unit object.

After Auto-fill, **Undo** becomes available. Undo restores generated fields that still equal their generated values; manually edited values are protected from being overwritten by Undo.

## Exact workflow: 20 samples where only #Make differs

The most reliable and efficient workflow is: configure Sample #1 completely, duplicate it to the other rows, define the `#Make` pattern in the first two rows, and then Auto-fill that pattern.

For this example, the Make values will be `MAKE-001` through `MAKE-020`.

### 1. Enter shared customer information

1. Turn on **Bulk sample creation**.
2. In **Customer**, select the customer for the batch. If the customer does not exist, click the plus button, create it, and continue.
3. Optionally select a **Customer Quotation**.
4. Verify **Receiving Date**.
5. Verify **Sample Type**; it defaults to Base.
6. Verify or edit **Customer Address**.

### 2. Set the batch size to 20

1. Find **No. of samples** above the table.
2. Click its number field and replace `2` with `20`.
3. Press Enter, or click outside the number field.
4. Confirm the table now represents Sample #1 through Sample #20.

The new rows receive their own sequential Report Nos. automatically.

### 3. Complete Sample #1

1. In Sample #1, select **Category**.
2. Select **Product**.
3. Keep the generated **Report No.** unchanged unless there is a specific business requirement to edit it.
4. Fill every shared field that applies to all 20 samples:
   - Customer Ref.
   - Sample Drawn By
   - #Nature of Sample
   - #Specification
   - Stamped By
   - #Heat No
   - #PO No.
   - PO Sr No.
   - Ref. Date
   - Sample Size value and unit
5. In **#Make**, enter `MAKE-001`.

### 4. Configure Sample #1 testing details

1. Expand Sample #1 if it is not already open.
2. Because Category and Product are selected, **Auto-fill parameters** is enabled.
3. Either:
   - click **Auto-fill parameters** to load the preset testing rows; or
   - complete the blank testing row manually and use **Parameter** to add more tests.
4. Verify Parameter, Test method, Charges, and Estimated time.
5. Confirm the Parameters cell shows the number of nonblank tests.

### 5. Copy Sample #1 into Samples #2–#20

1. Click **Copy** in Sample #1's Action cell.
2. Click **Paste** in Sample #2.
3. Repeat Paste for Sample #3 through Sample #20.

After each Paste:

- all shared table fields are copied;
- all testing details are copied;
- each destination Report No. remains unchanged and unique.

At this stage every sample is identical except for its Report No. Sample #2 through Sample #20 temporarily also contain `MAKE-001`; the next steps create the Make sequence.

### 6. Establish the #Make sequence

1. Leave Sample #1 `#Make` as `MAKE-001`.
2. Change Sample #2 `#Make` to `MAKE-002`.
3. Do not manually edit Samples #3–#20 yet.

The numeric segment in the first two values tells Auto-fill how to continue the sequence.

### 7. Fill #Make for Samples #3–#20

1. Click the main **Auto-fill** button above the spreadsheet.
2. Auto-fill compares Samples #1 and #2.
3. Because every shared field is equal in those rows, it repeats those values through Samples #3–#20.
4. Because `#Make` changes from `MAKE-001` to `MAKE-002`, it generates:
   - Sample #3: `MAKE-003`
   - Sample #4: `MAKE-004`
   - …
   - Sample #20: `MAKE-020`
5. Report Nos. and testing details remain untouched.

If the generated pattern is wrong, click **Undo**, correct the first two `#Make` values, and click **Auto-fill** again.

### 8. Review the batch

Before saving:

1. Confirm the sample count is 20.
2. Confirm every row has Category, Product, and Report No.
3. Confirm every Report No. is unique.
4. Scan `#Make` and verify it runs from `MAKE-001` through `MAKE-020` without gaps or duplicates.
5. Expand a few samples and confirm their testing details were copied correctly.
6. Verify Sample Size, Ref. Date, and the remaining shared metadata.
7. Use the horizontal scrollbar to review off-screen columns. Data changes and parameter Auto-fill should not change its position; it moves only through deliberate horizontal scrolling or dragging.

### 9. Submit

1. Click **Save Sample** in the top toolbar.
2. If required data is missing, the affected Customer Details fields or table cells show validation errors. Correct them and save again.
3. On success, the application opens **All Samples**.
4. A success message reads **20 samples created**.

## Suggestions while entering data

When an empty field receives focus, it can show the most recently entered value from that column in light gray. Press Enter to accept it. If no remembered value exists in the current editing session, the nearest populated preceding row is used.

Suggestions support:

- text fields;
- Category and Product dropdowns;
- Ref. Date;
- both parts of Sample Size.

This is useful for occasional repeated values. For a 20-row batch with testing details, Copy/Paste plus Auto-fill is substantially faster.

## Validation and important limitations

### Submission-blocking validation

- Shared Customer, Receiving Date, Sample Type, and Customer Address are required.
- Every sample requires Category, Product, and Report No.
- Report No. must be unique across the batch.

### Behavior to remember

- Main Auto-fill requires at least three samples.
- Main Auto-fill uses only the first two samples as its pattern.
- Main Auto-fill does not copy parameters or change Report Nos.
- Parameter Auto-fill affects only the currently expanded sample.
- Paste copies parameters but preserves the destination Report No.
- Reducing the sample count removes rows from the end; review before doing so because their entered data is discarded.
- Only one row can be expanded at a time.
- The blank placeholder testing row counts as zero parameters.
- The custom horizontal scrollbar is mouse/touch operated and intentionally excluded from keyboard tab navigation.

## Performance with large batches

The table uses row virtualization: only visible rows, nearby overscan rows, and the active/closing expanded row are mounted. Collapsed testing-detail forms are not mounted for every sample. This keeps batches around 200 rows responsive while preserving the table's full scroll height. Horizontal scrolling updates the header and custom thumb through animation-frame synchronization rather than rerendering the table for every scroll pixel.