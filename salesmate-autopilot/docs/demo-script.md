# Demo Script

Target length: 5-8 minutes.

## 1. Sales Dashboard

Open the app and start from the dashboard.

Talk track:

"This is the daily workspace for an automotive sales consultant. The next arriving customer is Zhang, a first-time showroom visitor. SalesMate does not replace the consultant. It works as a low-interruption copilot embedded in the reception workflow."

Click `进入实时接待驾驶舱`.

For a fast run-through, click `一键跑完整流程`. This automatically plays the reception dialogue, generates the departure report, syncs to DMS, and lands on the follow-up page.

## 2. Real-Time Reception Cockpit

Click `播放下一句` several times.

Alternative ASR path:

Click `模拟麦克风转写`. The mock ASR service returns the next scripted transcript and sends it into the same Agent pipeline.

Key beats:

- The dialogue transcript appears in the center.
- The ASR panel shows how real speech recognition would connect.
- `ListenerAgent` extracts intents from each utterance.
- `ProfileAgent` updates budget, family context, concerns, and purchase probability.
- The right sidebar gives soft recommendations instead of interrupting the conversation.

Talk track:

"The system uses a three-zone collaboration model. Mechanical work such as transcription and tagging is AI-led. Suggestions such as follow-up questions and talk tracks are AI-assisted. Relationship-sensitive decisions remain human-led."

## 3. Competitor and Recommendation

After the customer mentions Highlander, open `推荐与竞品`.

Talk track:

"When the customer mentions a competitor, SalesMate maps the sentence to the competitor comparison intent. The recommendation page becomes a comparison workspace. The consultant can also manually add a potential competitor, such as AITO M7, and compare it against the recommended model."

Clarify:

"卡壳救援 appears in the real-time reception sidebar. The recommendation page is for structured competitor comparison and sales decision support."

## 4. Deal Booster

Stay on the recommendation page and point out the policy cards.

Talk track:

"The customer owns a 2018 Sylphy, so the system surfaces trade-in, scrappage, finance, and maintenance benefits. This turns the negotiation from pure price pressure into a structured value discussion."

## 4.5 Multi-Agent Coordination

Open `Agent 协调`.

Talk track:

"This page shows the backend coordination, not just UI state. ListenerAgent extracts intent and signals, ProfileAgent updates the customer profile, RecommendationAgent generates cards and model suggestions, FollowupAgent creates the report and strategy, and ArchiveCoordinator writes the processing archive for DMS sync."

Point out:

- Agent Registry
- Execution Plan
- Shared Memory
- Run Log

## 5. Departure Report

Open `离店报告` and click `生成离店报告`.

Talk track:

"Before the customer leaves, the consultant can generate a personalized report. The customer leaves with a useful artifact, and the dealership retains a structured record of needs and objections."

## 6. DMS and Follow-Up

Open `归档回访` and click `同步 DMS`.

Talk track:

"The demo uses MockDmsAdapter, but the adapter layer is designed for OEM and dealer DMS integration. The same session output is mapped to customer fields, intent level, recommended model, next follow-up timing, and follow-up script."

Point to the storage section:

"The archive strategy follows the data-sovereignty rule: DMS remains the source of truth. SalesMate stores local processing data such as tags, purchase probability, vector status, and sync status. If the DMS interface is not ready, the record stays pending locally and can be synchronized later."

Optional technical note:

"The demo persists local processing archives to `backend/runtime/processing-store.json`. This is a zero-dependency stand-in for the future SQLite layer."

Close with:

"The value is not a generic chatbot. It is an agentic workflow redesign for automotive sales: reception support, decision augmentation, customer reporting, and DMS collaboration in one closed loop."
