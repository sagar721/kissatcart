---
title: "Assignment – Module 3: Prompt Engineering Fundamentals"
---

| | |
|---|---|
| **Name** | SAGAR KUMAR |
| **PRN** | SOE25BTAM29 |
| **Section** | A |
| **Institute** | Intellipaat School of Technology, Pune |
| **Subject** | Generative AI |
| **Submission** | Handwritten copy |

> *Note for writing: copy the text in boxes/quotes as the "prompt". Labels in **bold** (Instruction, Context, etc.) can be underlined in your handwritten copy.*

---

# Q1. Improve a Bad Prompt

**Bad prompt:** "Explain Python."

**Improved prompt (with labels):**

> **[Instruction]** Explain what Python is and why it is popular, and show how to write a simple program in it.
>
> **[Context]** I am a first-year B.Tech student with no programming experience. I am learning Python for my college course and future placements.
>
> **[Input Data]** Use this example program in your explanation:
> `name = input("Enter your name: ")`
> `print("Hello", name)`
>
> **[Output Indicator]** Give the answer in 5 short bullet points, followed by a line-by-line explanation of the example program. Keep it under 200 words and use simple English.

**The four parts:**

1. **Instruction** – tells the AI **what to do**.
2. **Context** – tells the AI **who I am and why** I need it.
3. **Input Data** – the **material** the AI should work on.
4. **Output Indicator** – the **format and length** of the answer.

---

# Q2. Create a CRAFT Prompt

**Topic:** Recursion in programming

> **[C – Context]** I am a B.Tech student preparing for my Programming semester exam next week. I understand loops and functions but find recursion confusing.
>
> **[R – Role]** Act as an experienced and patient computer science teacher.
>
> **[A – Action]** Explain what recursion is, how a recursive function works (base case and recursive case), and trace the factorial of 4 step by step.
>
> **[F – Format]** Use: (1) a 2-line definition, (2) a real-life example, (3) a short Python code example, (4) a step-by-step trace table, (5) three common mistakes, (6) two exam-style questions.
>
> **[T – Tone]** Simple, friendly and encouraging, like a teacher helping a student before an exam.

**Parts identified:**

- **C (Context):** student, exam next week, confused about recursion
- **R (Role):** experienced CS teacher
- **A (Action):** explain recursion and trace factorial(4)
- **F (Format):** definition, example, code, trace table, mistakes, questions
- **T (Tone):** simple, friendly, encouraging

---

# Q3. Demonstrate Hallucination Prevention

**1. Fictional Document**

> **Product: "SmartBottle Z1" by AquaTech (fictional)**
> **Section 1 – Overview:** SmartBottle Z1 is a smart water bottle that reminds users to drink water. It glows blue every 45 minutes.
> **Section 2 – Specifications:** Capacity: 750 ml. Material: stainless steel. Battery: lasts 20 days on one charge. Charging: USB-C.
> **Section 3 – App:** Works with the "AquaTrack" app on Android and iOS. The app shows daily water intake.
> **Section 4 – Price:** ₹1,999. Available in black, white and blue.

**2. Original prompt / questions**

> "Answer these questions about SmartBottle Z1:
> Q1. Is SmartBottle Z1 dishwasher safe?
> Q2. How long does the battery last?"

*(Possible problem: For Q1, the AI may guess "Yes, it is dishwasher safe", which is a **hallucination**, because the document never says this.)*

**3. Improved prompt**

> "Use **only** the document given below to answer the questions.
> Do **not** use any outside knowledge or make guesses.
> For each answer, mention the **section number** that supports it.
> If the answer is not in the document, reply exactly: **"Not available in the supplied material."**
> Document: [SmartBottle Z1 document]
> Q1. Is SmartBottle Z1 dishwasher safe?
> Q2. How long does the battery last?"

**4. AI's final responses**

> **Q1:** Not available in the supplied material.
> **Q2:** The battery lasts **20 days** on one charge. *(Supporting section: Section 2 – Specifications)*

**Result:** The improved prompt stopped the AI from guessing, so it gave only true, source-based answers.

---

# Q4. Good Prompt vs. Bad Prompt

**Bad prompt:** "Fix my code."

**Good prompt:**

> "I am a beginner learning Python. The function below should return the **average of a list of marks**, but it gives **ZeroDivisionError** when the list is empty.
>
> ```python
> def average(marks):
>     return sum(marks) / len(marks)
> print(average([]))
> ```
>
> **Goal:** Find the cause of the error and fix it so the function returns 0 for an empty list.
> **Constraints:** Use Python 3. Do not use any external libraries. Keep the function name the same. Make only the smallest change needed.
> **Output:** First explain the cause in 2 lines, then give the corrected code, then one test example."

**Three reasons why the new prompt is better:**

1. **Gives context** – the AI knows the language, my level, the code and the **exact error**, so it does not have to guess.
2. **Clear goal** – it says exactly what "fixed" means (return 0 for an empty list).
3. **Has constraints and output format** – no extra libraries, a small change, and an explanation followed by code. The answer is useful and easy to understand on the first try.

---

# Q5. Reduce the Iteration Loop

**Original prompt:** "Create a portfolio website."

**CRAFT prompt:**

> **[C – Context]** I am Sagar Kumar, a first-year B.Tech (AI & ML) student at Intellipaat School of Technology, Pune. I want a personal portfolio website to share with recruiters for internships. I know basic HTML, CSS and Python.
>
> **[R – Role]** Act as an expert front-end web developer and designer.
>
> **[A – Action]** Create a complete, responsive one-page portfolio website using only HTML, CSS and a little JavaScript (no frameworks).
>
> **[F – Format]** The website must have these sections: (1) Home with name, title and photo placeholder, (2) About Me, (3) Skills (Python, HTML, CSS, GenAI tools), (4) Projects – 3 project cards with title, description and GitHub link, (5) Education, (6) Contact form and social links. Give the code as two files: `index.html` and `style.css`, with comments. Then give 3 steps to host it free on GitHub Pages.
>
> **[T – Tone]** Professional, clean and modern design, with simple, friendly text for recruiters. Colour theme: dark blue and white.

**How this reduces follow-up prompts:**

- **Who I am** is clear → the AI writes suitable content the first time, so I don't have to say "make it for a student".
- **All sections are listed** → I don't need to ask again: "add projects" or "add contact".
- **Technology and file format are fixed** → I don't need to say "don't use React" or "split into files".
- **Tone and colours are given** → no need to ask: "make it look professional".
- **Hosting steps are included** → no extra question afterwards.

So instead of 5–6 rounds of "change this, add that", I get a **nearly complete website in one or two prompts**, which saves time.

---

*— End of Module 3 Assignment —*
