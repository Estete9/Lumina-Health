import { searchGlobalResources } from '../../lib/services/searchService';

describe('Sprint 6: Global Header Real-Time Search Unit Tests', () => {
  it('should search case-insensitively and strip @ symbol from tags', async () => {
    // Search with leading @ symbol for Panic tag/ailment in mock data
    const resTag = await searchGlobalResources('@Panic');
    expect(resTag.error).toBeNull();
    expect(resTag.data).toBeDefined();
    expect(resTag.data?.length).toBeGreaterThan(0);

    // Search case-insensitively for patient Elena
    const resName = await searchGlobalResources('elena');
    expect(resName.error).toBeNull();
    expect(resName.data?.some(item => item.title.toLowerCase().includes('elena'))).toBe(true);
  });
});
