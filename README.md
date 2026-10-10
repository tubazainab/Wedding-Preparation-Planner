# 💍 Eternal Vows — Personal Wedding Preparation Planner

An elegant, modern, and responsive **Wedding Preparation Planner & Budget Tracker** built with pure **HTML5, CSS3, and Vanilla JavaScript**.

Designed with a romantic wedding aesthetic featuring soft blush, warm ivory, white, and rose-gold accents, this planner helps couples track their wedding budget, manage shopping checklists, monitor preparations, and maintain vendor notes seamlessly in **Indian Rupees (₹)**.

![Eternal Vows Wedding Planner](https://img.shields.io/badge/Wedding%20Planner-Vanilla%20JS-b76e79?style=for-the-badge)
![Currency](https://img.shields.io/badge/Currency-INR%20(%E2%82%B9)-d4a373?style=for-the-badge)
![Storage](https://img.shields.io/badge/Storage-Browser%20Local%20Storage-137333?style=for-the-badge)

---

## ✨ Features

### 1. 📊 Financial Dashboard
- **Total Wedding Budget**: Set and modify target budgets in Indian Rupees (₹).
- **Total Estimated Cost**: Real-time sum of projected costs across items and quantities.
- **Total Actual Spending**: Sum of paid purchases and recorded expenses.
- **Remaining Budget**: Automatic balance calculation with surplus/deficit indicators.
- **Budget Utilization Progress Bar**: Visual bar showing percentage of budget spent with alert threshold warnings.
- **Variance Tracking**: Automatic calculation showing whether you are under or over estimated budget.

### 2. 🗂️ Category-Wise Expense Breakdown
Detailed breakdown cards with spending progress for 13 wedding categories:
- Bridal Outfits
- Jewellery and Accessories
- Makeup and Skincare
- Haircare
- Footwear and Bags
- Groom's Shopping
- Wedding Gifts
- Household Items
- Wedding Decorations
- Food & Catering
- Travel & Stay
- Photography & Videography
- Other Expenses

### 3. 🛍️ Shopping Checklist & Expenses
- Add, edit, and delete items with:
  - Item name & notes
  - Category
  - Quantity
  - Estimated price (₹)
  - Actual price (₹, optional if pending)
  - Shop / Website name
  - Purchase status (*Pending*, *Purchased*, *Not Required*)
- One-click **Toggle Purchase Status** button.
- Real-time search across item names, shops, and notes.
- Filter by category and status tabs (*All*, *Pending*, *Purchased*, *Not Required*).
- Sort by cost (High to Low, Low to High), item name (A to Z), or status.
- **Remove All Items** button for a fresh start whenever needed.

### 4. 📋 Spreadsheet Sample Sheet & Bulk Import
- **Download Sample Sheet**: Pre-formatted `Wedding_Planner_Sample_Sheet.csv` template ready to open in Microsoft Excel or Google Sheets.
- **Bulk CSV Import**: Import your prepared CSV file in seconds with an interactive row preview and choice to append or replace items.

### 5. ✅ Preparation Tasks Manager
- Checklist of essential wedding preparation activities (outfit trials, MUA booking, invitations, photography contracts, etc.).
- Due dates with overdue date indicators.
- Priority levels (*High*, *Medium*, *Low*).
- Status filtering (*All*, *Pending*, *In Progress*, *Completed*).

### 6. 📖 Organizer's Notebook
- Dedicated cards for venue details, ceremony *Muhurat* schedules, vendor emergency contacts, and gift distribution lists.

### 7. 💾 Local Storage, Backup & CSV Export
- **100% Client-Side Privacy**: Data persists automatically in `localStorage` — no backend or paid API needed.
- **Export to CSV**: Download complete expense spreadsheets.
- **Backup & Restore (JSON)**: Save a backup file or transfer your data across devices.
- **Safe Reset**: Safe confirmation modals to avoid accidental data loss.

---

## 📁 Project Structure

```text
Wedding Preparation Planner/
├── index.html                        # Semantic layout and components
├── style.css                         # Elegant wedding theme styling
├── script.js                         # Application logic & local storage
├── Wedding_Planner_Sample_Sheet.csv  # Ready-to-use spreadsheet template
└── README.md                         # Project documentation
```

---

## 🚀 How to Run Locally

### Option 1: Direct File Open
Simply double-click `index.html` in Windows Explorer, or right-click and open with any modern browser (Chrome, Edge, Firefox, Brave, Safari).

### Option 2: Local HTTP Server
Using PowerShell or terminal:
```bash
npx serve .
```
Or with Python:
```bash
python -m http.server 3000
```
Then open `http://localhost:3000` in your browser.

---

## 🛠️ Built With

- **HTML5** — Semantic, accessible structure
- **Vanilla CSS3** — Custom properties (variables), Flexbox, CSS Grid, mobile-first responsiveness
- **Vanilla JavaScript (ES6+)** — Reactivity, DOM manipulation, CSV parsing, `localStorage`
- **Google Fonts** — *Playfair Display*, *Cinzel*, and *Plus Jakarta Sans*
- **Font Awesome 6** — Icons

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
