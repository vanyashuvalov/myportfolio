---
title: Dispatcher Workspace for a High-Load Logistics TMS
slug: logistics-ux-pattern
category: work
status: published

year: 2023
duration: 3 months
client: Large Freight Forwarder
role: Product Designer
team: [Product Designer (Me) | 1, Business Analyst | 1, Project Manager | 1, FE / BE / Tech Lead | 3]

description: Created a dispatcher workspace with vertical kanban for shipment management
hero_image: /assets/projects/logistics-ux-pattern/images/hero.jpg
thumbnail: /assets/projects/logistics-ux-pattern/images/hero.jpg

meta_title: Vertical Kanban for Dispatchers - UX Case Study
meta_description: How vertical kanban improved dispatcher efficiency by 35%
og_image: /assets/projects/logistics-ux-pattern/images/hero.jpg

tags: [UX Design, Logistics, B2B, TMS, Research]
skills: [User Research, Interaction Design, Prototyping, Field Studies]
industry: Logistics
project_type: B2B SaaS

featured: true
show_in_portfolio: true
selected: true
order: 1
color_theme: "#3B82F6"
---

---

## Context

The client was a large **freight forwarder**, 10+ billion revenue, multimodal shipments across CIS and internationally, both contracted and owned transport, large (thousands) customer and carrier base, multiple offices in different cities

::: problemsolution
Problem | Dispatchers handle multiple tasks simultaneously and do not have a single, convenient tool for solving them, which complicates employee onboarding and slows down the work process.
Solution | Implementation of a unified dispatching tool in TMS
:::

### Result

Created a dispatcher workspace where the core UX is built around **vertical kanban**. 10+ in-depth interviews with company dispatchers and managers from other companies

::: stats
- **-2%** Failed shipments
- **-10%** Delays against plan
- **+35%** Shipments per dispatcher
- **10** Testing sessions
:::

![App Overview](assets\projects\logistics-ux-pattern\images\dispatch-mobilederklight.jpg)

---

## Research

#### Subject

Dispatchers are the key to **quality** shipment execution
The contracted transport department always has more workload than anywhere else, especially for dispatchers
While logistics coordinators call carriers, request transport, and coordinate with clients only at the beginning, dispatchers spend all this time on routine and calls
So this is simultaneously complex and critical work that must be addressed in TMS (Transportation Management System)
A dispatcher's workspace consists of:
- Two phones
- About a hundred tabs
- Notes and spreadsheets
- Constant contact with colleagues
- Noisy office
- Some snack food
Dispatchers communicate and exchange current statuses with logistics coordinators and managers across multiple channels simultaneously: WhatsApp, Telegram, Bitrix, offline

::: callout
The challenge is to focus the dispatcher's **full attention** on urgent shipments and engage him in every way possible
:::

![Moodboard](assets\projects\logistics-ux-pattern\images\dispatch-moodboard.jpg)

#### Process

There wasn't much information on internal processes, so we needed to gather and structure it
I went to the office and saw how tough it is for zoomer dispatchers when instead of TikTok, a bunch of tabs flash on screen, and ringing from unclear foreign driver speech fills their ears against highway noise
- Spent 3 days in the office, observed work and interaction processes, studied staff composition and regulations
- Parallelly conducted calls with other freight forwarding companies to learn how they structure their dispatching processes
- After processing all inputs, created and sent a questionnaire to 30 dispatchers and logistics coordinators to address new questions while validating hypotheses

::: stats
- **3** Days in the office
- **10** Testing sessions
- **50** Respondents
:::

#### Dispatcher Time Destribution

::: piechart
- 40% | Shipment handling and driver communication | 3.2 hours
- 20% | Status updates in systems | 1.6 hours
- 15% | Coordination with logistics | 1.2 hours
- 10% | Crisis management | 0.8 hours
- 10% | Documentation | 0.8 hours
- 5% | Other | 0.4 hours
:::

#### Research Output

The dispatcher is the backbone of shipment execution, with **~40%** of dispatcher time spent on shipment handling, driver communication, and status updates in tracking systems

::: gallery
2
![Chart](assets\projects\logistics-ux-pattern\images\dispatch-chart.jpg)
![Chart](assets\projects\logistics-ux-pattern\images\dispatch-chartbypen.jpg)

2
![Caption](assets\projects\logistics-ux-pattern\images\dispatch-jirascreen.jpg)
![Caption](assets\projects\logistics-ux-pattern\images\dispatch-metricks.jpg)

1
![Caption](assets\projects\logistics-ux-pattern\images\dispatch-userflowoverall.jpg)
:::

---

## Design

#### Prototype

I wireframed scenarios in Gemini — this is many times faster than prototyping in Figma. I tested real interaction again offline in the office

#### I Flipped Kanban

Describing these rules:
- Upcoming tasks are always several times more, they are placed at the bottom of the list
- When the task's "timer" comes due, it moves up to the "Current" level
- When the timer expires or in urgent situations, the task moves even higher to "Urgent"

| 🔴 Urgent | The event is scheduled to start/end in 30 minutes |
| 🟡 Current | The event time remaining is <30 minutes / Checking the movement of long (more than 1 day) transits |
| ⚫ Upcoming | Overdue according to the planned time / Force majeure |

The concept of task "relevance" is our own, so we grounded it on regulations that the company can configure in TMS, specifically:
- How often and why the dispatcher should call the driver
- How much time before an event the dispatcher should call the driver
- How often the dispatcher should call the driver during long transits
- Whether dispatchers can transfer shipments to each other
- and more

The dispatcher handles a large number of shipments per day—up to 50. But at any given time, the most urgent ones requiring a follow-up call number **at most 5**

::: callout
That's why a **Kanban board** with a width that fits up to 4 cards is ideal, and the space left by one highlighted card creates "breathing room" to provoke maximum focus
:::

::: gallery
1
![Caption](assets\projects\logistics-ux-pattern\images\dispatch-largescreen.jpg)

2
![Chart](assets\projects\logistics-ux-pattern\images\dispatch-barbuttons.jpg)
![Chart](assets\projects\logistics-ux-pattern\images\dispatch-uielements.jpg)

2
![Caption](assets\projects\logistics-ux-pattern\images\dispatch-statuses.jpg)
![Caption](assets\projects\logistics-ux-pattern\images\dispatch-compactview.jpg)
:::


::: quote Kristina, dispatcher trainee
I used to constantly fear missing something. Now the system itself shows what's urgent. Work became calmer and faster
:::

By the way, while we were building production, respondents several times asked managers **"When will you release that thing you showed us?"** I like this result too 💗 
