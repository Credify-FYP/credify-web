export interface ResumeInput {
  resume_id?: string;
  name: string;
  skills: string;
  experience: string;
  education: string;
  projects?: string;
}

export interface SignalScores {
  evidence_score: number;
  timeline_score: number;
  complexity_score: number;
  anomaly_score: number;
}

export interface AssessmentResult {
  resume_id: string;
  name: string;
  credibility_score: number;
  credibility_label: 'Credible' | 'Suspicious' | 'False';
  confidence: 'High' | 'Medium' | 'Low';
  signals: SignalScores;
  details: {
    evidence: string;
    timeline: string;
    complexity: string;
    anomaly: string;
  };
  timestamp: string;
}

export interface BatchResponse {
  total_assessed: number;
  results: AssessmentResult[];
  summary: {
    credible: number;
    suspicious: number;
    false: number;
  };
}