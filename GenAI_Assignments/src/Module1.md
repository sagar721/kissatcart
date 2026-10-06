---
title: "Assignment – Module 1: Introduction to Generative AI"
---

| | |
|---|---|
| **Name** | SAGAR KUMAR |
| **PRN** | SOE25BTAM29 |
| **Section** | A |
| **Institute** | Intellipaat School of Technology, Pune |
| **Subject** | Generative AI |
| **Submission** | Soft copy (LMS) |

---

# Q1. Understanding the Generative Nature of GenAI

**a) Which system is Generative AI?**
**System B** is Generative AI. It takes a text prompt and makes a brand-new image.

**b) Difference between the two systems**

| Point | System A | System B |
|---|---|---|
| Objective | Recognise and classify an existing image | Create new content from a description |
| Input | An image | A text prompt |
| Output | A label: "cat" or "dog" | A completely new image |
| Type | Discriminative (decides between options) | Generative (creates something new) |

In simple words: System A **looks and decides**, System B **imagines and creates**.

**c) Why is System B "generative" if it learns from existing data?**
System B learned from millions of existing images, but it does not copy any one of them. It learns patterns such as what a cat looks like, what a laboratory looks like, and what "futuristic" means. It then combines these patterns to make a new image that did not exist before. A student learns from many books and then writes their own essay. In the same way, learning from data does not mean copying it.

---

# Q2. Classifying AI Problems

| Scenario | Category | Reason |
|---|---|---|
| a) Game enemy reacts using fixed rules | **Artificial Intelligence (rule-based)** | The behaviour comes from "if-then" rules written by a programmer. Nothing is learned from data. |
| b) Predict next product from past purchases | **Machine Learning** | The system learns patterns from past data and makes a prediction. |
| c) Neural network finds disease patterns in medical images | **Deep Learning** | It uses a multi-layer neural network to find complex patterns in images. |
| d) Text description → new image | **Generative AI** | The output is new content that did not exist before. |

**Why these four are not separate technologies:**
They are like boxes inside boxes. **AI** is the biggest box. **ML** is a part of AI. **DL** is a part of ML. **GenAI** is mostly built using DL. So GenAI is still ML and still AI. Real products also mix them. For example, a shopping app may use ML to predict and GenAI to write a message.

---

# Q3. ML, DL and GenAI — Identifying the Difference

| System | a) Category | b) What it tries to do | c) Output |
|---|---|---|---|
| A: Spam detection | **ML** | Learn from labelled emails and decide if a new email is spam | A label: Spam / Not Spam |
| B: Objects in photos | **DL** | Use a deep neural network to recognise objects in an image | Labels / boxes such as "car", "person" |
| C: Writes a professional email | **GenAI** | Create a new email from a short instruction | New text (a full email) |

**Why System C is different:**
Systems A and B choose an answer from a **fixed set of options**, such as spam/not spam or car/dog. Their output is a prediction about something that already exists. System C produces **new, open-ended content**. Every email it writes can be different, and there is no fixed list of "correct" answers. That is the key difference: **predicting vs. creating**.

---

# Q4. Traditional AI vs Generative AI in a Real Situation

**a)** The **navigation app** (fastest route) is **Traditional AI**. The **polite message writer** is **GenAI**.

**b) Comparing their primary objective**

- The navigation app wants to find the **one best answer** (the shortest or fastest route) using maps, traffic data and algorithms.
- The message writer wants to **create new text** that is polite and fits the situation. Many different answers can be correct.

**c) Analysing/predicting vs creating**

- **Analysing/predicting:** The navigation app studies existing data (roads, traffic) and gives a result, such as "Take Route 2, 18 minutes". It does not create anything new.
- **Creating:** The GenAI tool writes a new message, for example: *"Dear Sir, I kindly request a two-day extension for my assignment due to…"*. This message did not exist before. GenAI wrote it word by word.

---

# Q5. Choosing the Appropriate GenAI Tool

| Task | Suitable Tool |
|---|---|
| a) Portfolio website | **Replit AI** (or Lovable / Bolt-type website builders) |
| b) Image for landing page | **DALL·E / Midjourney / Adobe Firefly** |
| c) Background song | **Suno AI** |
| d) Conversational help on a hard topic | **ChatGPT / Gemini** |
| e) Writing and modifying code | **GitHub Copilot** |
| f) Research and organise information | **Perplexity AI** (gives sources) / **NotebookLM** |

**Why (three choices explained):**

1. **GitHub Copilot for coding:** It works inside the code editor (VS Code). It suggests code while I type and understands the file I am working on. This saves time without leaving the editor.
2. **Perplexity for research:** It searches the web and shows **links to sources** with its answer. This lets me check the facts, which is very important for research.
3. **Suno for music:** It is made specially for music. It can create a full song with tune and instruments from a short text prompt. A chatbot like ChatGPT cannot do this.

---

# Q6. Selecting the Right AI Approach for a Business Problem

| Feature | i) Approach | ii) Reason | iii) Output type |
|---|---|---|---|
| a) Predict student dropout | **ML** | Learns from past student data (attendance, marks, logins) to predict risk | Prediction |
| b) Check if photo has a valid ID | **DL** | Images need a deep neural network (CNN) to recognise documents | Classification |
| c) Personal weekly study plan | **GenAI** | Needs new, personalised text based on goals | Newly generated content |
| d) Promotional poster | **GenAI** | Needs a new image/design | Newly generated content |
| e) Recommend courses | **ML** | Learns from previous activity (recommendation system) | Prediction |

**Where GenAI is NOT the best choice:**
**(a) Dropout prediction.** This needs an accurate, consistent and explainable number, such as "70% risk". A normal ML model trained on student data is cheaper and more reliable. It also gives the same answer every time. A GenAI model may give different answers each time and may hallucinate. It is also harder to explain why it made a decision.

---

# Q7. Designing an AI-Assisted Software Development Workflow

**Project:** Student Management Web App (Login, Registration, Dashboard, Profile, Contact)

| Stage | Tool | What I ask the AI |
|---|---|---|
| 1. Idea & planning | **ChatGPT** | "List the features, pages, database tables and tech stack for a student management web app." |
| 2. Research & comparison | **Gemini** | "Compare Flask vs Node.js for a beginner project. Which is easier to deploy?" |
| 3. Quick prototype | **Replit AI** | "Create a Flask app with login, registration, dashboard, profile and contact pages using SQLite." |
| 4. Writing/editing code | **GitHub Copilot** | Writing functions in VS Code, e.g. "validate the email and password on the registration form" |
| 5. Debugging | **ChatGPT / Copilot Chat** | Paste the error and ask: "Why does this error happen and how do I fix it?" |

**How I improve the generated output:**

- Read every file and understand it before keeping it.
- Ask follow-up prompts, such as "add password hashing" or "make the dashboard mobile-friendly".
- Rename variables, remove unused code and add comments.
- Change the design to match my own requirements.

**How I test the code:**

- **Manual testing:** Register a user, log in with right and wrong passwords, and open each page.
- **Edge cases:** Empty fields, wrong email format, a very long name, duplicate registration.
- **Unit tests:** Ask the AI to write tests (pytest), then run them myself.
- **Security check:** Make sure passwords are hashed and that SQL injection is not possible.

**Why AI-generated code should not be deployed without review:**
AI code can **look correct but still be wrong**. It may have hidden bugs or security holes, such as plain-text passwords or SQL injection. It may also use outdated libraries or miss edge cases. The AI does not take responsibility; the developer does. So every line must be reviewed and tested before it goes live.

---

# Q8. Improving an AI-Generated Prompt

**Original prompt:** "Make a good technical fest poster." (too vague)

**Improved prompt:**

> Create a vertical A3 poster for **"TechNova 2026"**, the annual technical fest of **Intellipaat School of Technology, Pune**.
> **Theme:** Artificial Intelligence and Future Technology.
> **Visual style:** Modern, futuristic, neon blue and purple on a dark background, with circuit lines and a glowing robot/AI brain in the centre.
> **Target audience:** Engineering college students (18–24 years).
> **Important elements:** Title "TechNova 2026" at the top in bold, dates "15–16 October 2026", event list (Hackathon, Coding Contest, Robo Race, AI Workshop), college name and logo space at the bottom, and a "Register Now" QR code space.
> **Mood:** Exciting, energetic and innovative.
> **Composition:** Title on top, main AI image in the centre, event list below it, college details in the footer. Keep text clear and readable with enough empty space.

**Why it is better:**

1. **Clear subject and theme:** The AI knows exactly what the fest is about.
2. **Style and mood are given:** The colours and feeling match what the student wants.
3. **All important text is listed:** Name, dates and events will appear on the poster.
4. **Layout is described:** The poster will be organised and easy to read.
5. **Less guessing for the AI:** A detailed prompt gives a useful result on the first try and needs fewer retries.

---

# Q9. GenAI Hallucination — Verification Scenario

**a) Limitation shown:** **Hallucination.** The AI made up false facts (fake founders, awards, events) and presented them as true.

**b) Why does a wrong answer sound convincing?**
An AI language model works by **predicting the next most likely word**. It learned how a university history *usually sounds*, so it writes in that style. It does not check a database of true facts. If it does not know the answer, it still produces fluent, confident text. Good grammar and confident tone do **not** mean the facts are correct.

**c) Verification process for students**

1. **Check if the topic is real:** Search for "XYZ University" on Google or Wikipedia.
2. **Use official sources:** The university's official website, government (UGC) lists, and news articles.
3. **Cross-check every fact:** Names, dates and awards must match **at least two trusted sources**.
4. **Ask the AI for sources:** Then open each link yourself. Never trust a source you have not opened.
5. **Remove anything you cannot verify.**
6. **Cite the sources** in your project.

**d) Two consequences of submitting unverified information**

1. **Loss of marks or a failing grade**, because the project contains false information.
2. **Academic integrity problems.** It may be treated as academic dishonesty and harm the student's reputation.

---

# Q10. Privacy and Responsible Use of GenAI

**a) Major risks**

- **Data leak:** Customer names, emails and phone numbers go to an outside company.
- **Breaking privacy laws:** For example, India's **DPDP Act 2023**, or GDPR for foreign customers.
- **Company secrets exposed:** Internal product information may be stored or used for training.
- **Loss of trust:** Customers and the company may lose trust, and I could lose my internship.

**b) What to remove or anonymise**

- Customer **names** → replace with "Customer 1, Customer 2…"
- **Email addresses** and **phone numbers** → delete them completely.
- **Internal product information** → remove it or use general terms ("Product A").
- Keep only the **complaint text**, which is what is needed for the summary.

**c) Steps before using GenAI with company data**

1. Read the **company's AI usage policy**.
2. **Ask my manager** for permission.
3. Use only **company-approved AI tools**, such as an enterprise version with data protection.
4. **Anonymise** the data first.
5. Share only the **minimum data needed**.
6. **Review the output** before sharing it.

**d) Convenience vs privacy**
Uploading the whole file is **quick and easy**, so productivity goes up. But it is **unsafe**, because private data leaves the company. Cleaning the data first takes more time but protects people. Saving 10 minutes is not worth a data leak that can cause legal trouble and loss of trust. Privacy must come first.

---

# Q11. GenAI as a Productivity and Learning Assistant

**7-Day GenAI-Assisted Interview Preparation Plan**

| Day | Topic |
|---|---|
| 1 | Programming fundamentals + weak-area test |
| 2–3 | Data structures (arrays, strings, linked list, stack, queue, trees) |
| 4 | SQL (joins, group by, subqueries) |
| 5 | Machine Learning basics |
| 6 | Common HR and technical interview questions |
| 7 | Full mock interview + revision |

**1. Finding weak areas**
Prompt: *"Give me a 20-question quiz covering Python, DSA, SQL and ML basics. Do not show the answers until I reply."* I answer, then ask the AI to mark my answers and list my weak topics.

**2. Customised practice questions**
Prompt: *"I am weak in linked lists and SQL joins. Give me 5 easy, 5 medium and 3 hard practice questions on each, like those asked in placement interviews."*

**3. Explanations at different levels**
Prompt: *"Explain recursion like I am 10 years old, then like a college student, then at interview level with an example."*

**4. Debugging code**
I paste my code and the error, and ask: *"Do not give me the full answer. Give me a hint about where the bug is."* Then I fix it myself and ask the AI to check.

**5. Mock interview**
Prompt: *"Act as a technical interviewer for a software engineer role. Ask me one question at a time. Wait for my answer, then give feedback and a score out of 10."*

**6. Verifying the AI's explanations**

- Check with trusted sources: official Python docs, GeeksforGeeks, W3Schools, textbooks.
- **Run the code myself** to see if it really works.
- Ask the AI the same question in a different way and compare the answers.
- Check with teachers or seniors if I am unsure.

**When GenAI can reduce learning:**
If I ask the AI to **solve every coding problem for me** and just read the answer, I feel like I understand it. But in the real interview I cannot solve it alone, because my brain never practised. GenAI should be used as a **teacher giving hints**, not as someone doing my homework.

---

# Q12. Comparing GenAI Tools for a Practical Requirement

| Stage | a) Tool | b) Why suitable | c) One limitation/risk |
|---|---|---|---|
| Research problem statement | **Perplexity AI** | Searches the web and gives answers with source links | Sources may be weak or outdated; still need to check them |
| Website prototype | **Replit AI** | Builds and runs a working web app from a prompt, all in the browser | Code may have bugs or security issues; needs review |
| Logo / visual | **DALL·E / Midjourney** | Creates unique images from text descriptions | Text inside images is often misspelled; copyright of the style can be unclear |
| Presentation video | **Synthesia / InVideo AI** | Turns a script into a video with AI voice and visuals | Voices can sound robotic; free plans add watermarks |
| Background music | **Suno AI** | Makes original music from a short prompt | Free-plan songs may have usage limits; quality can vary |
| Programming help | **GitHub Copilot / ChatGPT** | Suggests and explains code inside the editor | Can suggest wrong or insecure code; overuse slows learning |

---

# Q13. Designing a Responsible GenAI Solution for a College

**Role:** Junior AI Consultant — "Campus AI Assistant"

**1. What the system should be allowed to do**

- Explain academic concepts and solve doubts step by step.
- Give hints and explanations for programming errors.
- Suggest project ideas and learning resources.
- Give general career guidance (skills, roles, preparation tips).
- Answer questions about college rules **from official college documents**.

**2. What it must avoid**

- Writing full assignments or exam answers for submission.
- Giving medical, legal or mental-health advice (it should point to a counsellor instead).
- Sharing personal data of any student or staff member.
- Making final decisions on marks, admissions or discipline.
- Producing harmful, biased or offensive content.

**3. Questions that need a human**

- Marks, attendance, fees and exam rechecking.
- Mental health or personal problems → counsellor.
- Placement eligibility and official certificates.
- Complaints about harassment or discipline.
- Any question where the AI is not confident.

**4. Reducing hallucinations**

- Use **RAG (Retrieval-Augmented Generation)**: the AI answers only from verified college documents and syllabus.
- Show **sources** with each answer.
- Allow the AI to say **"I don't know, please contact the office."**
- Use a low temperature setting for factual answers.
- Review wrong answers regularly and improve the system.

**5. Protecting data**

- Login with college ID; role-based access.
- Do not store chats longer than needed; encrypt the data.
- Remove personal information before sending anything to the AI model.
- Use an enterprise AI plan where data is **not used for training**.
- Follow the **DPDP Act 2023**.

**6. Avoiding over-dependence**

- **"Hint mode" first:** The AI asks guiding questions before giving the full answer.
- A daily usage limit for assignment help.
- Encourage students to try first ("Show me your attempt").
- Teachers include AI-free activities: viva, lab tests, handwritten work.

**7. Metrics**

- **Accuracy:** Percentage of correct answers in sample tests.
- **Hallucination rate:** Percentage of answers with false information.
- **Student satisfaction:** Thumbs up/down and survey ratings.
- **Escalation rate:** How often a question needs a human.
- **Response time** and **daily active users**.
- **Learning impact:** Change in student marks/performance over time.

**Research Requirement — Extra Risks (not in module)**

1. **Unfair AI-plagiarism detection:** Research found that AI-text detectors often wrongly mark essays by **non-native English writers** as AI-written. This could lead to unfair punishment of students.
   *Source: Liang, W. et al. (2023), "GPT detectors are biased against non-native English writers", Patterns (Cell Press).*
2. **Unequal access and weakening of independent thinking:** UNESCO warns that GenAI in education can increase the gap between students who can pay for premium tools and those who cannot. It also warns that it can reduce students' own critical thinking. UNESCO recommends a minimum age of 13 and a human-centred approach.
   *Source: UNESCO (2023), "Guidance for Generative AI in Education and Research".*

---

# Q14. Designing a Hybrid AI Solution — Job-Oriented Case Study

**Developer's proposal:** "Use Generative AI for the entire system." **My evaluation:** Partly correct, but a **hybrid system** is better.

**1. Smaller components**

1. Data collection: clicks, searches, cart, purchases
2. Data cleaning and feature creation
3. Customer understanding (segments, interests)
4. Product recommendation/prediction
5. Product image understanding (optional)
6. Personalised message writing
7. Delivery (app notification, email) and feedback tracking

**2. Where ML fits**

- **Recommendation engine:** collaborative filtering or matrix factorisation to predict which products a customer may buy.
- **Customer segmentation** (clustering) and **purchase prediction**.
  ML is fast, cheap, accurate on structured data and easy to measure.

**3. Where DL fits**

- **Image similarity:** a CNN finds products that look similar to what the customer viewed.
- **Sequence models:** learn from the order of a customer's clicks during a session.

**4. Where GenAI adds value**

- Writing a **personalised, friendly message**, e.g. *"Hi Riya, the running shoes you liked are back in stock, and we think you'll love these matching socks too!"*
- Writing product descriptions in different languages.

**5. Why GenAI for everything is a bad idea**

- **Expensive and slow:** Running an LLM for millions of customers every day costs a lot.
- **Less accurate for prediction:** ML models trained on purchase data predict better.
- **Not consistent:** It may give different results each time and is hard to test.
- **Hallucination:** It may recommend products that do not exist or are out of stock.
- **Hard to explain:** It is difficult to know why a product was chosen.

**6. Risks of the system**

1. **Privacy:** Customer activity is personal data and must be protected.
2. **Wrong or made-up product details** in GenAI messages.
3. **Bias / filter bubble:** Showing only similar items, or treating some customer groups unfairly.
4. **Too many messages** can annoy customers (spam).
5. **Prompt injection:** Harmful text in product reviews could affect the message generator.

**Architecture Task — Conceptual Flow**

```
 [Customer Activity: clicks, searches, cart, orders]
                    |
                    v
      [Data Pipeline: collect + clean + store]
                    |
          +---------+----------+
          |                    |
          v                    v
 [ML Model:             [DL Model (optional):
  Recommendation         Image similarity /
  & Prediction]          session behaviour]
          |                    |
          +---------+----------+
                    v
   [Top 3 products + customer name + reason]
                    |
                    v
   [GenAI (LLM): write personalised message]
                    |
                    v
 [Safety check: correct product, price, stock,
           no private data, tone]
                    |
                    v
   [Send via App / Email / SMS to customer]
                    |
                    v
 [Feedback: opened? clicked? bought?] --> back to ML model
```

---

# Q15. GenAI and the Future of Software Development

**Interview answer: "Why should we hire junior developers if GenAI can write code?"**

Thank you for this question. GenAI has changed how software is built, but it has not removed the need for developers. It has changed what a good developer does. Let me explain why.

**How GenAI improves productivity**
First, GenAI saves a lot of time on **repetitive code**, such as forms, boilerplate, API calls and simple functions. Second, it is a fast **learning helper**: when I see a new library or an error message, it explains it in simple words. Third, it helps with **documentation and testing**. It can write comments, README files and basic unit tests, which developers often skip. Used well, a junior developer with AI can deliver faster than before.

**Risks of depending heavily on GenAI**
First, AI code can be **wrong but look right**. It may compile and still give wrong results. Second, it can be **insecure**, for example by putting user input straight into a SQL query or saving passwords in plain text. Third, a developer who copies without understanding **cannot maintain or debug** the code later. There are also licensing and privacy risks if company code is pasted into public tools.

**Why fundamentals still matter**
AI can write code, but someone must **decide if the code is correct**. To review code, I need to understand data structures, time complexity, databases, security and how systems connect. If I do not know the basics, I cannot tell good code from bad code. Fundamentals turn me from a **copy-paster** into an **engineer**.

**Practical example**
If I ask an AI to "write a login function", it may produce:
`query = "SELECT * FROM users WHERE name='" + username + "' AND pass='" + password + "'"`.
This works in testing, but it allows **SQL injection**. A hacker could type `' OR '1'='1` and log in without a password. It also stores passwords without hashing. A developer with fundamentals would use **parameterised queries** and **bcrypt hashing**. The AI's version "worked", but it was unsafe.

**How a professional should work with GenAI**
I treat AI like a **smart junior partner, not a boss**. I give it clear prompts, read every line it writes, run tests, and check security. I use it for first drafts and ideas, while I keep control of design decisions. I never paste secrets or customer data into public tools. And I take full responsibility for any code I commit.

**Skills a fresher should build**
Strong **programming fundamentals and DSA**; **debugging** and **code reviewing**; **testing**; **system design basics**; **security awareness**; **prompt engineering**; and **communication** — understanding what the client actually needs. Most of all, the ability to **keep learning**, because the tools will keep changing.

**Conclusion**
GenAI does not replace junior developers. It replaces developers who **refuse to learn**. A junior developer who understands the fundamentals and uses AI wisely brings speed, judgement and responsibility. A tool alone cannot provide those three things together, and that is why companies should still hire junior developers.

*(≈ 620 words)*

**Research Requirement — Industry Example**

**Example:** The **Stack Overflow Developer Survey 2024** found that **76% of developers** are using or planning to use AI tools in their work. However, only about **43% trust the accuracy** of AI tools, and many said AI struggles with complex tasks.

**What it shows:** AI is now a normal part of a developer's job, but professionals **do not blindly trust it**. They still review and verify its output. This matches my answer: AI increases speed, and human skills ensure correctness.

*Source: Stack Overflow (2024). "2024 Developer Survey – AI section". survey.stackoverflow.co/2024/ai*

*Supporting study:* Pearce, H. et al. (2022). "Asleep at the Keyboard? Assessing the Security of GitHub Copilot's Code Contributions", IEEE Symposium on Security and Privacy. About **40%** of the programs Copilot generated in the test scenarios had security weaknesses.

---

*— End of Module 1 Assignment —*
