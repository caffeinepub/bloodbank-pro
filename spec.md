# Blood Bank Management System

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Donor registration and management (CRUD)
- Blood collection and testing tracking (collection events linked to donors)
- Blood inventory management by blood group (A+, A-, B+, B-, AB+, AB-, O+, O-) with expiry date tracking
- Patient request and blood allocation system (manual approval by staff/admin)
- Admin dashboard with analytics: units by blood group, recent donations, pending requests, expiry alerts, low stock warnings, donor count
- Authentication system with two roles: Admin and Staff
  - Admin: full access (CRUD, reports, user management, delete)
  - Staff: can register donors, log collections, manage inventory, fulfill requests -- cannot delete records or access user management
- Low stock alerts (threshold: < 5 units per blood group)
- Blood expiry notifications (units expiring within 7 days)
- Search and filter system across donors, inventory, requests
- Responsive design
- Sample seed data: donors, inventory units, patient requests

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan

### Backend (Motoko)
- User/auth management via authorization component (Admin, Staff roles)
- Donors: id, name, age, gender, blood_group, phone, email, address, last_donation_date, registration_date
- Collections: id, donor_id, collection_date, volume_ml, test_status (pending/passed/failed), tested_by, notes
- Inventory: id, blood_group, units, collection_id, collected_date, expiry_date (collected_date + 42 days), status (available/reserved/used/expired)
- Patients: id, name, age, gender, blood_group, hospital, phone, request_date, urgency (normal/urgent/critical)
- Requests: id, patient_id, blood_group, units_needed, status (pending/approved/rejected/fulfilled), requested_date, allocated_inventory_ids, handled_by, notes
- Dashboard queries: inventory summary by blood group, recent 10 donations, pending requests count, expiry alerts (< 7 days), low stock (< 5 units), total donors

### Frontend (React + Tailwind)
- Login page (Admin/Staff)
- Sidebar navigation with role-based menu items
- Dashboard page with stat cards and charts
- Donors page: list, search/filter, add/edit/delete (admin), view details
- Collections page: log new collection, list with status, mark test result
- Inventory page: live stock by blood group, expiry tracker, low stock badges
- Patients page: register patient, list with search
- Requests page: new request, approve/reject/fulfill (admin), pending queue
- Reports page (admin only): summary tables, export-ready layout
- Alerts panel: low stock + expiry warnings in header/dashboard
