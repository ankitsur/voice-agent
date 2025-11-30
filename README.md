# AI Voice Agent Dashboard

A web application for configuring, testing, and reviewing AI voice agent calls for logistics dispatch operations.

## 🎯 Features

- **Agent Configuration UI** - Define prompts, voice settings, emergency logic, and edge case handling
- **Call Triggering** - Enter driver details and start test web calls via Retell AI
- **Call Results** - View structured data summaries and full transcripts after calls complete

## 🏗️ Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: FastAPI (Python)
- **Database**: Supabase (PostgreSQL)
- **Voice AI**: Retell AI

## 📋 Prerequisites

- Node.js 18+
- Python 3.9+
- Supabase account
- Retell AI account

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd voiceagent
```

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file with your credentials
cat > .env << EOF
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
RETELL_API_KEY=your-retell-api-key
RETELL_AGENT_ID=agent_xxxxxxxxxxxxxxxx
RETELL_WEBHOOK_URL=https://your-webhook-url/webhooks/retell
EOF

# Run the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

### 4. Supabase Database Setup

Create these tables in your Supabase project:

```sql
-- Agent Configurations
CREATE TABLE agent_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  config JSONB NOT NULL,
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

### 5. Retell AI Setup

1. Create an agent in the [Retell Dashboard](https://dashboard.retellai.com)
2. Configure the agent's prompt with variables: `{{driver_name}}` and `{{load_number}}`
3. Set the webhook URL to your backend endpoint: `https://your-url/webhooks/retell`
4. Copy the Agent ID and API Key to your `.env` file

## 📱 Usage

1. **Open the Dashboard**: http://localhost:5173
2. **Configure Agent**: Go to "Agent Configurations" to create or edit agent settings
3. **Start Call**: Go to "Start Call", select an agent, enter driver details, and click "Start Call"
4. **View Results**: After the call ends, go to "Call Results" to see structured data and transcript

## 🎙️ Implemented Scenarios

### Scenario 1: Dispatch Check-in Agent
- Handles routine driver check-ins
- Asks for status, location, ETA
- Handles: in-transit, delayed, arrived, unloading states
- Extracts: `driver_status`, `current_location`, `eta`, `delay_reason`, `unloading_status`, `pod_reminder_acknowledged`

### Scenario 2: Emergency Protocol Agent
- Detects emergency trigger phrases
- Immediately switches to emergency mode
- Collects safety, injury, location information
- Escalates to human dispatcher
- Extracts: `emergency_type`, `safety_status`, `injury_status`, `emergency_location`, `load_secure`, `escalation_status`

## 🔧 Edge Case Handling

The agents handle these special cases:

1. **Uncooperative Driver** - Probes for more info, ends call if unresponsive
2. **Noisy Environment** - Asks to repeat (limited retries), then escalates
3. **Conflicting Driver** - Handles GPS vs stated location discrepancy non-confrontationally

## 🎤 Voice Configuration

Optimized for realistic voice experience:
- **Backchanneling**: Enabled ("uh-huh", "I see")
- **Filler Words**: Medium frequency
- **Interruption Sensitivity**: 70-90%
- **Silence Threshold**: 600-800ms

## 📁 Project Structure

```
voiceagent/
├── backend/
│   ├── api/
│   │   ├── agent_configs.py  # CRUD for agent configs
│   │   ├── calls.py          # List/get calls
│   │   ├── start_call.py     # Initiate Retell calls
│   │   └── webhook.py        # Retell webhook handler
│   ├── services/
│   │   └── postprocess.py    # Transcript analysis
│   ├── main.py               # FastAPI app
│   └── supabase_client.py    # DB client
├── frontend/
│   ├── src/
│   │   ├── api/              # API client functions
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page components
│   │   └── types/            # TypeScript types
│   └── ...
└── README.md
```

## 🔗 API Endpoints

All API endpoints (except webhooks) are prefixed with `/api/v1`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/agent-configs` | List all agent configs |
| POST | `/api/v1/agent-configs` | Create agent config |
| GET | `/api/v1/agent-configs/{id}` | Get single config |
| PUT | `/api/v1/agent-configs/{id}` | Update config |
| DELETE | `/api/v1/agent-configs/{id}` | Delete config |
| POST | `/api/v1/start-call` | Initiate a web call |
| GET | `/api/v1/calls` | List all calls |
| GET | `/api/v1/calls/{id}` | Get call with transcript |
| POST | `/webhooks/retell` | Retell webhook (no prefix) |

## 🎨 Design Choices

1. **Web Calls over Phone Calls** - Used Retell's web call feature for testing without requiring US phone numbers
2. **Structured Data Extraction** - Post-processes transcripts to extract key-value pairs for easy review
3. **Dynamic Variables** - Passes driver name and load number to personalize each call
4. **Real-time Updates** - Webhook receives call completion data for immediate result display

## 📝 License

MIT

