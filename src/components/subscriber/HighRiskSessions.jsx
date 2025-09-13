import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import BASE_URL from '../../config/apiConfig';
import { Link } from 'react-router-dom';
import { Modal, Button, Table } from 'react-bootstrap';

export default function HighRiskSessions() {
  const [sessions, setSessions] = useState([]);
  const [flags, setFlags] = useState({});
  const [loading, setLoading] = useState(true);
  const [flagsLoading, setFlagsLoading] = useState(false);
  const [searchId, setSearchId] = useState('');
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);

  const fetchSessions = async (studentId) => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/student/getSessionsByCustomStudentId`, {
        params: studentId ? { studentId } : {}
      });
      setSessions(res.data || []);
      setFlags({});
    } finally {
      setLoading(false);
    }
  };

  const getSessionFlag = async (session) => {
    const res = await axios.post(`${BASE_URL}/examSession/sessionSummaryByModelType`, {
      sessionId: session._id,
      studentId: session.studentId
    });
    return !!res.data?.cheatingThresholdExceeded;
  };

  // load sessions initially
  useEffect(() => { fetchSessions(); }, []);

  // compute flags for all loaded sessions
  useEffect(() => {
    const markFlags = async () => {
      if (!sessions.length) return;
      setFlagsLoading(true);
      try {
        const results = await Promise.allSettled(sessions.map(getSessionFlag));
        const updates = {};
        results.forEach((r, i) => {
          const sid = sessions[i]._id;
          updates[sid] = r.status === 'fulfilled' ? r.value : false;
        });
        setFlags(updates);
      } finally {
        setFlagsLoading(false);
      }
    };
    markFlags();
  }, [sessions]);

  const highRisk = useMemo(
    () => sessions.filter(s => flags[s._id]),
    [sessions, flags]
  );

  const openSummary = async (session) => {
    setSelectedSession(session);
    const res = await axios.post(`${BASE_URL}/examSession/sessionSummaryByModelType`, {
      sessionId: session._id,
      studentId: session.studentId
    });
    setSummaryData(res.data);
    setSummaryModalOpen(true);
  };

  const closeModal = () => {
    setSummaryModalOpen(false);
    setSummaryData(null);
    setSelectedSession(null);
  };

  return (
    <div className="container-fluid py-3">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h4 className="mb-0">High-Risk Sessions</h4>
        <Link className="btn btn-outline-secondary" to="/sessions">Back to All Sessions</Link>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); fetchSessions(searchId.trim()); }}
        className="mb-3 d-flex gap-2"
      >
        <input
          className="form-control"
          placeholder="Filter by Student ID (e.g. STUE1A4)"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
        />
        <button className="btn btn-primary" type="submit">Search</button>
        <button className="btn btn-secondary" type="button" onClick={() => { setSearchId(''); fetchSessions(); }}>
          Clear
        </button>
      </form>

      {loading || flagsLoading ? (
        <div className="d-flex align-items-center gap-2">
          <div className="spinner-border" role="status" />
          <span>Loading…</span>
        </div>
      ) : highRisk.length === 0 ? (
        <p className="text-muted">No sessions exceeded the cheating threshold.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Started</th>
                <th>Ended</th>
                <th>Duration (sec)</th>
                <th>Summary</th>
              </tr>
            </thead>
            <tbody>
              {highRisk.map((s) => (
                <tr key={s._id} className="text-danger fw-semibold">
                  <td>{s.studentCustomId}</td>
                  <td>{s.name}</td>
                  <td>{s.email}</td>
                  <td>{new Date(s.startedAt).toLocaleString()}</td>
                  <td>{s.endedAt ? new Date(s.endedAt).toLocaleString() : '-'}</td>
                  <td>{s.duration ?? '-'}</td>
                  <td>
                    <button className="btn btn-sm btn-danger" onClick={() => openSummary(s)}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal show={summaryModalOpen} onHide={closeModal} size="lg">
        <Modal.Header closeButton><Modal.Title>Session Summary</Modal.Title></Modal.Header>
        <Modal.Body>
          {summaryData ? (
            <>
              <p><strong>Session ID:</strong> {summaryData.sessionId}</p>
              <p><strong>Duration:</strong> {summaryData.durationMinutes} minutes</p>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Model Type</th>
                    <th>Total model outs</th>
                    <th>Cheated</th>
                    <th>Not cheated</th>
                    <th>Avg Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(summaryData.summary).map(([type, data]) => (
                    <tr key={type}>
                      <td>{type}</td>
                      <td>{data.total}</td>
                      <td>{data.trueCount}</td>
                      <td>{data.falseCount}</td>
                      <td>{data.averageConfidence ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          ) : <p>Loading…</p>}
        </Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={closeModal}>Close</Button></Modal.Footer>
      </Modal>
    </div>
  );
}
