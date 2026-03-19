export interface ResumeInput {
  resume_id?: string;
  name?:      string;
  skills:     string;
  experience: string;
  education:  string;
  projects?:  string;
}

export interface SignalBreakdown {
  evidence_verification: {
    has_projects:    number;
    inflated_claims: number;
  };
  timeline_validation: {
    timeline_overlap: number;
    future_grad_year: number;
  };
  complexity_alignment: {
    skill_count:    number;
    skill_per_year: number;
  };
  anomaly_detection: {
    buzzword_count: number;
    job_count:      number;
  };
}

export interface AssessmentResult {
  resume_id:         string;
  credibility_label: 'Credible' | 'Suspicious' | 'False';
  confidence_score:  number;
  signal_breakdown:  SignalBreakdown;
  class_scores: {
    credible:   number;
    suspicious: number;
    false:      number;
  };
  timestamp: string;
}

export interface BatchResponse {
  total_assessed: number;
  results:        AssessmentResult[];
  summary: {
    credible:   number;
    suspicious: number;
    false:      number;
  };
}