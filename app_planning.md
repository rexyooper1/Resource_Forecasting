# Engineering Manager application thoughts

## This document outlines stakeholder thoughts on an app to support an engineering manager's daily tasks. The user works at an engineering services firm comrised of mechanical engineers, electrical engineers, designers, project managers and business development program managers. Their roles are:

* Business Development program managers are at the front end of bringing projects in and winning business. They work with current and prospective clients and write proposals to support work. During the proposal and planninng process, there is a need to communicate labor support needs. There is currently no good way to do that. They either communicate a labor need directly to the engineering manager or create a project in our ERP and schedule actual employees to reflect the labor category need (LCAT). It is difficult for me to keep track of the potential future demand for LCATs as it's either 1. not capture anywhere, or 2. captured as possiible work for current staff. I manually exprort data out of the ERP and filter out the 'Preliminary' projects. Business developement program manamagers can assign a '% chance of wining' to projects that are entered into the ERP for Preliminary projects. Again, the don't enter every Preliminary project into the ERP and that labor demand is communicated in a million different ways; it is not captured. 
*Project Managers run projects that we have won. The need to track scope, deliverables, risk, schedule, budget and spening, and tasking of the team. They also need to communicate project status to clients. 
*Mechanical engineers, electrical engineers, and designers do work. They need to know waht their current assigned tasks are, when they are due, and they need to be able to status those tasks (Todo, WIP, complete, etc. )

* As an engineering manager, I am responsible for the following:
    *Making staffing decisions regarding who to assign to projects. I also need to analzyae and potential future work and decide if we should increase or decrease the staff levels. This is very difficult w/o a better way to capture potential future demand witout having to schedule current staff members. 
    *The requests from Business Development program managers should include:
        *# of FTEs by LCAT, for example 2 Mechanical Engineers
        *# the SKILLS reqiured by LCAT. Today, we have no way to track the skills of employees in the ERP system where assignments and schedule data lives. It's in BambooHR. 
        *The period of performance for a project. 
        *If I knew the LCAT numbers , skills requjired, and period of performance, I couuld make better staffing and resource allocation decisions. 
    *I am also responsible for Project Managerment but initially I'd just like to develop a SaaS application to deal with the front end of projects to capture LCAT and skill needs on preliminary projects before they are awarded. Once that solution exists, we can add functionality for things like scope, schedule, cost, risk, and work management. 

## TECH STACK
* I am not experienced with full stack web development but I'm thinking of the following. I'm open to suggestions. As we add features over time, I want to make sure that the UI stays consistent. I WOULD LOVE TO BE ABLE TO DEVELOP A PMIS AND ENTERPRISE ERP OVER TIME.  Regarding shadcn/ui, I want to start with dark mode, and use the ORANGE Theme. 
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js Server Actions (implemented), JSON file persistence (current)
- **AI/LLM**: OpenAI GPT-4 for resource matching and recommendations (implemented)
- **Future**: Prisma ORM, PostgreSQL, NextAuth.js, additional AI agents for risk monitoring

Intitially we can work on the front end with a faked backend, but if it makes more sense to create the back-end first, we can do that. Feel free to make suggesions as I'm inexperienced with SaaS app development. Eventually, I'd like to deploy this project to be able to demo it to my management as far was what's possible for agnetic code developed SaaS applications. Use the frontend-design plugin. 