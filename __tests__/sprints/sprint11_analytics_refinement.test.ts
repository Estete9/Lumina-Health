import { getDecisionAnalyticsHubData, computePracticeDynamicsFromServices } from '../../lib/services/analyticsService';

describe('Sprint 11: Analytics Refinement', () => {
  it('should return enriched billableMetrics and documentationCompliance from computePracticeDynamicsFromServices', async () => {
    const data = await computePracticeDynamicsFromServices('prac-1');
    expect(data.billableMetrics).toBeDefined();
    expect(data.billableMetrics?.totalBillableHours).toBeDefined();
    expect(data.billableMetrics?.monthlyTargetHours).toBeDefined();
    expect(data.billableMetrics?.billablePercentage).toBeDefined();

    expect(data.documentationCompliance).toBeDefined();
    expect(data.documentationCompliance?.avgTurnaroundHours).toBeDefined();
    expect(data.documentationCompliance?.compliancePercentage).toBeDefined();
    expect(data.documentationCompliance?.pendingNotesCount).toBeDefined();
    expect(data.documentationCompliance?.targetTurnaroundHours).toBeDefined();
  });

  it('should include enriched practice dynamics in getDecisionAnalyticsHubData', async () => {
    const response = await getDecisionAnalyticsHubData('prac-1');
    expect(response.error).toBeNull();
    expect(response.data).toBeDefined();
    
    const practiceDynamics = response.data?.practiceDynamics;
    expect(practiceDynamics).toBeDefined();
    
    expect(practiceDynamics?.billableMetrics).toBeDefined();
    expect(practiceDynamics?.documentationCompliance).toBeDefined();
  });
});
