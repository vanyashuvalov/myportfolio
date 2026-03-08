---
title: New Immersive UX Pattern in Logistics
slug: logistics-ux-pattern
category: work
status: published

year: 2023
duration: 3 months
client: Large Freight Forwarder
role: Product Designer
team: [Product Designer, Business Analyst, Project Manager, Frontend Dev, Backend Dev, Tech Lead]

description: Created a dispatcher workspace with vertical kanban for shipment management
hero_image: /assets/projects/logistics-ux-pattern/images/hero.webp
thumbnail: /assets/projects/logistics-ux-pattern/images/hero.webp

meta_title: Vertical Kanban for Dispatchers - UX Case Study
meta_description: How vertical kanban improved dispatcher efficiency by 35%
og_image: assets\projects\logistics-ux-pattern\images\hero.webp

tags: [UX Design, Logistics, B2B, TMS, Research]
skills: [User Research, Interaction Design, Prototyping, Field Studies]
industry: Logistics
project_type: B2B SaaS

featured: true
show_in_portfolio: true
order: 3
color_theme: "#3B82F6"
---

## Summary

Created a dispatcher workspace where the core UX is built around **vertical kanban**

10+ in-depth interviews with company dispatchers and managers from other companies

::: stats
- **-2%** Failed shipments
- **-10%** Delays against plan
- **+35%** Shipments per dispatcher
- **10** Testing sessions
:::

**[NEEDED IMAGE: Screenshot of vertical kanban with shipment cards]**

## Client

Large freight forwarder, 10+ billion revenue, multimodal shipments across CIS and internationally, both contracted and owned transport, large (thousands) customer and carrier base, multiple offices in different cities

## Context

### Significance

Dispatchers are the key to quality shipment execution

The contracted transport department always has more workload than anywhere else, especially for dispatchers

While logistics coordinators call carriers, request transport, and coordinate with clients only at the beginning, dispatchers spend all this time on routine and calls

So this is simultaneously complex and critical work that must be addressed in TMS (Transportation Management System)

### How Dispatchers Work

A dispatcher's workspace consists of:

- Two phones
- About a hundred tabs
- Notes and spreadsheets
- Constant contact with colleagues
- Noisy office

Dispatchers communicate and exchange current statuses with logistics coordinators and managers across multiple channels simultaneously: WhatsApp, Telegram, Bitrix, offline

#### Dispatcher Time Distribution

::: piechart
- 40% | Shipment handling and driver communication | 3.2 hours
- 20% | Status updates in systems | 1.6 hours
- 15% | Coordination with logistics | 1.2 hours
- 10% | Crisis management | 0.8 hours
- 10% | Documentation | 0.8 hours
- 5% | Other | 0.4 hours
:::

| Task | Performance Factors | Time |
|------|---------------------|------|
| **Status Updates** | Scout on transport (geo-tracking), Mobile connectivity on the road, Driver communication | 20% |
| **Driver Coordination** | Driver phone, Road connectivity, Driver literacy | 20% |
| **Data Transfer** | Number of sources, Platform access, Human factor | 15% |
| **Colleague Coordination** | Colleague workload, Communication formats, Lunches and breaks | 15% |
| **Order Processing** | Customer changes, Crises, Different data sources | 10% |
| **TMS Updates** | Change frequency, Crises, Approvals | 10% |
| **Other** | Unexpected circumstances, Crises, Human factor | 10% |

### Summary

The dispatcher is the backbone of shipment execution, with ~40% of dispatcher time spent on shipment handling, driver communication, and status updates in tracking systems

## Task and Team

Create a clear dispatcher tool within TMS that:

- Simplifies interaction with logistics coordinators
- Accelerates shipment processing speed
- Provides performance reports

::: callout note
**Timeline**: 1 quarter = 3 months to release
:::

| Role | Count | Responsibility |
|------|-------|----------------|
| Product Designer | 1 (Me) | UX/UI design, research, prototyping |
| Business Analyst | 1 | Process analysis, requirements |
| Project Manager | 1 | Coordination, timeline, communication |
| Frontend Developer | 1 | Frontend development |
| Backend Developer | 1 | Backend development, API |
| Tech Lead | 1 | Architecture, code review |

## Process

### Problem Definition

The initiative originally came from stakeholders — there were several assumptions about what most affects the logistics office that can be automated

On the horizon were sections for security services, document management, and legacy redesign

We decided security services could wait since they still work through their own channels, document management wasn't critical since the platform is primarily for internal use

So we focused on a useful and necessary feature, since the logistics coordinators the MVP was dedicated to work directly with dispatchers, making it more convenient for them to interact on a unified platform

### Research

There wasn't much information on internal processes, so we needed to gather and structure it

I went to the **office** and saw how tough it is for zoomer dispatchers when instead of TikTok, a bunch of tabs flash on screen, and ringing from unclear foreign driver speech fills their ears against highway noise

- Spent 3 days in the office, observed work and interaction processes, studied staff composition and regulations
- Parallelly **conducted calls** with other freight forwarding companies to learn how they structure their dispatching processes
- After processing all inputs, **created and sent a questionnaire** to 30 dispatchers and logistics coordinators to address new questions while validating hypotheses

::: stats
- **3** days in office with dispatchers
- **10+** in-depth interviews
- **30** questionnaires sent
- **5** partner companies surveyed
- **120+** hours of observation
:::

There was a lot of content, we worked with business and development on the future architecture, structured requirements

**[NEEDED IMAGE: Architecture diagram or research map]**

### Hypothesis Set

The result was:

#### 1. Information Priority for Dispatcher

Order by frequency of use:

| Priority | Information | View Frequency |
|----------|-------------|----------------|
| 1 | Current cargo event and status | Every 5-10 min |
| 2 | Driver number | With every call |
| 3 | Route from-to | 3-5 times per day |
| 4 | Driver data | 2-3 times per day |
| 5 | Truck and trailer (number, brand) | 1-2 times per day |

#### 2. Time Zones

The dispatcher looks at the local time of the cargo event, not their own time zone, to coordinate the driver on timings

::: callout note
**Example**: A dispatcher in Moscow is handling a shipment in Vladivostok (+7 hours). They need to see local time 14:00, not Moscow time 07:00
:::

#### 3. Quick Status Capture

The dispatcher needs the ability to quickly call the driver and immediately capture status during the call

## Design (How I Flipped the Kanban)

Initially, the shipment process was represented entirely in a BPMN-like diagram

**[NEEDED IMAGE: BPMN diagram of shipment process]**

I identified **3 statuses** for task classification, the most important criterion being relevance:

| Status | Condition | Visual |
|--------|-----------|--------|
| 🔴 **Urgent** | Overdue by plan / Crisis | Red card, top of list |
| 🟡 **Current** | Until event <30 min / Transit check | Yellow card, middle |
| ⚫️ **Upcoming** | Until event >30 min | Gray card, bottom of list |

The concept of task and timings for events was drawn in a timeline diagram

**[NEEDED IMAGE: Timeline diagram with event timings]**

At the same time, the idea came to separate them visually, the choice fell on kanban

But classical kanban didn't fit well because the cards were large, causing important info to not fit on screen and risking losing current and urgent tasks

### So I Flipped the Kanban

Describing these rules:

- **Upcoming** tasks are always several times more, they are placed at the bottom of the list
- When the task's "timer" comes due, it moves up to the **"Current"** level
- When the timer expires or in urgent situations, the task moves even higher to **"Urgent"**

The concept of task "relevance" is our own, so we grounded it on regulations that **the company can configure** in TMS, specifically:

- How often and why the dispatcher should call the driver
- How much time before an event the dispatcher should call the driver
- How often the dispatcher should call the driver during long transits
- Whether dispatchers can transfer shipments to each other
- and more

### Prototype

I wireframed scenarios in Gemini — this is many times faster than prototyping in Figma

I tested real interaction again offline in the office

#### Testing Iterations

| Round | Participants | Issues Found | Status |
|-------|--------------|--------------|--------|
| 1 | 3 dispatchers | 12 critical | Redesign |
| 2 | 5 dispatchers | 8 medium | Refinement |
| 3 | 4 dispatchers | 3 minor | Polish |
| 4 | 8 dispatchers | 1 minor | Ready |

Total 10 sessions, feedback, design refinements, but main hypotheses were confirmed

## Solution

**[NEEDED IMAGE: Final dispatcher workspace interface]**

A section in TMS as the main dispatcher workspace with these **features**:

### Core Capabilities

| Category | Functions |
|----------|-----------|
| **Visualization** | Vertical kanban with prioritization; Cards with key information; Status color coding |
| **Time** | Local event time tracking; Base timezone settings; Timers until events |
| **Communication** | Quick driver call; Event comments; File attachments (bills, photos) |
| **Management** | Arrival/completion marking; Postpone task; Transfer to another dispatcher |
| **Analytics** | Task statistics; Change history; Management reports |
| **Integration** | Sync with 1C, Bitrix; Open map with geo-tracker; Shipment details on click |

### Detailed Features

::: callout note
**Key Feature**: Vertical kanban automatically moves urgent tasks to the top
:::

- Shipments and their tasks as cards containing all necessary dispatcher info + task completion time
- VERTICAL kanban of these cards with most urgent tasks at the top
- Overall task statistics for the period
- Notifications only for the dispatcher with push and sound alerts (configurable)
- Admin ability to configure task completion time according to regulations
- Tracking of transit (long — more than 1 day) shipments and driver movement check tasks

**[NEEDED IMAGE: Detailed shipment card view]**

## Results

::: stats
- **-2%** Failed shipments with dispatcher
- **-10%** Delays against planned time
- **+35%** Shipments per dispatcher
:::

### Before / After Comparison

| Metric | Before Implementation | After Implementation | Change |
|--------|----------------------|----------------------|--------|
| Failed shipments | 4.2% | 2.2% | -2% |
| Plan delays | 18% | 8% | -10% |
| Shipments per dispatcher | 23/month | 31/month | +35% |
| Time per task | 8 min | 5 min | -37% |
| Satisfaction | 6.2/10 | 8.7/10 | +40% |

### Data Sources

**Metric sources**:
- Median number of shipments per dispatcher over 1 month relative to total shipments
- Historical data on shipment closing plan/fact from 1C for each dispatcher working 3+ months
- Reports in TMS post-factum and reports from 1C
- Satisfaction surveys among dispatchers (NPS)

### Qualitative Feedback

::: quote Kristina, dispatcher trainee
I used to constantly fear missing something. Now the system itself shows what's urgent. Work became calmer and faster
:::

💗 By the way, while we were building production, respondents several times asked managers **"When will you add that thing you showed us?"** I like this result too

## Next Steps

**Near-term plans**:
- Important for scaling to design onboarding directly on the platform so seniors don't spend time training newcomers on the tool
- Test functionality on other offices and companies in the long term
- Add ability for drivers in the app to mark cargo events and upload attachments themselves
- Test the hypothesis of packaging the dispatching module as a separate product
- Check the product's impact on employee turnover

**Strategic hypotheses**:
- Package the dispatching module as a separate product
- Check the product's impact on employee turnover
- Try scaling the product to other companies

---

**Want to discuss UX for logistics?** [Write to me](https://t.me/vanyashuvalov)