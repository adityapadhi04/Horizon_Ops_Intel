import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'data', 'db.json');

const app = express();
app.use(cors());
app.use(express.json());

// Helper functions for DB read/write
function readDB() {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    const db = JSON.parse(raw);
    
    // Add default values for predictive intelligence keys if they are missing
    let changed = false;
    if (!db.predictiveSeason) {
      db.predictiveSeason = 'Rainy';
      changed = true;
    }
    if (!db.predictiveClusters) {
      db.predictiveClusters = [
        {
          id: "cluster_1",
          area: "Patia",
          disease: "Dengue",
          cases: 27,
          trend: "Increasing",
          risk: "High",
          lastUpdated: Date.now()
        },
        {
          id: "cluster_2",
          area: "Chandrasekharpur",
          disease: "Viral Fever",
          cases: 18,
          trend: "Increasing",
          risk: "Medium",
          lastUpdated: Date.now()
        }
      ];
      changed = true;
    }
    if (!db.predictiveInventory) {
      db.predictiveInventory = [
        {"id": "inv_1", "item": "IV Fluids", "available": 120, "required": 150, "unit": "bags", "status": "Warning"},
        {"id": "inv_2", "item": "Paracetamol", "available": 500, "required": 400, "unit": "tablets", "status": "Safe"},
        {"id": "inv_3", "item": "Dengue Test Kits", "available": 15, "required": 50, "unit": "kits", "status": "Critical"},
        {"id": "inv_4", "item": "IV Cannulas", "available": 200, "required": 180, "unit": "units", "status": "Safe"}
      ];
      changed = true;
    }
    if (changed) {
      fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
    }
    
    return db;
  } catch (err) {
    console.error("Error reading database:", err);
    return {};
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error("Error writing database:", err);
  }
}

// Centralized Audit Event Function
function createAuditEvent(db, { eventType, title, description, actor, severity, metadata = {} }) {
  const auditEvent = {
    id: `audit_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
    timestamp: new Date().toISOString(),
    eventType,
    title,
    description,
    actor: actor || 'System',
    severity: severity || 'info',
    metadata
  };
  
  if (!db.auditLog) db.auditLog = [];
  db.auditLog.unshift(auditEvent);
  
  if (db.auditLog.length > 50) {
    db.auditLog = db.auditLog.slice(0, 50);
  }
  return auditEvent;
}

// Recommended actions mapper
function getRecommendedAction(type) {
  const actions = {
    CONFLICT_THRESHOLD: 'Review patient ledger list overrides and merge records.',
    LAB_DELAY: 'Review delayed laboratory workflow and turnaround SLA limits.',
    LOW_TRUST_SCORE: 'Review Nursing Bed Board overrides and recalibrate sources weightings.',
    BED_CAPACITY: 'Coordinate capacity limits and patient transfers with neighboring clinics.',
    PREDICTIVE_CLUSTER: 'Review geographical disease clusters and dispatch community health workers.',
    PREDICTIVE_BED_SHORTAGE: 'Accelerate patient discharge turnaround or coordinate diversion with local clinics.',
    PREDICTIVE_MEDICINE_SHORTAGE: 'Approve emergency supply chain order for depleted medications.'
  };
  return actions[type] || 'Review system logs for details.';
}

// Create or update alert (avoiding duplicates)
function createOrUpdateAlert(db, { type, title, description, severity }) {
  if (!db.alerts) db.alerts = [];
  
  const existingIndex = db.alerts.findIndex(a => a.type === type && a.status === 'ACTIVE');
  if (existingIndex !== -1) {
    db.alerts[existingIndex].description = description;
    db.alerts[existingIndex].timestamp = Date.now();
  } else {
    const newAlert = {
      id: `alert_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
      type,
      title,
      description,
      severity: severity || 'MEDIUM',
      status: 'ACTIVE',
      timestamp: Date.now(),
      recommendedAction: getRecommendedAction(type)
    };
    db.alerts.unshift(newAlert);
    
    createAuditEvent(db, {
      eventType: 'ALERT_CREATED',
      title: `Alert Triggered: ${title}`,
      description: `System alert generated: ${description}`,
      actor: 'System Rules Engine',
      severity: severity === 'CRITICAL' ? 'critical' : (severity === 'HIGH' ? 'warning' : 'info')
    });
  }
}

// Resolve alert by type
function resolveAlertByType(db, type) {
  if (!db.alerts) db.alerts = [];
  
  const existingIndex = db.alerts.findIndex(a => a.type === type && a.status === 'ACTIVE');
  if (existingIndex !== -1) {
    db.alerts[existingIndex].status = 'RESOLVED';
    db.alerts[existingIndex].resolvedAt = Date.now();
    
    createAuditEvent(db, {
      eventType: 'ALERT_RESOLVED',
      title: `Alert Resolved: ${db.alerts[existingIndex].title}`,
      description: `System resolved alert: ${db.alerts[existingIndex].description}`,
      actor: 'System Rules Engine',
      severity: 'info'
    });
  }
}

// Evaluate all alerts
function evaluateAlerts(db) {
  // 1. Conflict Threshold
  const conflictCount = db.activeConflicts.length;
  if (conflictCount >= 5) {
    createOrUpdateAlert(db, {
      type: 'CONFLICT_THRESHOLD',
      title: 'Data Conflict Threshold Exceeded',
      description: `Current active conflicts have reached ${conflictCount}.`,
      severity: 'HIGH'
    });
  } else {
    resolveAlertByType(db, 'CONFLICT_THRESHOLD');
  }

  // 2. Lab Delay
  const tat = db.labStats ? db.labStats.averageTat : 2.4;
  if (tat > 4) {
    createOrUpdateAlert(db, {
      type: 'LAB_DELAY',
      title: 'Laboratory Turnaround Delay',
      description: `Current average turnaround time is ${tat} hours.`,
      severity: 'HIGH'
    });
  } else {
    resolveAlertByType(db, 'LAB_DELAY');
  }

  // 3. Low Trust Score
  const score = db.trustScores ? db.trustScores.overall : 88;
  if (score < 75) {
    createOrUpdateAlert(db, {
      type: 'LOW_TRUST_SCORE',
      title: 'Overall Data Trust Score Dropped',
      description: `Data trust score has dropped to ${score}%.`,
      severity: 'HIGH'
    });
  } else {
    resolveAlertByType(db, 'LOW_TRUST_SCORE');
  }

  // 4. Bed Capacity
  const availableBeds = db.bed.filter(b => !b.occupied).length;
  if (availableBeds < 10) {
    createOrUpdateAlert(db, {
      type: 'BED_CAPACITY',
      title: 'Low Bed Availability',
      description: `Available hospital beds have fallen to ${availableBeds} units.`,
      severity: 'MEDIUM'
    });
  } else {
    resolveAlertByType(db, 'BED_CAPACITY');
  }

  // 5. Predictive High-Risk Disease Cluster Alert
  const clusters = db.predictiveClusters || [];
  const highRiskCluster = clusters.find(c => c.risk === 'High');
  if (highRiskCluster) {
    createOrUpdateAlert(db, {
      type: 'PREDICTIVE_CLUSTER',
      title: 'High-Risk Disease Cluster Detected',
      description: `${highRiskCluster.area} has ${highRiskCluster.cases} active cases of ${highRiskCluster.disease} (${highRiskCluster.trend} trend).`,
      severity: 'HIGH'
    });
  } else {
    resolveAlertByType(db, 'PREDICTIVE_CLUSTER');
  }

  // 6. Predictive Bed Shortage Alert
  const highRiskCount = clusters.filter(c => c.risk === 'High').length;
  const mediumRiskCount = clusters.filter(c => c.risk === 'Medium').length;
  let clusterSurgeFactor = (highRiskCount * 5) + (mediumRiskCount * 2);
  let seasonalSurgeFactor = 0;
  const season = db.predictiveSeason || 'Rainy';
  if (season === 'Rainy') seasonalSurgeFactor = 8;
  else if (season === 'Winter') seasonalSurgeFactor = 5;
  else if (season === 'Summer') seasonalSurgeFactor = 3;
  const predictedAdmissionsDelta = Math.round(clusterSurgeFactor + seasonalSurgeFactor);
  const minPredictedSurge = Math.max(2, predictedAdmissionsDelta - 3);
  const maxPredictedSurge = predictedAdmissionsDelta + 3;

  if (availableBeds < minPredictedSurge) {
    createOrUpdateAlert(db, {
      type: 'PREDICTIVE_BED_SHORTAGE',
      title: 'Predicted Patient Surge Exceeds Bed Capacity',
      description: `Predicted surge is ${minPredictedSurge}-${maxPredictedSurge} additional beds, but only ${availableBeds} beds are available.`,
      severity: 'CRITICAL'
    });
  } else {
    resolveAlertByType(db, 'PREDICTIVE_BED_SHORTAGE');
  }

  // 7. Predictive Medicine Shortage Alert
  const inventory = db.predictiveInventory || [];
  const criticalItems = inventory.filter(item => item.available < item.required && (item.available / item.required) < 0.5);
  if (criticalItems.length > 0) {
    createOrUpdateAlert(db, {
      type: 'PREDICTIVE_MEDICINE_SHORTAGE',
      title: 'Critical Medicine Shortage Detected',
      description: `Depleted supplies: ${criticalItems.map(i => `${i.item} (${i.available}/${i.required})`).join(', ')}.`,
      severity: 'HIGH'
    });
  } else {
    resolveAlertByType(db, 'PREDICTIVE_MEDICINE_SHORTAGE');
  }
}

// Helper for Predictive Overview calculation
// Hackathon Rule-based Predictive Engine:
// 1. Cluster Factor: Active High-risk disease clusters add 5 projected admissions/day; Medium-risk add 2.
// 2. Seasonal Factor: Weather impacts admission projections (Rainy season adds 8 cases due to Dengue/Malaria; Winter adds 5; Summer adds 3).
// 3. Expected Patient Surge admissions = base daily admissions + Cluster Factor + Seasonal Factor.
function getPredictiveOverview(db) {
  const availableBeds = db.bed.filter(b => !b.occupied).length;
  
  const activeClusters = db.predictiveClusters || [];
  const highRiskCount = activeClusters.filter(c => c.risk === 'High').length;
  const mediumRiskCount = activeClusters.filter(c => c.risk === 'Medium').length;
  
  const currentDailyAdmissions = 12 + db.his.filter(p => p.status === 'Admitted').length; 
  
  let clusterSurgeFactor = (highRiskCount * 5) + (mediumRiskCount * 2);
  let seasonalSurgeFactor = 0;
  const season = db.predictiveSeason || 'Rainy';
  if (season === 'Rainy') {
    seasonalSurgeFactor = 8;
  } else if (season === 'Winter') {
    seasonalSurgeFactor = 5;
  } else if (season === 'Summer') {
    seasonalSurgeFactor = 3;
  }
  
  const predictedAdmissionsDelta = Math.round(clusterSurgeFactor + seasonalSurgeFactor);
  const minPredictedSurge = Math.max(2, predictedAdmissionsDelta - 3);
  const maxPredictedSurge = predictedAdmissionsDelta + 3;
  
  const percentageIncrease = Math.round((predictedAdmissionsDelta / currentDailyAdmissions) * 100) || 0;
  
  let surgeRiskLevel = 'Safe';
  if (percentageIncrease > 50) {
    surgeRiskLevel = 'Critical';
  } else if (percentageIncrease > 25) {
    surgeRiskLevel = 'Warning';
  } else if (percentageIncrease > 10) {
    surgeRiskLevel = 'Attention';
  }
  
  let bedStatus = 'Safe';
  let bedMessage = 'Capacity is sufficient.';
  if (availableBeds < minPredictedSurge) {
    bedStatus = 'Critical';
    bedMessage = 'Immediate shortage; demand exceeds available beds.';
  } else if (availableBeds < maxPredictedSurge) {
    bedStatus = 'Warning';
    bedMessage = 'Possible capacity shortage under peak surge.';
  } else if (availableBeds < maxPredictedSurge + 5) {
    bedStatus = 'Attention';
    bedMessage = 'Tight bed availability; monitor admissions closely.';
  }
  
  const inventory = db.predictiveInventory || [];
  const criticalItems = inventory.filter(item => item.available < item.required && (item.available / item.required) < 0.5);
  const warningItems = inventory.filter(item => item.available < item.required && (item.available / item.required) >= 0.5);
  
  let inventoryStatus = 'Safe';
  if (criticalItems.length > 0) {
    inventoryStatus = 'Critical';
  } else if (warningItems.length > 0) {
    inventoryStatus = 'Warning';
  }
  
  return {
    activeClustersCount: activeClusters.length,
    highRiskClustersCount: highRiskCount,
    predictedDailySurge: `${minPredictedSurge}-${maxPredictedSurge}`,
    percentageIncrease,
    surgeRiskLevel,
    availableBeds,
    minPredictedSurge,
    maxPredictedSurge,
    bedStatus,
    bedMessage,
    inventoryStatus,
    inventoryCount: inventory.length,
    criticalInventoryItems: criticalItems.length
  };
}

// REST API endpoints

// Predictive Overview
app.get('/api/predictive/overview', (req, res) => {
  const db = readDB();
  const summary = getPredictiveOverview(db);
  
  const clusters = db.predictiveClusters || [];
  const inventory = db.predictiveInventory || [];
  const criticalItems = inventory.filter(item => item.available < item.required && (item.available / item.required) < 0.5);
  
  const recommendations = {
    administrator: [
      summary.bedStatus === 'Critical' || summary.bedStatus === 'Warning' 
        ? "🚨 Coordinate emergency bed transfers with local healthcare clinics." 
        : "🏥 Bed capacity level is healthy. Maintain current intake rates.",
      criticalItems.length > 0 
        ? `💊 Authorize immediate budget to replenish: ${criticalItems.map(i => i.item).join(', ')}.` 
        : "✅ Pharmacy supply lines are sufficient. Normal procurement ongoing.",
      "📋 Conduct daily multi-departmental preparedness check-ins."
    ],
    nursing: [
      summary.bedStatus === 'Critical' || summary.bedStatus === 'Warning'
        ? "👩⚕️ Adjust nurse staffing rosters to handle high ward admissions."
        : "✅ Nurse staffing ratios nominal for current admissions.",
      clusters.some(c => c.disease === 'Dengue')
        ? "🦠 Review clinical protocols for Dengue fever treatment with duty teams."
        : "📋 Carry out regular nursing competency updates.",
      "⚠️ Verify bedside medical supplies replenishment schedules in Ward C."
    ],
    bedManager: [
      summary.bedStatus === 'Critical' || summary.bedStatus === 'Warning'
        ? "🛏️ Initiate urgent bed cleaning sweeps to minimize lag."
        : "✅ Bed cleaning schedules nominal. Keep turnaround times below 45m.",
      "🚪 Prioritize discharge reviews for stable patients in Wards 3A and 3B.",
      "📊 Report real-time bed board status updates to nursing desks hourly."
    ],
    dataAdmin: [
      clusters.length > 0
        ? `💻 Calibrate HIS alerts to trace new cases from: ${clusters.map(c => c.area).join(', ')}.`
        : "✅ Epidemiological surveillance nominal. No active disease spikes.",
      "⚡ Verify HIS-to-LIS web sockets latency status (target < 5 seconds).",
      "🔍 Inspect Bed Board manual sync overrides log for discrepancies."
    ]
  };

  res.json({
    summary,
    recommendations
  });
});

// Clusters list
app.get('/api/predictive/clusters', (req, res) => {
  const db = readDB();
  res.json(db.predictiveClusters || []);
});

// Seasonal Forecast
app.get('/api/predictive/forecast', (req, res) => {
  const db = readDB();
  const season = db.predictiveSeason || 'Rainy';
  
  const risks = {
    Rainy: [
      { disease: 'Dengue', risk: 'High', historicalRate: '+45%', trend: 'Increasing' },
      { disease: 'Malaria', risk: 'High', historicalRate: '+30%', trend: 'Increasing' },
      { disease: 'Viral Fever', risk: 'Medium', historicalRate: '+15%', trend: 'Stable' }
    ],
    Summer: [
      { disease: 'Heat Stroke', risk: 'High', historicalRate: '+60%', trend: 'Increasing' },
      { disease: 'Dehydration', risk: 'Medium', historicalRate: '+40%', trend: 'Stable' },
      { disease: 'Gastroenteritis', risk: 'Medium', historicalRate: '+20%', trend: 'Increasing' }
    ],
    Winter: [
      { disease: 'Influenza', risk: 'High', historicalRate: '+50%', trend: 'Increasing' },
      { disease: 'Bronchitis', risk: 'Medium', historicalRate: '+35%', trend: 'Increasing' },
      { disease: 'Asthma Exacerbation', risk: 'Medium', historicalRate: '+25%', trend: 'Stable' }
    ]
  };

  res.json({
    season,
    forecast: risks[season] || risks.Rainy
  });
});

// Preparedness detailed status
app.get('/api/predictive/preparedness', (req, res) => {
  const db = readDB();
  const availableBeds = db.bed.filter(b => !b.occupied).length;
  const inventory = db.predictiveInventory || [];
  
  res.json({
    availableBeds,
    inventory
  });
});


// 1. Overview data aggregator
app.get('/api/overview', (req, res) => {
  const db = readDB();
  const occupiedCount = db.bed.filter(b => b.occupied).length;
  const availableCount = Math.max(100 - occupiedCount, 0);
  const patientCount = db.his.filter(p => p.status === 'Admitted').length;

  res.json({
    occupiedCount,
    availableCount,
    patientCount,
    conflictCount: db.activeConflicts.length,
    alertCount: db.alerts.length,
    trustScores: db.trustScores,
    alerts: db.alerts,
    auditLog: db.auditLog,
    activeConflicts: db.activeConflicts
  });
});

// 2. Beds list
app.get('/api/beds', (req, res) => {
  const db = readDB();
  res.json(db.bed);
});

// 3. Patients list
app.get('/api/patients', (req, res) => {
  const db = readDB();
  res.json(db.his);
});

// 4. Lab results list
app.get('/api/labs', (req, res) => {
  const db = readDB();
  res.json(db.lab);
});

// Centralized reconciliation explanation generator
function generateReconciliationExplanation(c, relA, relB, nameA, nameB, valA, valB, diff, ruleApplied, recommendation, confidence) {
  let recText = (recommendation === 'Verification Required' || recommendation === 'Human Review Required') 
    ? 'manual review is required to resolve this status conflict'
    : `use ${recommendation}`;

  return `${nameA} reports that Bed ${c.id.includes('C204') ? 'C-204' : 'Bed-302'} is ${valA.toUpperCase()}. ` +
         `${nameB} reports that Bed ${c.id.includes('C204') ? 'C-204' : 'Bed-302'} is ${valB.toUpperCase()}. ` +
         `${nameA} currently has a reliability score of ${relA}%. ` +
         `${nameB} has a reliability score of ${relB}%. ` +
         `The reliability difference is ${diff.toFixed(1)}%. ` +
         `Rule Applied: ${ruleApplied}. ` +
         `Recommendation: ${recText}. ` +
         `Confidence: ${confidence}.`;
}

// 5. Active Conflicts list
app.get('/api/conflicts', (req, res) => {
  const db = readDB();
  const hisRel = db.trustScores.his;
  const bedRel = db.trustScores.bed;
  const labRel = db.trustScores.lab;

  const mapped = db.activeConflicts.map(c => {
    let reliabilityA = hisRel;
    let reliabilityB = bedRel;
    let sourceAName = 'Epic HIS';
    let sourceBName = 'Nursing Bed Board';
    let valueA = c.sourceData?.his || 'Available';
    let valueB = c.sourceData?.bed || 'Occupied';
    let ward = c.description.includes('Ward C') || c.id.includes('C204') ? 'Ward C' : 'Ward B';

    if (c.type.includes('Lab') || c.sourceData?.lab) {
      reliabilityB = labRel;
      sourceBName = 'Cerner LIS';
      valueB = c.sourceData?.lab || 'Pending';
    }

    const diff = Math.abs(reliabilityA - reliabilityB);
    let recommendation = 'Verification Required';
    let confidence = 'MEDIUM';
    let ruleApplied = 'Close Reliability Match';
    let recValue = valueA;
    let recSource = sourceAName;

    // 3-Way Reconciliation Decision Rules:
    // Rule 1: If both sources have extremely low trust (<65%), require human review.
    if (reliabilityA < 65 && reliabilityB < 65) {
      recommendation = 'Human Review Required';
      recSource = 'Human Review Required';
      recValue = 'N/A';
      confidence = 'LOW';
      ruleApplied = 'Low Reliability Sources';
    } 
    // Rule 2: If one source is significantly more reliable (difference > 10%), trust the higher one.
    else if (diff > 10) {
      recommendation = reliabilityA > reliabilityB ? sourceAName : sourceBName;
      recSource = reliabilityA > reliabilityB ? sourceAName : sourceBName;
      recValue = reliabilityA > reliabilityB ? valueA : valueB;
      confidence = 'HIGH';
      ruleApplied = 'Higher Reliability Source';
    } 
    // Rule 3: If reliability scores are a close match (diff between 5% and 10%), require nursing verification.
    else if (diff >= 5 && diff <= 10) {
      recommendation = 'Verification Required';
      recSource = 'Verification Required';
      recValue = 'N/A';
      confidence = 'MEDIUM';
      ruleApplied = 'Close Reliability Match';
    } 
    // Rule 4: If reliability difference is minimal (<5%), flag for immediate manual review.
    else {
      recommendation = 'Human Review Required';
      recSource = 'Human Review Required';
      recValue = 'N/A';
      confidence = 'LOW';
      ruleApplied = 'Low Confidence Discrepancy';
    }

    const explanation = generateReconciliationExplanation(c, reliabilityA, reliabilityB, sourceAName, sourceBName, valueA, valueB, diff, ruleApplied, recommendation, confidence);

    return {
      ...c,
      ward,
      sourceA: sourceAName,
      sourceB: sourceBName,
      valueA: valueA,
      valueB: valueB,
      sourceAReliability: reliabilityA,
      sourceBReliability: reliabilityB,
      ruleApplied,
      recommendedSource: recSource,
      recommendedValue: recValue,
      confidence,
      explanation
    };
  });

  res.json(mapped);
});

// 6. Resolve Conflict
app.post('/api/conflicts/:id/resolve', (req, res) => {
  const db = readDB();
  const conflictId = req.params.id;
  const { resolutionAction, overrideReason, resolvedBy } = req.body;

  const conflictIndex = db.activeConflicts.findIndex(c => c.id === conflictId);
  if (conflictIndex === -1) {
    return res.status(404).json({ error: "Conflict not found" });
  }
  const conflict = db.activeConflicts[conflictIndex];

  // Apply resolution logic
  if (resolutionAction === 'approve_his') {
    // Vacate bed
    db.bed = db.bed.map(b => b.mrn === conflict.mrn ? { ...b, mrn: null, occupied: false, timestamp: Date.now() } : b);
  } else if (resolutionAction === 'approve_bed') {
    // Restore HIS admission status
    db.his = db.his.map(h => h.mrn === conflict.mrn ? { ...h, status: 'Admitted', timestamp: Date.now() } : h);
  }

  // Remove from active conflicts
  db.activeConflicts.splice(conflictIndex, 1);

  // Clear related alerts
  db.alerts = db.alerts.filter(a => !a.message.includes(conflict.mrn));

  const oldHis = db.trustScores.his;
  const oldBed = db.trustScores.bed;

  // STEP 3: Update reliability metrics
  if (resolutionAction === 'approve_his') {
    db.trustScores.his = Math.min(db.trustScores.his + 0.5, 100);
    db.trustScores.bed = Math.max(db.trustScores.bed - 0.5, 0);
  } else if (resolutionAction === 'approve_bed') {
    db.trustScores.bed = Math.min(db.trustScores.bed + 0.5, 100);
    db.trustScores.his = Math.max(db.trustScores.his - 0.5, 0);
  }

  // STEP 4: Recalculate Overall Data Trust Score dynamically (weighted average)
  db.trustScores.overall = parseFloat(((db.trustScores.his * 0.4) + (db.trustScores.lab * 0.4) + (db.trustScores.bed * 0.2)).toFixed(1));

  // STEP 5: Automatically add a dynamic Audit Trail event
  const userLabel = resolvedBy || 'Sarah Jenkins (Override)';
  const bedNum = conflict.description.includes('Bed-') ? conflict.description.match(/Bed-\d+/)[0] : 'C301';
  const details = `Bed ${bedNum} status conflict resolved. Decision: ${resolutionAction === 'approve_his' ? 'Epic HIS confirmed as correct' : 'Nursing Bed Board confirmed as correct'}. Reviewed by: ${userLabel}. Source Reliability Updated: Epic HIS: ${oldHis}% ➔ ${db.trustScores.his}%, Nursing Bed Board: ${oldBed}% ➔ ${db.trustScores.bed}%.`;

  // Centralized Audit Log
  createAuditEvent(db, {
    eventType: 'CONFLICT_RESOLVED',
    title: 'Conflict Resolved',
    description: details,
    actor: userLabel,
    severity: 'info'
  });

  evaluateAlerts(db);
  writeDB(db);
  res.json({ message: "Conflict resolved successfully", db });
});

// 7. Trust Center details
app.get('/api/trust', (req, res) => {
  const db = readDB();
  res.json(db.trustScores);
});

// 8. Conflict pattern intelligence insights
app.get('/api/patterns', (req, res) => {
  const db = readDB();
  // Return mock patterns config matching active conflicts count
  const activeCount = db.activeConflicts.length;
  res.json({
    recurringPatterns: activeCount > 0 ? 4 : 0,
    highRiskDepts: activeCount > 0 ? 2 : 0,
    mostUnreliableSource: activeCount > 0 ? 'Manual Bed Sheet' : 'None',
    averageLag: activeCount > 0 ? '42 min' : '0 min',
    activeCount
  });
});

// 9. System audit trails
app.get('/api/audit', (req, res) => {
  const db = readDB();
  res.json(db.auditLog);
});

app.post('/api/audit/log', (req, res) => {
  const db = readDB();
  const { action, target, details, resolvedBy } = req.body;
  db.auditLog.unshift({
    timestamp: Date.now(),
    action: action || 'Reconciliation Action Logged',
    target: target || 'Rules Engine',
    details: details || 'Configuration updated.',
    resolvedBy: resolvedBy || 'Sarah Jenkins (Operations)',
    hash: `sha256:${Math.random().toString(16).substring(2, 10)}8f4`
  });
  writeDB(db);
  res.json({ message: "Audit log added", auditLog: db.auditLog });
});


// 10. Alerts ledger
app.get('/api/alerts', (req, res) => {
  const db = readDB();
  res.json(db.alerts);
});

// 11. Clear single alert
app.post('/api/alerts/:id/clear', (req, res) => {
  const db = readDB();
  const alertId = req.params.id;
  db.alerts = db.alerts.filter(a => a.id !== alertId);
  writeDB(db);
  res.json(db.alerts);
});

// Resolve single alert
app.post('/api/alerts/:id/resolve', (req, res) => {
  const db = readDB();
  const alertId = req.params.id;
  const { resolvedBy } = req.body;

  const alertIndex = db.alerts.findIndex(a => a.id === alertId);
  if (alertIndex !== -1) {
    db.alerts[alertIndex].status = 'RESOLVED';
    db.alerts[alertIndex].resolvedAt = Date.now();
    
    const actorLabel = resolvedBy || 'System';
    createAuditEvent(db, {
      eventType: 'ALERT_RESOLVED',
      title: 'Alert Resolved',
      description: `${db.alerts[alertIndex].title} was marked resolved. Resolved by: ${actorLabel}.`,
      actor: actorLabel,
      severity: 'info'
    });
  }
  evaluateAlerts(db);
  writeDB(db);
  res.json(db.alerts);
});

// 12. Clear all alerts
app.post('/api/alerts/clear-all', (req, res) => {
  const db = readDB();
  db.alerts = [];
  writeDB(db);
  res.json([]);
});

// 13. Update Rules sandbox config
app.post('/api/rules/update', (req, res) => {
  const db = readDB();
  const { key, value } = req.body;
  
  db.rules[key] = value;

  // Sandbox simulation triggers
  if (key === 'bedDischargeThreshold') {
    if (value < 2) {
      const hasConf = db.activeConflicts.some(c => c.id === 'CF-2045');
      if (!hasConf) {
        db.activeConflicts.push({
          id: 'CF-2045',
          mrn: '58392',
          patientName: 'Jessica Adams',
          type: 'Discharge Grace Period Mismatch',
          severity: 'warning',
          description: `Grace Period threshold set to ${value}h. Bed-501 occupied by Jessica Adams exceeds grace time.`,
          sourceData: { his: 'Discharged', lab: 'Completed', bed: 'Occupied' },
          suggestionText: `Under rule parameter R-01 (limit ${value}h), this latency is flagged. Recommendation: Vacate Bed-501.`,
          confidence: 88,
          resolutionOptions: [
            { label: 'Vacate Bed-501 (Approve HIS)', actionKey: 'approve_his', recommended: true },
            { label: 'Re-Admit Jessica (Approve Bed Board)', actionKey: 'approve_bed', recommended: false }
          ]
        });
      }
    } else {
      db.activeConflicts = db.activeConflicts.filter(c => c.id !== 'CF-2045');
    }
  }

  if (key === 'labTatThreshold') {
    if (value < 45) {
      const hasLabConf = db.activeConflicts.some(c => c.id === 'CF-2043');
      if (!hasLabConf) {
        db.activeConflicts.push({
          id: 'CF-2043',
          mrn: '58392',
          patientName: 'Jessica Adams',
          type: 'Lab Turnaround SLA Overdue',
          severity: 'critical',
          description: `STAT test elapsed time (40m) exceeds rules sandboxed limit of ${value}m.`,
          sourceData: { his: 'Admitted', lab: 'Pending STAT (40m elapsed)', bed: 'Occupied' },
          suggestionText: 'Laboratory test has stalled. Dispatch warning to Pathology lead.',
          confidence: 95,
          resolutionOptions: [
            { label: 'Escalate Lab Order (Warning)', actionKey: 'approve_his', recommended: true },
            { label: 'Override Timeout SLA', actionKey: 'approve_bed', recommended: false }
          ]
        });
      }
    } else {
      db.activeConflicts = db.activeConflicts.filter(c => c.id !== 'CF-2043');
    }
  }

  evaluateAlerts(db);
  writeDB(db);
  res.json({ message: "Rules configured", db });
});

// 14. Demo settings trigger (toggle run, bed lag, lab delay)
app.post('/api/demo/settings', (req, res) => {
  const db = readDB();
  const { key } = req.body;
  if (key === 'running') {
    db.settings.running = !db.settings.running;
  } else {
    db.settings[key] = !db.settings[key];
  }
  evaluateAlerts(db);
  writeDB(db);
  res.json(db.settings);
});

// 15. Demo Event simulation triggers
app.post('/api/demo/event', (req, res) => {
  const db = readDB();
  const { eventType } = req.body;
  console.log("Simulating event:", eventType);

  if (eventType === 'admission') {
    const randMrn = Math.floor(10000 + Math.random() * 90000).toString();
    const names = ['David Kim', 'Aria Vance', 'Marcus Aurelius', 'Clara Barton', 'Elena Rostova'];
    const randName = names[Math.floor(Math.random() * names.length)];
    
    // Admissions sync HIS
    db.his.push({ mrn: randMrn, patientName: randName, status: 'Admitted', timestamp: Date.now() });

    // Assign vacant bed
    let assignedBed = 'Bed-102';
    let assigned = false;
    db.bed = db.bed.map(b => {
      if (!b.occupied && !assigned) {
        assigned = true;
        assignedBed = b.bedId;
        return { ...b, mrn: randMrn, occupied: true, timestamp: Date.now() };
      }
      return b;
    });

    createAuditEvent(db, {
      eventType: 'PATIENT_ADMISSION',
      title: 'New Patient Admission',
      description: `New Patient Admission. Patient assigned to Bed ${assignedBed}. Ward occupancy updated.`,
      actor: 'HIS Webhook Sync',
      severity: 'info'
    });

  } else if (eventType === 'discharge') {
    const admittedBed = db.bed.find(b => b.occupied);
    if (!admittedBed) {
      return res.status(400).json({ error: 'No active occupied beds to discharge.' });
    }
    const mrn = admittedBed.mrn;
    const bedName = admittedBed.bedId;

    // Set status to Discharged in HIS register
    db.his = db.his.map(p => p.mrn === mrn ? { ...p, status: 'Discharged', timestamp: Date.now() } : p);

    // Mark bed as available
    db.bed = db.bed.map(b => b.bedId === bedName ? { ...b, mrn: null, occupied: false, timestamp: Date.now() } : b);

    createAuditEvent(db, {
      eventType: 'PATIENT_DISCHARGE',
      title: 'Patient Discharged',
      description: `Patient Discharged. Bed ${bedName} marked available.`,
      actor: 'HIS Webhook Sync',
      severity: 'info'
    });

  } else if (eventType === 'bed_update') {
    const activeBedConflict = db.activeConflicts.find(c => c.type === 'Bed Occupancy Mismatch');
    if (activeBedConflict) {
      // Auto resolve
      db.bed = db.bed.map(b => b.mrn === activeBedConflict.mrn ? { ...b, mrn: null, occupied: false, timestamp: Date.now() } : b);
      db.activeConflicts = db.activeConflicts.filter(c => c.id !== activeBedConflict.id);
      db.alerts = db.alerts.filter(a => !a.message.includes(activeBedConflict.mrn));
      
      createAuditEvent(db, {
        eventType: 'CONFLICT_RESOLVED',
        title: 'Conflict Resolved',
        description: `Override: Vacated Bed for MRN-${activeBedConflict.mrn}. Bed board cleared.`,
        actor: 'Sarah Jenkins (Override)',
        severity: 'info'
      });
    } else {
      // Clear first occupied bed
      const firstOccupied = db.bed.find(b => b.occupied);
      if (firstOccupied) {
        db.bed = db.bed.map(b => b.bedId === firstOccupied.bedId ? { ...b, mrn: null, occupied: false, timestamp: Date.now() } : b);
        
        createAuditEvent(db, {
          eventType: 'CONFLICT_RESOLVED',
          title: 'Bed Ledger Updated',
          description: `Nursing cleared occupancy sheet for bed ${firstOccupied.bedId}. Status updated to Vacant.`,
          actor: 'Manual Bed Sync',
          severity: 'info'
        });
      }
    }

  } else if (eventType === 'lab_result') {
    const pendingLab = db.lab.find(l => l.status === 'pending');
    if (pendingLab) {
      db.lab = db.lab.map(l => l.mrn === pendingLab.mrn ? { ...l, status: 'completed', orderTime: Date.now() } : l);
      db.alerts = db.alerts.filter(a => !a.message.includes(pendingLab.mrn));
      
      createAuditEvent(db, {
        eventType: 'CONFLICT_RESOLVED',
        title: 'Lab Result Verified',
        description: `STAT ${pendingLab.testType} completed. Turnaround verified at ${pendingLab.elapsedTime}m.`,
        actor: 'Laboratory LIS Interface',
        severity: 'info'
      });
    } else {
      const randMrn = db.his[Math.floor(Math.random() * db.his.length)].mrn;
      db.lab.push({ mrn: randMrn, testType: 'Routine Metabolic Panel', orderTime: Date.now() - 10 * 60 * 1000, elapsedTime: 10, priority: 'Routine', status: 'completed' });
    }

  } else if (eventType === 'conflict') {
    const hasConf = db.activeConflicts.some(c => c.id === 'CF-C204');
    if (!hasConf) {
      db.activeConflicts.unshift({
        id: 'CF-C204',
        mrn: '48195',
        patientName: 'David Miller',
        type: 'Bed Occupancy Mismatch',
        severity: 'critical',
        description: 'Epic HIS register reports Bed C-204 is Available, but Nursing Bed Board records Bed C-204 is Occupied.',
        sourceData: { his: 'Available', lab: 'Completed', bed: 'Occupied' },
        suggestionText: 'HIS records discharge and final LIS panels are completed. Discrepancy is likely due to nursing latency in vacating the bed board. Recommendation: Approve HIS status and clear Bed C-204.',
        confidence: 90,
        resolutionOptions: [
          { label: 'Vacate Bed C-204 (Approve HIS)', actionKey: 'approve_his', recommended: true },
          { label: 'Re-Admit David (Approve Bed Board)', actionKey: 'approve_bed', recommended: false }
        ]
      });

      createAuditEvent(db, {
        eventType: 'BED_CONFLICT_DETECTED',
        title: 'Bed Data Conflict Detected',
        description: 'Bed C-204 has conflicting status between Epic HIS and Nursing Bed Board.',
        actor: 'Rules Engine R-09',
        severity: 'warning'
      });
    }

  } else if (eventType === 'lab_delay') {
    db.labStats = {
      averageTat: 5.8,
      delayedCount: 8
    };

    createAuditEvent(db, {
      eventType: 'LAB_DELAY_DETECTED',
      title: 'Laboratory Delay Detected',
      description: 'Average turnaround time exceeded expected threshold (2.4 hours ➔ 5.8 hours).',
      actor: 'System Monitor',
      severity: 'warning'
    });

  } else if (eventType === 'human_resolution') {
    if (db.activeConflicts.length > 0) {
      const conflict = db.activeConflicts[0];
      // Resolve first conflict
      db.bed = db.bed.map(b => b.mrn === conflict.mrn ? { ...b, mrn: null, occupied: false, timestamp: Date.now() } : b);
      db.activeConflicts.shift();
      db.alerts = db.alerts.filter(a => !a.message.includes(conflict.mrn));

      createAuditEvent(db, {
        eventType: 'CONFLICT_RESOLVED',
        title: 'Conflict Resolved',
        description: `Override: Approved HIS register status. Bed board resolved.`,
        actor: 'Sarah Jenkins (Override)',
        severity: 'info'
      });

      db.trustScores.bed = Math.min(db.trustScores.bed + 3, 98);
      db.trustScores.overall = Math.min(db.trustScores.overall + 2, 99);
    }
  } else if (eventType === 'disease_cluster') {
    db.predictiveClusters = [
      { id: 'cluster_1', area: 'Patia', disease: 'Dengue', cases: 32, trend: 'Increasing', risk: 'High', lastUpdated: Date.now() },
      { id: 'cluster_2', area: 'Chandrasekharpur', disease: 'Viral Fever', cases: 22, trend: 'Increasing', risk: 'Medium', lastUpdated: Date.now() },
      { id: 'cluster_3', area: 'Nayapalli', disease: 'Malaria', cases: 14, trend: 'Increasing', risk: 'Medium', lastUpdated: Date.now() }
    ];
    createAuditEvent(db, {
      eventType: 'DISEASE_CLUSTER_DETECTED',
      title: 'Epidemiology Shift Triggered',
      description: 'Active Dengue cluster identified in Patia. Incident rates exceed standard limits.',
      actor: 'Bio-Surveillance Engine',
      severity: 'warning'
    });

  } else if (eventType === 'seasonal_surge') {
    db.predictiveSeason = 'Rainy';
    db.predictiveClusters = (db.predictiveClusters || []).map(c => {
      if (c.disease === 'Dengue' || c.disease === 'Malaria') {
        return { ...c, cases: c.cases + 5, trend: 'Increasing', risk: 'High', lastUpdated: Date.now() };
      }
      return c;
    });
    createAuditEvent(db, {
      eventType: 'SEASONAL_CALIBRATION',
      title: 'Seasonal Forecast Calibrated',
      description: 'System set to Rainy Season. Raising Dengue and Malaria projection factors.',
      actor: 'Meteorological Integration',
      severity: 'info'
    });

  } else if (eventType === 'medicine_shortage') {
    db.predictiveInventory = [
      {"id": "inv_1", "item": "IV Fluids", "available": 12, "required": 150, "unit": "bags", "status": "Critical"},
      {"id": "inv_2", "item": "Paracetamol", "available": 450, "required": 400, "unit": "tablets", "status": "Safe"},
      {"id": "inv_3", "item": "Dengue Test Kits", "available": 2, "required": 50, "unit": "kits", "status": "Critical"},
      {"id": "inv_4", "item": "IV Cannulas", "available": 190, "required": 180, "unit": "units", "status": "Safe"}
    ];
    createAuditEvent(db, {
      eventType: 'SUPPLY_SHORTAGE_DETECTED',
      title: 'Critical Inventory Shortage',
      description: 'IV Fluids and Dengue Test Kits fell below critical safety stock baseline.',
      actor: 'Supply Chain Tracker',
      severity: 'critical'
    });

  } else if (eventType === 'patient_surge') {
    let count = 0;
    db.bed = db.bed.map(b => {
      if (!b.occupied && count < 4) {
        count++;
        return { ...b, occupied: true, mrn: 'MOCK_SURGE_' + count, timestamp: Date.now() };
      }
      return b;
    });
    createAuditEvent(db, {
      eventType: 'WARD_SURGE_STRAIN',
      title: 'Patient Surge Detected',
      description: 'Incoming admissions filled emergency and ward beds. Available capacity strained.',
      actor: 'HIS Admissions Monitor',
      severity: 'critical'
    });
  }

  evaluateAlerts(db);
  writeDB(db);
  res.json({ message: "Demo event simulated", db });
});

// 16. Reset database simulation state
app.post('/api/demo/reset', (req, res) => {
  const defaultDb = {
    his: [
      { mrn: '48192', patientName: 'Sarah Miller', status: 'Admitted', timestamp: Date.now() - 4 * 3600 * 1000 },
      { mrn: '29381', patientName: 'John Davis', status: 'Discharged', timestamp: Date.now() - 2.5 * 3600 * 1000 },
      { mrn: '84920', patientName: 'Robert Chen', status: 'Admitted', timestamp: Date.now() - 1 * 3600 * 1000 },
      { mrn: '10928', patientName: 'Emily Taylor', status: 'Discharged', timestamp: Date.now() - 3.2 * 3600 * 1000 },
      { mrn: '74829', patientName: 'Michael Brown', status: 'Admitted', timestamp: Date.now() - 30 * 60 * 1000 },
      { mrn: '58392', patientName: 'Jessica Adams', status: 'Admitted', timestamp: Date.now() - 15 * 60 * 1000 }
    ],
    lab: [
      { mrn: '48192', testType: 'STAT Troponin', orderTime: Date.now() - 35 * 60 * 1000, elapsedTime: 35, priority: 'STAT', status: 'completed' },
      { mrn: '84920', testType: 'Routine CBC', orderTime: Date.now() - 50 * 60 * 1000, elapsedTime: 50, priority: 'Routine', status: 'completed' },
      { mrn: '58392', testType: 'STAT Metabolic', orderTime: Date.now() - 40 * 60 * 1000, elapsedTime: 40, priority: 'STAT', status: 'pending' },
      { mrn: '74829', testType: 'Routine Lipid', orderTime: Date.now() - 20 * 60 * 1000, elapsedTime: 20, priority: 'Routine', status: 'pending' }
    ],
    bed: [
      { bedId: 'Bed-101', ward: '3A', mrn: '48192', occupied: true, timestamp: Date.now() - 4 * 3600 * 1000 },
      { bedId: 'Bed-102', ward: '3A', mrn: null, occupied: false, timestamp: Date.now() - 12 * 3600 * 1000 },
      { bedId: 'Bed-302', ward: '3B', mrn: '29381', occupied: true, timestamp: Date.now() - 24 * 3600 * 1000 },
      { bedId: 'Bed-303', ward: '3B', mrn: '84920', occupied: true, timestamp: Date.now() - 1 * 3600 * 1000 },
      { bedId: 'Bed-404', ward: '4C', mrn: '10928', occupied: true, timestamp: Date.now() - 18 * 3600 * 1000 },
      { bedId: 'Bed-405', ward: '4C', mrn: '74829', occupied: true, timestamp: Date.now() - 30 * 60 * 1000 },
      { bedId: 'Bed-501', ward: '5D', mrn: '58392', occupied: true, timestamp: Date.now() - 15 * 60 * 1000 }
    ],
    activeConflicts: [
      {
        id: 'CF-2041',
        mrn: '29381',
        patientName: 'John Davis',
        type: 'Bed Occupancy Mismatch',
        severity: 'critical',
        description: 'Patient John Davis is discharged in HIS register, but Ward Bed-302 is still marked as Occupied in nursing log.',
        sourceData: { his: 'Discharged', lab: 'Completed', bed: 'Occupied' },
        suggestionText: 'HIS records discharge and final LIS panels are completed. Discrepancy is likely due to nursing latency in vacating the bed board. Recommendation: Approve HIS status and clear Bed-302.',
        confidence: 92,
        resolutionOptions: [
          { label: 'Vacate Bed-302 (Approve HIS)', actionKey: 'approve_his', recommended: true },
          { label: 'Re-Admit John Davis (Approve Bed Board)', actionKey: 'approve_bed', recommended: false }
        ]
      },
      {
        id: 'CF-2043',
        mrn: '10928',
        patientName: 'Emily Taylor',
        type: 'Critical Discharge Sync Lag',
        severity: 'critical',
        description: 'Patient Emily Taylor discharged in HIS 3 hours ago, but Bed-404 is still marked Occupied. Potential operational bottleneck.',
        sourceData: { his: 'Discharged', lab: 'Completed', bed: 'Occupied' },
        suggestionText: 'Patient has physically left the ward. Bed remains locked due to delayed cleaning reporting. Recommendation: Evict bed board MRN and vacate Bed-404.',
        confidence: 96,
        resolutionOptions: [
          { label: 'Evict Bed-404 (Approve HIS)', actionKey: 'approve_his', recommended: true },
          { label: 'Restore Admission Status (Approve Bed Board)', actionKey: 'approve_bed', recommended: false }
        ]
      }
    ],
    alerts: [
      {
        id: 'al-101',
        title: 'Data Trust Score dropped below 80',
        message: 'Overall data trust score has dropped below the threshold of 80% due to repeated manual Bed Board overrides.',
        severity: 'critical',
        details: { label: 'Current Score', value: '76 / 100' },
        actionLabel: 'Review Data Sources',
        actionKey: 'trust',
        timestamp: Date.now() - 10 * 60 * 1000
      },
      {
        id: 'al-102',
        title: 'Bed Data Conflict Rate Increased',
        message: 'Discrepancy incidents between HIS and nursing bed logs surged in Ward C.',
        severity: 'high',
        details: { label: 'Location', value: 'Ward C' },
        variance: { label: 'Conflict Delta', value: '4% ➔ 13%' },
        actionLabel: 'Investigate Pattern',
        actionKey: 'conflicts',
        timestamp: Date.now() - 25 * 60 * 1000
      },
      {
        id: 'al-103',
        title: 'Laboratory Turnaround Time Exceeded Threshold',
        message: 'Average turnaround SLA query limits exceeded for Radiology STAT testing.',
        severity: 'warning',
        details: { label: 'Department', value: 'Radiology' },
        stats: { current: '5.8 hours', threshold: '5 hours' },
        actionLabel: 'View Performance',
        actionKey: 'operations',
        timestamp: Date.now() - 45 * 60 * 1000
      }
    ],
    auditLog: [
      { timestamp: Date.now() - 2 * 3600 * 1000, action: 'HL7 Sync Completed', target: 'HIS admissions', details: 'Fetched 6 new admission/discharge events. Epic hook verified.', resolvedBy: 'System Engine', hash: 'sha256:d8a2c1f...' },
      { timestamp: Date.now() - 1.5 * 3600 * 1000, action: 'Conflict Auto-Resolved', target: 'Lab Turnaround', details: 'Auto-matched MRN-48192 STAT test with admissions record.', resolvedBy: 'Rules Engine R-02', hash: 'sha256:9f4c3a2...' },
      { timestamp: Date.now() - 45 * 60 * 1000, action: 'Manual Override Resolved', target: 'Manual Bed Board', details: 'Resolved Bed occupancy dispute for Bed-101 (MRN-48192).', resolvedBy: 'Sarah Jenkins', hash: 'sha256:e7a9b1c...' }
    ],
    trustScores: {
      his: 96,
      lab: 94,
      bed: 79,
      overall: 88
    },
    labStats: {
      averageTat: 2.4,
      delayedCount: 3
    },
    rules: {
      bedDischargeThreshold: 2,
      labTatThreshold: 60,
      primaryPrecedence: 'his'
    },
    settings: {
      labDelay: false,
      bedLag: false,
      running: true
    },
    predictiveSeason: 'Rainy',
    predictiveClusters: [
      {
        id: "cluster_1",
        area: "Patia",
        disease: "Dengue",
        cases: 27,
        trend: "Increasing",
        risk: "High",
        lastUpdated: Date.now()
      },
      {
        id: "cluster_2",
        area: "Chandrasekharpur",
        disease: "Viral Fever",
        cases: 18,
        trend: "Increasing",
        risk: "Medium",
        lastUpdated: Date.now()
      }
    ],
    predictiveInventory: [
      {"id": "inv_1", "item": "IV Fluids", "available": 120, "required": 150, "unit": "bags", "status": "Warning"},
      {"id": "inv_2", "item": "Paracetamol", "available": 500, "required": 400, "unit": "tablets", "status": "Safe"},
      {"id": "inv_3", "item": "Dengue Test Kits", "available": 15, "required": 50, "unit": "kits", "status": "Critical"},
      {"id": "inv_4", "item": "IV Cannulas", "available": 200, "required": 180, "unit": "units", "status": "Safe"}
    ]
  };

  createAuditEvent(defaultDb, {
    eventType: 'DEMO_RESET',
    title: 'Demo Environment Reset',
    description: 'Demo environment reset successfully.',
    actor: 'System Admin',
    severity: 'info'
  });

  evaluateAlerts(defaultDb);
  writeDB(defaultDb);
  res.json({ message: "Simulation reset successfully", db: defaultDb });
});

// Start Background Clock Tick Loop representing live syncing
setInterval(() => {
  const db = readDB();
  if (!db || !db.settings || !db.settings.running) return;

  let stateChanged = false;

  // 1. Increment Lab elapsed time for pending lab orders
  db.lab = db.lab.map(l => {
    if (l.status === 'pending') {
      const newElapsed = l.elapsedTime + 1;
      stateChanged = true;
      
      // Auto delay warning
      if (newElapsed === db.rules.labTatThreshold) {
        db.alerts.unshift({
          id: `alert-auto-tat-${Date.now()}`,
          title: 'STAT Test Delay Warning',
          message: `Patient LIS order (${l.testType}) elapsed time reaches ${newElapsed}m threshold.`,
          severity: 'warning',
          source: 'Rules System',
          timestamp: Date.now()
        });
      }
      return { ...l, elapsedTime: newElapsed };
    }
    return l;
  });

  // 2. Periodically add heartbeat sync events into the audit log
  if (Math.random() < 0.25) {
    stateChanged = true;
    db.auditLog.unshift({
      timestamp: Date.now(),
      action: 'Dynamic Heartbeat Sync',
      target: 'Background Daemon',
      details: 'Reconciliation engine scanned 3 operational data streams. 0 new discrepancies found. Sync latency nominal.',
      resolvedBy: 'System Daemon',
      hash: `sha256:${Math.random().toString(16).substring(2, 10)}d8f`
    });
    // Truncate audit log
    db.auditLog = db.auditLog.slice(0, 15);
  }

  if (stateChanged) {
    writeDB(db);
  }
}, 5000);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Express REST API Server running on port ${PORT}`);
});
