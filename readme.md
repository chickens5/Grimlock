# Grimlock 

##This project was made when I was working fulltime at a cannabis cultivation facility while pursuing my degree full time
  # - A Medium Scale Agriculture Management app that was built around Cannabis Cultivation

Welcome
<img width="1919" height="908" alt="Screenshot 2026-05-31 204029" src="https://github.com/user-attachments/assets/6874c28b-8a67-418e-8aa7-feab6df4dd10" />


I built this full-stack web application while I was working as a Cultivation Technician for Vibe Cannabis.

I orginally planned on deploying this through Heroku for backend management, but I left my position and
thus this has Full CRUD operations meant for a local enviornment.

Overall, is a great scaffold for plant management and eventually ML features for hydroponics.
=======
# Grimlock - Plant Research & JSX Art

A full-stack web application for agricultural management or for personal gorw tracking with ML-ready data architecture.

<img width="1906" height="906" alt="observ1" src="https://github.com/user-attachments/assets/1853ac53-e5e1-4d93-b4c8-09779d7406cd" />


## Project Overview

<img width="1917" height="901" alt="observ2" src="https://github.com/user-attachments/assets/8a507a7f-1e3c-4b50-aaf6-6ac355af0dda" />
<img width="1913" height="900" alt="observ3" src="https://github.com/user-attachments/assets/9c98c662-c635-4180-bd5f-50414ee176b3" />
<img width="1905" height="918" alt="Screenshot 2026-05-31 204126" src="https://github.com/user-attachments/assets/a75e31b3-81f9-4790-8b7e-b69beb7c81b5" />

**Current Status**: Frontend homepage with aurora animation + plant management UI
**Currently Implementing**: Data input forms, observation recording, local-only auth guidance, ML-ready structure



## Tech Stack

- **Frontend**: React 18 + Vite + OGL (WebGL)
- **Backend**: Express.js + Node.js
- **Database**: MongoDB
- **Styling**: CSS3 + WebGL shaders

## Local Security Model

This project is intentionally local-first. Write routes can be gated with `LOCAL_ADMIN_TOKEN`, and observation-specific reads/writes can be tightened with `OBSERVATION_READ_TOKEN` and `OBSERVATION_WRITE_TOKEN`.

For a private deployment, keep the backend on your own machine or another trusted host, store secrets only in `.env`, and use a MongoDB user with access limited to this app database.
