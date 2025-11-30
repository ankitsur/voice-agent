# AI Voice Agent Dashboard

A web application for configuring, testing, and reviewing AI voice agent calls for logistics dispatch operations. Built with React, TypeScript, FastAPI, and Supabase, integrated with Retell AI for voice capabilities.

## 🎯 Project Overview

This application enables non-technical administrators to:
- **Configure** AI agent behavior through a simple UI
- **Trigger** test calls with driver details
- **Review** structured call summaries and full transcripts

## 🎬 Demo Scenarios

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

### 4. Configure Retell AI Dashboard

In [Retell Dashboard](https://dashboard.retellai.com):

1. **Create a new agent**
2. **Set these placeholders** (the actual content comes from your UI):
   - **Agent Prompt**: `{{custom_prompt}}`
   - **First Message**: `{{first_message}}`
3. **Voice Settings** (recommended):
   - Enable **Backchanneling** (natural "uh-huh" responses)
   - Set **Filler Words** to Medium
   - Set **Interruption Sensitivity** to 70-80%
4. **Copy the Agent ID** to your `.env` file
5. **Configure Webhook URL**: `https://your-backend-url/webhooks/retell`

> **Note**: The prompts, first messages, and emergency triggers are all configured from the UI and passed dynamically to Retell AI at call time.

---

## 📱 How to Use the Application

### Home Screen
Navigate between the three main features using the dashboard cards:
- **Configure Agent** - Setup AI behavior
- **Start Call** - Begin a test call
- **Call Results** - Review completed calls

---

### Creating an Agent Configuration

1. Click **"Configure Agent"** from home or sidebar
2. Click **"+ Create New Configuration"**
3. Fill in the fields:
   - **Agent Name** - e.g., "Dispatch Check-in Agent"
   - **Description** - Brief description of the agent's purpose
   - **First Message** - Opening greeting (use `{{driver_name}}` and `{{load_number}}` placeholders)
   - **Agent Prompt** - Full instructions for the AI's behavior
   - **Post-Call Summary Prompt** - Instructions for extracting structured data
   - **Emergency Triggers** - Keywords that activate emergency protocol (add/remove as needed)
4. Click **"Create Configuration"**
5. Toast notification confirms success ✅

---

### Viewing/Editing Agent Configurations

1. Go to **"Agent Configurations"** page
2. **Select a configuration** by clicking its checkbox
3. Action buttons appear:
   - **Edit** - Opens configuration in edit mode (all fields editable)
   - **View** - Opens configuration in read-only mode (fields disabled)
   - **Delete** - Removes selected configuration(s)
4. **Bulk delete**: Select multiple configurations and click Delete

---

### Starting a Test Call

1. Click **"Start Call"** from home or sidebar
2. **Select an agent configuration** from the dropdown
3. Enter driver details:
   - **Driver Name** - e.g., "Mike Johnson"
   - **Driver Phone** - e.g., "+1 305 555 1983"
   - **Load Number** - e.g., "7891-B"
4. Click **"Start Call"**
5. **Allow microphone access** when prompted
6. **Speak as the driver** responding to dispatch
7. Green banner shows "Call in progress" with pulsing indicator
8. Click **"End Call"** when finished
9. Automatically redirects to Call Results page
10. Toast notification shows "Call connected!" and "Call finished!" ✅

---

### Viewing Call Results

1. Click **"Call Results"** from home or sidebar
2. See list of all completed calls with:
   - Call ID
   - Driver Name
   - Status
   - Date/Time
3. **Click a call** to view details:
   - **Structured Data** - Key-value pairs extracted from conversation
   - **Full Transcript** - Complete conversation history
4. **Delete calls**:
   - Select checkbox(es)
   - Click "Delete Selected"
   - Confirm in modal dialog

---

## ✨ UI Features

### Home Dashboard
- Three navigation cards with icons
- Quick access to all features
- Clean, responsive layout

### Agent Configurations Page
- List all existing configurations
- Create new configuration button
- Checkbox selection for single/multiple items
- Action bar with Edit, View, Delete buttons
- Bulk delete with confirmation modal
- Toast notifications for all actions

### Configure/Edit Page
- Agent Identity section (name, description)
- First Message with placeholder support
- Agent Prompt textarea
- Post-Call Summary Prompt
- Emergency Detection toggle
- Emergency Triggers with add/remove functionality
- View-only mode (all fields disabled)
- Save/Cancel buttons

### Test Call Page
- Agent configuration dropdown selector
- Driver details form (name, phone, load number)
- Start/End Call buttons with loading states
- Live call status banner with pulsing indicator
- Microphone integration via browser
- Auto-redirect to results after call ends
- Instructions section for guidance

### Call Results Page
- Table listing all calls
- Checkbox selection for bulk operations
- Floating action bar for delete/clear selection
- Click to view call details
- Custom confirmation modal for delete

### Call Detail Page
- Structured Data section with key-value display
- Full Transcript section
- Back to list navigation

### Global Features
- **Toast Notifications** - Success/error messages (top-right)
- **Confirmation Modals** - Custom dialogs for destructive actions
- **Dark Mode Support** - Full dark theme
- **Responsive Design** - Works on all screen sizes
- **Custom Favicon** - Branded browser tab icon

---

## 🔄 Dynamic Variables

The application passes these variables to Retell AI dynamically:

| Variable | Source | Description |
|----------|--------|-------------|
| `{{custom_prompt}}` | Agent Config → Prompt | Full agent instructions |
| `{{first_message}}` | Agent Config → First Message | Opening greeting |
| `{{emergency_triggers}}` | Agent Config → Triggers | Comma-separated keywords |
| `{{driver_name}}` | Test Call Form | Driver's name |
| `{{load_number}}` | Test Call Form | Load identifier |

---

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

---

## 🔗 API Endpoints

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

---

## 🎨 Design Choices

1. **Web Calls vs Phone Calls**: Used Retell's web call feature for testing without requiring US phone numbers. The user speaks as the driver through their browser microphone.

2. **Dynamic Configuration**: All prompts, first messages, and emergency triggers are configured via UI and passed to Retell at runtime—no code changes needed.

3. **Single Agent Architecture**: One Retell agent handles both check-in and emergency scenarios dynamically based on conversation context.

4. **Dual Extraction Strategy**: 
   - Primary: Retell's post-call LLM analysis
   - Fallback: Backend regex-based extraction

5. **Custom Modals**: Replaced browser alerts with custom confirmation dialogs for better UX.

6. **Type Safety**: Full TypeScript on frontend, Pydantic models on backend.

---

## 🧪 Testing Scenarios

### Test Normal Check-in:
1. Start a call
2. Respond as a driver: "Yeah, I'm on I-10 near Phoenix, about 2 hours out"
3. View structured data showing location and ETA

### Test Emergency:
1. Start a call
2. Respond: "I just had a blowout on I-15"
3. Answer safety/injury/location questions
4. View emergency-specific structured data

