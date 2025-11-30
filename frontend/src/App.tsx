// src/App.tsx
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import ToastContainer from "./components/ToastContainer";
import Home from "./pages/Home";
import AgentConfigList from "./pages/AgentConfigList";
import Configure from "./pages/Configure";
import TestCall from "./pages/TestCall";
import CallResults from "./pages/CallResults";
import CallDetail from "./pages/CallDetail";

export default function App() {
  return (
    <>
      <Sidebar />
      <TopBar />
      <ToastContainer />

      <div className="mt-16 h-screen overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/agent-configs" element={<AgentConfigList />} />
          <Route path="/agent-configs/new" element={<Configure />} />
          <Route path="/agent-configs/:id" element={<Configure />} />
          <Route path="/test-call" element={<TestCall />} />
          <Route path="/call-results" element={<CallResults />} />
          <Route path="/call-results/:id" element={<CallDetail />} />
        </Routes>
      </div>
    </>
  );
}
