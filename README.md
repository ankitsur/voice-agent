# AI Voice Agent Dashboard

A web application for configuring, testing, and reviewing AI voice agent calls for logistics dispatch operations. Built with React, TypeScript, FastAPI, and Supabase, integrated with Retell AI for voice capabilities.

## 🎯 Project Overview

This application enables non-technical administrators to:
- **Configure** AI agent behavior through a simple UI
- **Trigger** test calls with driver details
- **Review** structured call summaries and full transcripts

## 🎬 Demo

The application supports two main scenarios:

### Scenario 1: Driver Check-in
Standard dispatch check-in collecting status, location, ETA, and POD confirmation.

### Scenario 2: Emergency Protocol  
Automatic detection of emergencies (accident, breakdown, medical) with immediate escalation.

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Backend | FastAPI (Python 3.9+) |
| Database | Supabase (PostgreSQL) |
| Voice AI | Retell AI |

## 📋 Prerequisites

- Node.js 18+
- Python 3.9+
- Supabase account ([supabase.com](https://supabase.com))
- Retell AI account ([retellai.com](https://retellai.com))

## 🚀 Quick Start

### 1. Clone & Setup Backend

```bash
git clone <repository-url>
cd voiceagent/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
RETELL_API_KEY=your-retell-api-key
RETELL_AGENT_ID=agent_xxxxxxxx
EOF

# Start server
python -m uvicorn main:app --reload --port 8000
```

### 2. Setup Frontend

```bash
cd ../frontend
npm install
npm run dev
```

### 3. Setup Supabase Database

Run this SQL in your Supabase SQL Editor:

```sql
-- Agent Configurations
CREATE TABLE agent_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calls
CREATE TABLE calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_config_id UUID REFERENCES agent_configs(id),
  driver_name TEXT NOT NULL,
  driver_phone TEXT NOT NULL,
  load_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  retell_call_id TEXT,
  metadata JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. Configure Retell AI

1. Create an agent in [Retell Dashboard](https://dashboard.retellai.com)
2. Set the **First Message**:
   ```
   Hi {{driver_name}}, this is Dispatch calling with a check call on load {{load_number}}. How's everything going out there?
   ```
3. Set the **Agent Prompt** (see full prompt below)
4. Enable **Backchanneling** and set **Filler Words** to Medium
5. Copy the Agent ID to your `.env` file

## 📱 Usage

1. Open http://localhost:5173
2. **Configure Agent** → Create/edit agent configurations
3. **Start Call** → Enter driver details and begin test call
4. **Call Results** → View structured data and transcripts

## 🤖 Retell AI Configuration

### Agent Prompt

```
You are an AI dispatch agent named "Dispatch" for a logistics company. You are calling driver {{driver_name}} about load number {{load_number}}.

## YOUR PERSONALITY
- Professional but friendly, like a helpful colleague
- Keep responses short and conversational (1-2 sentences max)
- Use natural speech patterns, not robotic

## STANDARD CHECK-IN FLOW
After greeting, gather the following information naturally:

1. DRIVER STATUS - Ask: "What's your current status on that load?"
2. LOCATION - Ask: "And where are you at right now?"
3. ETA - If not arrived, ask: "What's your ETA looking like?"
4. DELAYS - If they mention delay, ask: "What's causing the holdup?"
5. POD REMINDER - If arrived/unloading, say: "Don't forget to send over that proof of delivery when you're done."

## EMERGENCY PROTOCOL - HIGHEST PRIORITY
If the driver mentions: accident, crash, blowout, breakdown, emergency, hurt, injured, medical, fire, stuck, collision, wreck

IMMEDIATELY:
1. Say: "I'm really sorry to hear that. Let me get some information so we can help you right away."
2. Ask: "Can you tell me what happened? Was it an accident, a breakdown, or something else?"
3. Ask: "Is everyone okay? Are you in a safe location right now?"
4. Ask: "Are there any injuries I need to know about?"
5. Ask: "What's your exact location? Highway, mile marker, or nearest exit?"
6. Ask: "Is the load secure, or is there any damage to the cargo?"
7. Say: "Okay {{driver_name}}, I've got all that. I'm connecting you to a human dispatcher right now."

## HANDLING DIFFICULT SITUATIONS

UNCOOPERATIVE DRIVER:
- First: Rephrase and ask more specifically
- Second: Be direct but friendly
- After 3 attempts: "Alright, I'll note that we couldn't get a full update. Drive safe."

NOISY/UNCLEAR AUDIO:
- First: "Sorry, I didn't quite catch that. Could you say that again?"
- Second: "Still having trouble hearing you. One more time?"
- If still unclear: "The connection's rough. I'm going to transfer you to dispatch."

GPS/LOCATION CONFLICT:
- "Just to make sure I have it right - you said you're near [location]? Our system was showing something different, just wanted to double-check."

## ENDING THE CALL
- Normal: "Alright, thanks for the update {{driver_name}}. Drive safe out there!"
- Emergency: "Help is on the way. Stay safe."
```

### Post-Call Analysis Schema

Add this to Retell's Post-Call Analysis:

```
Extract the following from the conversation as JSON:

For NORMAL calls:
- call_type: "normal"
- call_outcome: "In-Transit Update" | "Arrival Confirmation" | "Delayed Update"
- driver_status: "Driving" | "Delayed" | "Arrived" | "Unloading" | "Unknown"
- current_location: string or null
- eta: string or null
- delay_reason: string or "None"
- pod_reminder_acknowledged: true or false

For EMERGENCY calls (if any emergency keyword detected):
- call_type: "emergency"
- call_outcome: "Emergency Escalation"
- emergency_type: "Accident" | "Breakdown" | "Medical" | "Other"
- safety_status: string or null
- injury_status: string or null
- emergency_location: string or null
- load_secure: true or false or null
```

## 📁 Project Structure

```
voiceagent/
├── backend/
│   ├── api/
│   │   ├── agent_configs.py   # CRUD for agent configs
│   │   ├── calls.py           # List/get/delete calls
│   │   ├── start_call.py      # Initiate Retell web calls
│   │   └── webhook.py         # Retell webhook handler
│   ├── services/
│   │   └── postprocess.py     # Structured data extraction
│   ├── main.py                # FastAPI app entry point
│   ├── supabase_client.py     # Database client
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── api/               # API client functions
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Page components
│   │   └── types/             # TypeScript types
│   └── package.json
└── README.md
```

## 🔗 API Endpoints

All endpoints prefixed with `/api/v1` except webhooks.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/agent-configs` | List all configs |
| POST | `/api/v1/agent-configs` | Create config |
| GET | `/api/v1/agent-configs/{id}` | Get config |
| PUT | `/api/v1/agent-configs/{id}` | Update config |
| DELETE | `/api/v1/agent-configs/{id}` | Delete config |
| DELETE | `/api/v1/agent-configs` | Bulk delete configs |
| POST | `/api/v1/start-call` | Start web call |
| GET | `/api/v1/calls` | List all calls |
| GET | `/api/v1/calls/{id}` | Get call details |
| DELETE | `/api/v1/calls/{id}` | Delete call |
| DELETE | `/api/v1/calls` | Bulk delete calls |
| POST | `/webhooks/retell` | Retell webhook |

## 🎨 Design Choices

1. **Web Calls vs Phone Calls**: Used Retell's web call feature for testing without requiring US phone numbers. The user speaks as the driver through their browser microphone.

2. **Single Agent Architecture**: One Retell agent handles both check-in and emergency scenarios dynamically based on conversation context.

3. **Dual Extraction Strategy**: 
   - Primary: Retell's post-call LLM analysis
   - Fallback: Backend regex-based extraction

4. **API Versioning**: All API routes use `/api/v1` prefix for future compatibility.

5. **Type Safety**: Full TypeScript on frontend, Pydantic models on backend.

## 🔧 Voice Configuration

Optimized for realistic conversation:

| Setting | Value | Purpose |
|---------|-------|---------|
| Backchanneling | Enabled | Natural "uh-huh", "I see" responses |
| Filler Words | Medium | Human-like speech patterns |
| Interruption Sensitivity | 70-80% | Allow natural interruptions |

## ✨ Features

- **Agent Configuration**: Define prompts, emergency triggers
- **Test Calls**: Browser-based web calls via Retell AI
- **Structured Results**: Key-value summaries from calls
- **Full Transcripts**: Complete conversation history
- **Bulk Operations**: Select and delete multiple records
- **Dark Mode**: Full dark theme support
- **Responsive Design**: Works on all screen sizes

## 🧪 Testing Scenarios

### Test Normal Check-in:
1. Start a call
2. Respond as a driver: "Yeah, I'm on I-10 near Phoenix, should be there around 8 AM"
3. View structured data showing location and ETA

### Test Emergency:
1. Start a call
2. Respond: "I just had a blowout on I-15"
3. Answer safety/injury/location questions
4. View emergency-specific structured data

## 📝 License

MIT

---

Built with ❤️ using AI-assisted development
