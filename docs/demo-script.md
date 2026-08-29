# CreditDNA — Demo Script

## Setup Before the Demo

1. Start backend: `uvicorn app.main:app --port 8000` (in `backend/`)
2. Seed Firestore: `python ml/seed.py` (or `python demo/reset_demo.py` to reset)
3. Start frontend: `npm run dev` (in `frontend/`, opens at http://localhost:5173)
4. Keep http://localhost:8000/docs open in a second tab (optional — for technical judges)


---

## Act 1: The Problem (30 seconds, verbal)

> "Traditional credit scores answer one question: 'Will this person miss a payment?' CreditDNA asks a different question: 'If life changes — job loss, a medical bill, a pay cut — will this person stay financially stable?' That's financial resilience. Let me show you."

---

## Act 2: Sign Up & Bank Connection (~1 minute)

1. **Navigate to http://localhost:3000** — the login page appears
2. Click **"New here? Create one"** → fill in name, email, password → **Create account**
3. The **Bank Connection** screen appears automatically
   - Point out: *"This is styled as a real consent flow — permissions summary, read-only access notice"*
   - Point out the **"Demo mode — simulated bank connection"** badge — transparency
4. Click the first account tile: **HDFC Bank — Aisha Verma ••••4821**
5. Review permissions → **Connect securely**
6. Dashboard loads ✓

---

## Act 3: Dashboard — Strong Profile (Aisha) (~2 minutes)

Point out each section top to bottom:

**Resilience Score**
> "Aisha scores **78/100** — Strong. She's a salaried professional, stable income for 3+ years, zero missed payments, ₹4.5L in savings. The score is a weighted composite of six financial dimensions."

**Sustainable Borrowing Limit**
> "She can sustainably borrow up to **₹7.2L** — not just 'maximum approved' but the amount that keeps her resilient even under stress."

**Financial DNA radar chart**
> "Six dimensions — click any bar to get the AI explanation."
- Click **Payment Discipline** bar → one-sentence Llama explanation appears
- Click **Cash-Flow Health** → another explanation

---

## Act 4: Switch Account — Contrasting Profile (Rahul) (~1 minute)

1. Click **"switch account"** (top right of connected account row)
2. Select **Axis Bank — Rahul Nair ••••3307**
3. Dashboard reloads with Rahul's data

> "Rahul is a freelancer. Irregular income, two missed payments last year, ₹35,000 in savings against ₹18,000/month EMI. His score is **~47/100 — Moderate/Weak**."

> "And his sustainable borrowing limit is much lower — **₹1.2L** — because his resilience can't support much additional debt safely."

> "Same system, radically different outputs. That's the value — it's not a binary approve/reject."

---

## Act 5: Stress Test — The Live AI Moment (~2 minutes)

1. Click the **Financial Stress Test** button at the bottom of the dashboard
2. (Still on Rahul's account — the weaker profile makes for a more dramatic demo)

**Scenario 1: Income Drop**
- Select **Income Drop**, set slider to **30%**
- Score updates live: drops to ~32
- Read aloud: *"8 months of runway before finances become strained"*
- Point to the **Llama explanation**: *"This is generated live by an LLaMA 3.1 8B model — not a template."*

**Scenario 2: Job Loss**
- Select **Job Loss** (100% income shock)
- Score drops dramatically → months_to_distress ~2
- *"Two months of savings. That's the reality of no financial buffer."*

**Scenario 3: Switch to Aisha, same job loss**
1. Go back → Dashboard → switch account to Aisha
2. Open Stress Test → Job Loss
- Score drops but stays higher → 9+ months runway
- *"Same shock, completely different outcome — because resilience is built over time."*

---

## Act 6: Loan Recommendation Detail (~30 seconds)

1. Go back to Aisha's Dashboard → click **Details** next to the borrowing limit
2. Show: sustainable limit, max safe EMI, recommended tenure, how-we-calculated section

> "We're not telling her 'you qualify for X'. We're telling her 'X is the amount that keeps you financially stable even if something goes wrong next month.'"

---

## Closing Line

> "CreditDNA doesn't replace the credit score. It adds the dimension lenders currently have to guess: financial resilience. For consumers, it's a financial health dashboard. For lenders, it's a risk layer that catches what CIBIL misses."

---

## Reset Mid-Demo

If you need a clean state:
```bash
python demo/reset_demo.py
```
All stress test results are wiped; both accounts return to original seeded scores.
