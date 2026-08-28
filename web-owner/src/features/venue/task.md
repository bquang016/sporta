# Task List - Read-Only Pending Approval Detail View & Confirmation Modals

- [x] **Phase 1: Backend validations**
  - [x] Implement approval status checking in `updateVenue` and `updateVenueDraft` in `VenueService.java`
  - [x] Implement `cancelSubmitVenue` service method in `VenueService.java`
  - [x] Create POST `/api/v1/owner/venues/{id}/cancel-submit` mapping in `OwnerVenueController.java`

- [x] **Phase 2: Frontend Context & Wizard implementation**
  - [x] Support `isReadOnly` configuration in `VenueWizardContext.tsx`
  - [x] Adapt `VenueWizard.tsx` to handle read-only mode headers, steps and footers
  - [x] Bind `cancelVenueSubmission` API and export `cancelSubmission` in `VenueWizardContext.tsx`
  - [x] Integrate `Hủy gửi duyệt` button and `ConfirmModal` triggers inside `VenueWizard.tsx`
  - [x] Fix compilation type error (optional `startTime`/`endTime` parameters) in `VenueWizard.tsx`

- [x] **Phase 3: Card List & Dropdown updates**
  - [x] Revert `isPending` dropdown text change on `VenueList.tsx` line 52 and hide 3-dot dropdown menu entirely for pending venues
  - [x] Make full pending venue cards in `VenueList.tsx` clickable to open details view
  - [x] Hide `VenueRowMenu` dropdown in `OperationsSidebar.tsx` for pending review venues
  - [x] Make entire pending review row in `OperationsSidebar.tsx` clickable to open details view immediately instead of selecting it
  - [x] Add pending review placeholder state in main panel of `OperationsPage.tsx` to prevent showing courts/surcharges overview for pending venues
  - [x] Integrate `ConfirmModal` for deleting drafts inside `DraftFloater.tsx` instead of legacy `window.confirm`
  - [x] Fix missing `province`, `district`, `ward`, `addressDetail` fields in `useOperationsState.tsx` calls
  - [x] Redesign `ConfirmModal.tsx` to use unified styled `Button` components and fix low contrast cancel ghost button styling
  - [x] Build dedicated screen `VenuePendingDetailScreen.tsx` for review-pending venues, displaying information in a clean dashboard format without using draft wizard forms
  - [x] Implement dynamic courts image mapping and asynchronous price rules fetching in `VenuePendingDetailScreen.tsx`
  - [x] Update `AddCourtSubScreen.tsx` to use custom `CurrencyInput` component for "Giá thuê mặc định (VND/ca)"
  - [x] Route editing operations for all non-pending venues (`DRAFT`, `APPROVED`, `REJECTED`) through the 5-step `VenueWizard` component
  - [x] Clean up and delete unused `VenueFormScreen` component and state bindings
  - [x] Update `DataSeeder.java` mock venue builders with full coordinates, address sub-fields, shift duration, and approval status values
  - [x] Add error event listener on Goong map mapbox instances in `LocationPickerMap.tsx` to suppress tile server layer warning logs
  - [x] Guard wizard loadState using `isInitializedRef` to prevent double-initialization race conditions during async auto-saves

- [x] **Phase 4: Verification & Walkthrough**
  - [x] Verify both React and Java compilations
  - [x] Update `walkthrough.md` with read-only details and cancel submission updates
