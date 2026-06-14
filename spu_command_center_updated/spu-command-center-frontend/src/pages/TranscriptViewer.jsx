import { useEffect, useState } from 'react';
import { transcriptAPI } from '../services/api';
import { Search, Filter } from 'lucide-react';
import './TranscriptViewer.css';

function TranscriptViewer() {
  const [transcripts, setTranscripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  useEffect(() => {
    const fetchTranscripts = async () => {
      try {
        setLoading(true);
        const response = await transcriptAPI.list({
          search: searchTerm,
          priority: priorityFilter,
          ordering: '-timestamp',
        });
        setTranscripts(response.data.results);
      } catch (error) {
        console.error('Error fetching transcripts:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchTranscripts, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, priorityFilter]);

  return (
    <div className="transcript-viewer">
      <h1>Live Transcripts</h1>

      <div className="filters">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search transcripts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-select">
          <Filter size={20} />
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="">All Priorities</option>
            <option value="info">Information</option>
            <option value="warning">Warning</option>
            <option value="emergency">Emergency</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading transcripts...</div>
      ) : (
        <div className="transcripts-container">
          {transcripts.length > 0 ? (
            transcripts.map((transcript) => (
              <div key={transcript.id} className={`transcript-card priority-${transcript.priority}`}>
                <div className="transcript-header">
                  <span className="callsign">{transcript.callsign}</span>
                  <span className={`priority-badge ${transcript.priority}`}>
                    {transcript.priority.toUpperCase()}
                  </span>
                </div>
                <p className="transcript-text">{transcript.text}</p>
                <div className="transcript-meta">
                  <span className="operator">{transcript.operator_name}</span>
                  <span className="frequency">{transcript.frequency}</span>
                  {transcript.rssi && <span className="rssi">RSSI: {transcript.rssi} dBm</span>}
                  {transcript.confidence && <span className="confidence">AI: {transcript.confidence}%</span>}
                  <span className="timestamp">
                    {new Date(transcript.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="no-data">No transcripts found</p>
          )}
        </div>
      )}
    </div>
  );
}

export default TranscriptViewer;
