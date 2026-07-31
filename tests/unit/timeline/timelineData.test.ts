/**
 * Unit tests for Cipher Relationship Graph data (lib/timeline/timelineData.ts).
 *
 * Validates:
 * - All nodes have valid, unique IDs
 * - All edges reference existing node IDs (no dangling references)
 * - Helper functions return correct results
 * - All CIPHER_REGISTRY entries have a corresponding graph node
 * - Orphan detection works as expected
 */

import { describe, expect, it } from 'vitest';
import {
  buildAllNodes,
  getCipherById,
  getCiphersByCategory,
  getRelatedEdges,
  getNeighbourIds,
  getGraphData,
  getOrphanNodeIds,
  buildRelationshipGraphManualChecklist,
  CIPHER_RELATIONSHIP_EDGES,
  type CipherNode,
  type CipherEdge,
} from '@/lib/timeline/timelineData';
import { CIPHER_REGISTRY } from '@/lib/cipher/registry';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const { nodes, edges } = getGraphData();
const nodeIds = new Set(nodes.map((n) => n.id));

// ---------------------------------------------------------------------------
// Node data integrity
// ---------------------------------------------------------------------------

describe('Cipher Relationship Graph — node data integrity', () => {
  it('builds nodes from CIPHER_REGISTRY', () => {
    const allNodes = buildAllNodes();
    expect(allNodes.length).toBeGreaterThanOrEqual(CIPHER_REGISTRY.length);
  });

  it('every node has a unique id', () => {
    const ids = nodes.map((n) => n.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('every node has a valid category', () => {
    const validCategories: CipherNode['category'][] = ['classical', 'symmetric', 'hash', 'asymmetric'];
    for (const node of nodes) {
      expect(validCategories).toContain(node.category);
    }
  });

  it('every node has a valid security status', () => {
    const validStatuses = ['recommended', 'secure', 'experimental', 'legacy', 'deprecated', 'broken'];
    for (const node of nodes) {
      expect(validStatuses).toContain(node.status);
    }
  });

  it('every node has a year assigned', () => {
    for (const node of nodes) {
      expect(typeof node.year).toBe('number');
      // Year should be reasonable (between -1000 and 2030)
      expect(node.year).toBeGreaterThanOrEqual(-1000);
      expect(node.year).toBeLessThanOrEqual(2030);
    }
  });

  it('every CIPHER_REGISTRY entry has a corresponding graph node', () => {
    for (const entry of CIPHER_REGISTRY) {
      expect(nodeIds.has(entry.id)).toBe(true);
    }
  });

  it('every node has non-empty metadata.tags', () => {
    for (const node of nodes) {
      expect(node.metadata.tags.length).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Edge data integrity
// ---------------------------------------------------------------------------

describe('Cipher Relationship Graph — edge data integrity', () => {
  it('every edge references existing source and target nodes', () => {
    for (const edge of CIPHER_RELATIONSHIP_EDGES) {
      expect(nodeIds.has(edge.source)).toBe(true);
      expect(nodeIds.has(edge.target)).toBe(true);
    }
  });

  it('every edge has a valid relationship type', () => {
    const validTypes = [
      'evolved_from',
      'influenced_by',
      'based_on',
      'variant_of',
      'predecessor_of',
      'standardized_by',
      'competes_with',
      'broken_by',
    ];
    for (const edge of CIPHER_RELATIONSHIP_EDGES) {
      expect(validTypes).toContain(edge.type);
    }
  });

  it('every edge has a non-empty label', () => {
    for (const edge of CIPHER_RELATIONSHIP_EDGES) {
      expect(edge.label.trim().length).toBeGreaterThan(0);
    }
  });

  it('no duplicate edges (same source + target + type)', () => {
    const edgeKeys = CIPHER_RELATIONSHIP_EDGES.map(
      (e) => `${e.source}->${e.target}:${e.type}`,
    );
    const uniqueKeys = new Set(edgeKeys);
    expect(uniqueKeys.size).toBe(edgeKeys.length);
  });

  it('edges are stored in the exported constant', () => {
    expect(CIPHER_RELATIONSHIP_EDGES.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

describe('Cipher Relationship Graph — helper functions', () => {
  it('getCipherById returns the correct node', () => {
    const aes = getCipherById(nodes, 'aes');
    expect(aes).toBeDefined();
    expect(aes!.name).toContain('AES');

    const unknown = getCipherById(nodes, 'nonexistent-cipher');
    expect(unknown).toBeUndefined();
  });

  it('getCiphersByCategory filters correctly', () => {
    const classicalNodes = getCiphersByCategory(nodes, 'classical');
    expect(classicalNodes.length).toBeGreaterThan(0);
    for (const node of classicalNodes) {
      expect(node.category).toBe('classical');
    }

    const hashNodes = getCiphersByCategory(nodes, 'hash');
    expect(hashNodes.length).toBeGreaterThan(0);
    for (const node of hashNodes) {
      expect(node.category).toBe('hash');
    }
  });

  it('getRelatedEdges returns edges for a node', () => {
    const aesEdges = getRelatedEdges(edges, 'aes');
    expect(aesEdges.length).toBeGreaterThan(0);
    // AES should have edges to its variants (AES-XTS, AES-GCM, AES-CCM)
    const variantEdges = aesEdges.filter(
      (e) => e.type === 'variant_of' || e.type === 'competes_with',
    );
    expect(variantEdges.length).toBeGreaterThan(0);
  });

  it('getRelatedEdges returns no edges for an unconnected node', () => {
    // Note: This test will only pass if there are indeed orphan nodes
    const orphans = getOrphanNodeIds(nodes, edges);
    if (orphans.length > 0) {
      const orphanEdges = getRelatedEdges(edges, orphans[0]);
      expect(orphanEdges).toHaveLength(0);
    }
  });

  it('getNeighbourIds returns connected node ids', () => {
    const aesNeighbours = getNeighbourIds(edges, 'aes');
    expect(aesNeighbours.length).toBeGreaterThan(0);
    // AES neighbours should include DES (predecessor)
    expect(aesNeighbours).toContain('des');
  });

  it('getNeighbourIds does not include the node itself', () => {
    const aesNeighbours = getNeighbourIds(edges, 'aes');
    expect(aesNeighbours).not.toContain('aes');
  });

  it('getGraphData returns complete data', () => {
    const data = getGraphData();
    expect(data.nodes.length).toBe(nodes.length);
    expect(data.edges.length).toBe(edges.length);
  });
});

// ---------------------------------------------------------------------------
// Orphan detection
// ---------------------------------------------------------------------------

describe('Cipher Relationship Graph — orphan detection', () => {
  it('getOrphanNodeIds returns ids of nodes with no edges', () => {
    const orphans = getOrphanNodeIds(nodes, edges);
    // Some ciphers may not have relationships defined yet
    expect(Array.isArray(orphans)).toBe(true);
    for (const orphanId of orphans) {
      const relatedEdges = getRelatedEdges(edges, orphanId);
      expect(relatedEdges).toHaveLength(0);
    }
  });

  it('a node with edges is not an orphan', () => {
    const orphans = new Set(getOrphanNodeIds(nodes, edges));
    expect(orphans.has('aes')).toBe(false);
    expect(orphans.has('des')).toBe(false);
    expect(orphans.has('sha256')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Manual testing checklist
// ---------------------------------------------------------------------------

describe('Cipher Relationship Graph — manual checklist', () => {
  it('buildRelationshipGraphManualChecklist returns actionable items', () => {
    const checklist = buildRelationshipGraphManualChecklist();
    expect(checklist.length).toBeGreaterThan(0);
    expect(checklist[0]).toMatch(/open|navigate|confirm/i);
  });
});

// ---------------------------------------------------------------------------
// Category distribution (smoke tests)
// ---------------------------------------------------------------------------

describe('Cipher Relationship Graph — category distribution', () => {
  it('has nodes in all four categories', () => {
    const categories = new Set(nodes.map((n) => n.category));
    expect(categories.has('classical')).toBe(true);
    expect(categories.has('symmetric')).toBe(true);
    expect(categories.has('hash')).toBe(true);
    expect(categories.has('asymmetric')).toBe(true);
  });

  it('has at least 10 symmetric cipher nodes', () => {
    const symmetricNodes = getCiphersByCategory(nodes, 'symmetric');
    expect(symmetricNodes.length).toBeGreaterThanOrEqual(10);
  });

  it('has at least 10 asymmetric cipher nodes', () => {
    const asymmetricNodes = getCiphersByCategory(nodes, 'asymmetric');
    expect(asymmetricNodes.length).toBeGreaterThanOrEqual(10);
  });
});

