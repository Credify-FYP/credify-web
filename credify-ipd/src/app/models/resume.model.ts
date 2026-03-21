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
    timeline_overlap:    number;
    future_grad_year:    number;
    impossible_timeline?: number;
  };
  complexity_alignment: {
    skill_count:     number;
    skill_per_year:  number;
    achieve_per_job?: number;
    vague_per_job?:   number;
  };
  anomaly_detection: {
    buzzword_count:   number;
    job_count:        number;
    title_mismatch?:  number;
    is_skill_overload?: number;
  };
}

export interface XaiItem {
  signal:      string;
  explanation: string;
  icon:        string;
  shap:        number;
  value:       number;
}

export interface XaiTopFactor {
  feature:   string;
  shap:      number;
  direction: 'positive' | 'negative';
  value:     number;
}

export interface Explanation {
  overall_verdict:    string;
  confidence_text:    string;
  strengths:          XaiItem[];
  concerns:           XaiItem[];
  top_factors:        XaiTopFactor[];
  signal_values:      Record<string, number>;
  predicted_label:    string;
  confidence:         number;
  shap_available:     boolean;
  explanation_method: string;
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
  timestamp:    string;
  explanation?: Explanation;
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